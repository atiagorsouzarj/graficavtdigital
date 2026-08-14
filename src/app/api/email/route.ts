import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/validation";
import { sendEmail } from "@/lib/emailSender";
import { renderEmailTemplate, renderTemplateContent } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

/**
 * POST /api/email — Envio transacional REAL (v3.3.3)
 *
 * Usa o mesmo motor SMTP do Portal do Cliente (lib/emailSender):
 * configurações do painel (client_portal_smtp_*) ou variáveis de ambiente.
 * Sem SMTP configurado, o envio cai no modo "logged" (não entregue).
 *
 * Modos de uso:
 *
 * 1) Por template salvo no banco:
 *    { "to": "x@y.com", "templateCode": "email_quote_sent",
 *      "variables": { "nome_cliente": "Maria", "codigo_pedido": "PED-1", ... } }
 *
 * 2) Conteúdo direto (ex.: botão "Testar Disparo" do editor):
 *    { "to": "x@y.com", "subject": "Assunto {{nome_cliente}}", "body": "Olá...",
 *      "variables": { ... } }
 */
export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
    }

    const to = String(body.to || "").trim();
    const templateCode = String(body.templateCode || "").trim();
    const subject = String(body.subject || "").trim();
    const rawBody = String(body.body || "").trim();
    const variables = (body.variables && typeof body.variables === "object"
      ? (body.variables as Record<string, string>)
      : {}) as Record<string, string>;

    if (!to || !validateEmail(to)) {
      return NextResponse.json({ error: "Destinatário (to) inválido." }, { status: 400 });
    }

    // Variáveis de exemplo para testes (quando não informadas)
    const vars = {
      nome_cliente: "Cliente Exemplo",
      codigo_pedido: "PED-000102",
      valor_total: "R$ 250,00",
      ...variables,
    };

    let rendered;
    if (templateCode) {
      rendered = await renderEmailTemplate(templateCode, vars);
      if (!rendered) {
        return NextResponse.json(
          { error: `Template '${templateCode}' não encontrado ou inativo.` },
          { status: 404 }
        );
      }
    } else if (subject || rawBody) {
      rendered = await renderTemplateContent(
        subject || "Mensagem da Gráfica",
        rawBody || "(sem conteúdo)",
        vars
      );
    } else {
      return NextResponse.json(
        { error: "Informe 'templateCode' OU 'subject'/'body' para envio." },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    if (result.success && result.mode === "smtp") {
      return NextResponse.json({
        success: true,
        mode: "smtp",
        messageId: result.messageId,
        recipient: to,
        subject: rendered.subject,
        status: "sent",
        timestamp: new Date().toISOString(),
      });
    }

    // Caiu no modo log — avisa com transparência (não fingimos entrega)
    return NextResponse.json(
      {
        success: false,
        mode: result.mode,
        recipient: to,
        subject: rendered.subject,
        status: "logged_only",
        error:
          "SMTP não configurado ou indisponível — o e-mail foi apenas registrado no log e NÃO foi entregue. " +
          "Configure em /configuracoes → Portal do Cliente → E-mail do Portal (SMTP).",
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
