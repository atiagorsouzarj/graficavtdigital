import { NextResponse } from "next/server";
import { verifySmtpConnection, sendEmail } from "@/lib/emailSender";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/client-portal/smtp-test
 * Verifica a conexão SMTP com a configuração atual (painel ou env).
 */
export async function GET() {
  const result = await verifySmtpConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

/**
 * POST /api/admin/client-portal/smtp-test
 * Body: { to: "email@dominio.com" }
 * Envia um e-mail de teste real para o endereço informado.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { to?: string };
    const to = String(body.to || "").trim();

    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return NextResponse.json(
        { error: "Informe um e-mail de destino válido." },
        { status: 400 }
      );
    }

    // Primeiro verifica a conexão para dar erro claro
    const check = await verifySmtpConnection();
    if (!check.ok) {
      return NextResponse.json(
        { success: false, mode: "none", error: check.error },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject: "✅ Teste SMTP - PrintFlow ERP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0284c7; margin-top: 0;">Teste de SMTP bem-sucedido! 🎉</h2>
          <p>Se você está lendo este e-mail, o servidor SMTP do <strong>PrintFlow ERP</strong> está configurado corretamente.</p>
          <ul style="color: #475569; font-size: 14px;">
            <li>Origem da configuração: <strong>${check.source === "painel" ? "Painel de Controle" : "Variáveis de ambiente"}</strong></li>
            <li>Servidor: <strong>${check.host || "-"}</strong></li>
            <li>Data do teste: <strong>${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</strong></li>
          </ul>
          <p style="color: #64748b; font-size: 12px;">Os códigos OTP do Portal do Cliente serão entregues por este mesmo canal.</p>
        </div>
      `,
      text: "Teste de SMTP bem-sucedido! O servidor SMTP do PrintFlow ERP está configurado corretamente.",
    });

    if (result.mode === "smtp" && result.success) {
      return NextResponse.json({
        success: true,
        mode: "smtp",
        messageId: result.messageId,
        message: `E-mail de teste enviado para ${to}. Verifique a caixa de entrada (e o spam).`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        mode: result.mode,
        error:
          result.error ||
          "O envio caiu no modo log (SMTP indisponível). Verifique host, porta, usuário e senha.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("smtp-test error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
