import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients, clientOtps, clientActivityLog } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { validateCPF, validateCNPJ } from "@/lib/validation";
import {
  generateOtpCode,
  hashOtp,
  maskEmail,
  OTP_TTL_MINUTES,
  OTP_RATE_LIMIT_PER_HOUR,
  getClientIp,
  getUserAgent,
  buildOtpEmailHtml,
  buildOtpEmailText,
} from "@/lib/clientAuth";
import { sendEmail } from "@/lib/emailSender";
import { isDemoMode } from "@/lib/demoMode";

export const dynamic = "force-dynamic";

/**
 * POST /api/cliente/auth/request-otp
 * Body: { cpfCnpj: "172.595.737-08" }
 *
 * - Valida o documento (CPF ou CNPJ)
 * - Busca o cliente no banco
 * - Rate limit: 3 OTPs por CPF por hora
 * - Gera código de 6 dígitos
 * - Salva com hash (expiresAt = now + 5min)
 * - Envia por e-mail (com fallback de log)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { cpfCnpj?: string };
    const docRaw = String(body.cpfCnpj || "").trim();
    const docClean = docRaw.replace(/\D/g, "");

    if (!docClean) {
      return NextResponse.json(
        { error: "Informe seu CPF ou CNPJ." },
        { status: 400 }
      );
    }

    // Valida o documento
    const isCPF = docClean.length === 11;
    const isCNPJ = docClean.length === 14;
    if (!isCPF && !isCNPJ) {
      return NextResponse.json(
        { error: "CPF deve ter 11 dígitos e CNPJ deve ter 14 dígitos." },
        { status: 400 }
      );
    }
    if (isCPF && !validateCPF(docClean)) {
      return NextResponse.json(
        { error: "CPF inválido. Verifique os números." },
        { status: 400 }
      );
    }
    if (isCNPJ && !validateCNPJ(docClean)) {
      return NextResponse.json(
        { error: "CNPJ inválido. Verifique os números." },
        { status: 400 }
      );
    }

    // Busca cliente por documento (normalizado: remove máscara de ambos os lados)
    const normalizedDoc = sql`regexp_replace(${clients.document}, '[^0-9]', '', 'g')`;
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(normalizedDoc, docClean));
    if (!client) {
      return NextResponse.json(
        {
          error:
            "CPF/CNPJ não encontrado no cadastro. Realize seu cadastro primeiro na área pública.",
        },
        { status: 404 }
      );
    }

    if (!client.email) {
      return NextResponse.json(
        {
          error:
            "Este cliente não possui e-mail cadastrado. Entre em contato com a gráfica para regularizar.",
        },
        { status: 400 }
      );
    }

    // Rate limit: 3 OTPs por CPF/CNPJ na última hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clientOtps)
      .where(
        and(
          eq(clientOtps.clientId, client.id),
          gt(clientOtps.createdAt, oneHourAgo)
        )
      );
    const otpCount = recentOtps[0]?.count ?? 0;
    if (otpCount >= OTP_RATE_LIMIT_PER_HOUR) {
      return NextResponse.json(
        {
          error:
            "Muitas tentativas. Aguarde alguns minutos antes de solicitar um novo código.",
        },
        { status: 429 }
      );
    }

    // Gera código
    const code = generateOtpCode();
    const codeHash = hashOtp(code, client.id);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    const ip = await getClientIp();
    const ua = await getUserAgent();

    await db.insert(clientOtps).values({
      clientId: client.id,
      codeHash,
      channel: "email",
      expiresAt,
      ipAddress: ip,
      userAgent: ua,
    });

    // Envia e-mail
    const emailResult = await sendEmail({
      to: client.email,
      subject: `Seu código de acesso PrintFlow - ${OTP_TTL_MINUTES} min`,
      html: buildOtpEmailHtml(code, client.name),
      text: buildOtpEmailText(code, client.name),
    });

    // Log de auditoria
    try {
      await db.insert(clientActivityLog).values({
        clientId: client.id,
        action: "otp_requested",
        resourceType: "auth",
        details: JSON.stringify({
          emailSent: emailResult.success,
          mode: emailResult.mode,
          messageId: emailResult.messageId,
        }),
        ipAddress: ip,
      });
    } catch {
      /* não crítico */
    }

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Não conseguimos enviar o e-mail agora. Tente novamente em instantes." },
        { status: 500 }
      );
    }

    // Modo demo: retorna o código na resposta para visualização interna
    const demoActive = await isDemoMode();

    return NextResponse.json({
      success: true,
      sentTo: maskEmail(client.email),
      expiresInMinutes: OTP_TTL_MINUTES,
      mode: emailResult.mode,
      // Em modo demo, o código é devolvido para o painel de teste
      ...(demoActive ? { demoCode: code } : {}),
    });
  } catch (error) {
    console.error("request-otp error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
