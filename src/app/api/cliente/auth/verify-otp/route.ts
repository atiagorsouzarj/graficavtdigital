import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients, clientOtps, clientSessions, clientActivityLog } from "@/db/schema";
import { eq, and, desc, isNull, gt, sql } from "drizzle-orm";
import {
  hashOtp,
  createSessionToken,
  hashSessionToken,
  CLIENT_SESSION_COOKIE,
  CLIENT_SESSION_TTL_HOURS,
  CLIENT_REFRESH_TTL_DAYS,
  OTP_MAX_ATTEMPTS,
  OTP_BLOCK_MINUTES,
  getClientIp,
  getUserAgent,
} from "@/lib/clientAuth";

export const dynamic = "force-dynamic";

/**
 * POST /api/cliente/auth/verify-otp
 * Body: { cpfCnpj: "...", code: "123456" }
 *
 * - Valida código
 * - Cria sessão (cookie HttpOnly)
 * - 3 tentativas erradas → bloqueia por 15min
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      cpfCnpj?: string;
      code?: string;
    };

    const docRaw = String(body.cpfCnpj || "").trim();
    const docClean = docRaw.replace(/\D/g, "");
    const code = String(body.code || "").trim();

    if (!docRaw || !code) {
      return NextResponse.json(
        { error: "CPF/CNPJ e código são obrigatórios." },
        { status: 400 }
      );
    }

    if (!docClean) {
      return NextResponse.json(
        { error: "CPF/CNPJ inválido." },
        { status: 400 }
      );
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "O código deve ter exatamente 6 dígitos." },
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
        { error: "CPF/CNPJ não encontrado." },
        { status: 404 }
      );
    }

    // Busca OTP mais recente válido
    const [otp] = await db
      .select()
      .from(clientOtps)
      .where(
        and(
          eq(clientOtps.clientId, client.id),
          isNull(clientOtps.usedAt),
          gt(clientOtps.expiresAt, new Date())
        )
      )
      .orderBy(desc(clientOtps.createdAt))
      .limit(1);

    if (!otp) {
      return NextResponse.json(
        { error: "Código expirado ou não encontrado. Solicite um novo código." },
        { status: 410 }
      );
    }

    // Verifica bloqueio por excesso de tentativas
    if (otp.blockedUntil && otp.blockedUntil > new Date()) {
      const minutesLeft = Math.ceil((otp.blockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: `Muitas tentativas erradas. Tente novamente em ${minutesLeft} minutos.`,
        },
        { status: 429 }
      );
    }

    // Valida hash
    const expectedHash = hashOtp(code, client.id);
    if (otp.codeHash !== expectedHash) {
      const newAttempts = otp.attempts + 1;
      const updateData: Record<string, unknown> = { attempts: newAttempts };
      if (newAttempts >= OTP_MAX_ATTEMPTS) {
        updateData.blockedUntil = new Date(
          Date.now() + OTP_BLOCK_MINUTES * 60 * 1000
        );
      }
      await db
        .update(clientOtps)
        .set(updateData)
        .where(eq(clientOtps.id, otp.id));

      const remaining = OTP_MAX_ATTEMPTS - newAttempts;
      const msg =
        remaining > 0
          ? `Código incorreto. Você tem mais ${remaining} tentativa(s).`
          : `Código incorreto. Você excedeu o limite de tentativas. Tente novamente em ${OTP_BLOCK_MINUTES} minutos.`;

      return NextResponse.json({ error: msg }, { status: 401 });
    }

    // Código correto: marca como usado e cria sessão
    await db.update(clientOtps).set({ usedAt: new Date() }).where(eq(clientOtps.id, otp.id));

    const ip = await getClientIp();
    const ua = await getUserAgent();

    const sessionToken = createSessionToken(client.id, "TEMP"); // temp, atualizamos abaixo
    const tokenHash = hashSessionToken(sessionToken);

    const expiresAt = new Date(Date.now() + CLIENT_SESSION_TTL_HOURS * 60 * 60 * 1000);
    const refreshExpiresAt = new Date(
      Date.now() + CLIENT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
    );

    // Insere sessão e captura ID
    const [newSession] = await db
      .insert(clientSessions)
      .values({
        clientId: client.id,
        tokenHash,
        expiresAt,
        refreshExpiresAt,
        userAgent: ua,
        ipAddress: ip,
      })
      .returning({ id: clientSessions.id });

    // Re-cria o token com o ID correto
    const finalToken = createSessionToken(client.id, newSession.id);
    const finalHash = hashSessionToken(finalToken);
    await db
      .update(clientSessions)
      .set({ tokenHash: finalHash })
      .where(eq(clientSessions.id, newSession.id));

    // Log
    try {
      await db.insert(clientActivityLog).values({
        clientId: client.id,
        sessionId: newSession.id,
        action: "login_success",
        resourceType: "auth",
        ipAddress: ip,
      });
    } catch {
      /* não crítico */
    }

    // Seta cookie HttpOnly
    const response = NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        type: client.type,
        document: client.document,
      },
      expiresAt: expiresAt.toISOString(),
    });

    response.cookies.set(CLIENT_SESSION_COOKIE, finalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: CLIENT_SESSION_TTL_HOURS * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
