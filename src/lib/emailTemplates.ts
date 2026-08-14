/**
 * EmailTemplates - Renderização de templates transacionais (v3.3.3)
 *
 * - Busca templates da tabela communication_templates (canal 'email')
 * - Substitui variáveis dinâmicas ({{nome_cliente}}, {{codigo_pedido}}, ...)
 * - Aplica o layout HTML corporativo com os dados reais da empresa
 *   (system_settings: company_name, company_trade_name, etc.)
 */

import { db } from "@/db";
import { communicationTemplates, systemSettings } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export type TemplateVariables = Record<string, string | number | undefined>;

const COMPANY_KEYS = [
  "company_name",
  "company_trade_name",
  "company_phone",
  "company_whatsapp",
  "company_email",
  "company_address",
  "company_number",
  "company_neighborhood",
  "company_city",
  "company_uf",
];

async function getCompanyInfo(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const rows = await db
      .select()
      .from(systemSettings)
      .where(inArray(systemSettings.key, COMPANY_KEYS));
    for (const r of rows) {
      if (r.key && r.value) map[r.key] = r.value;
    }
  } catch {
    /* usa defaults abaixo */
  }
  return map;
}

/**
 * Substitui {{variavel}} pelos valores informados.
 * Variáveis sem valor ficam visíveis para facilitar o debug ("[variavel]").
 */
export function replaceVariables(text: string, vars: TemplateVariables): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, name: string) => {
    const v = vars[name];
    return v !== undefined && v !== null ? String(v) : `[${name}]`;
  });
}

/**
 * Layout HTML corporativo — mesmo visual do preview da página /email-templates,
 * com os dados reais da empresa vindos do Painel de Controle.
 */
export function buildCorporateHtml(options: {
  companyName: string;
  companySubtitle: string;
  badge?: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerLines?: string[];
}): string {
  const {
    companyName,
    companySubtitle,
    badge,
    title,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    footerLines = [],
  } = options;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
    <div style="padding:20px 24px;border-bottom:1px solid #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <div style="font-size:18px;font-weight:900;color:#0369a1;">${companyName}</div>
          <div style="font-size:10px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${companySubtitle}</div>
        </td>
        ${badge ? `<td align="right"><span style="background:#e0f2fe;color:#075985;font-family:monospace;font-weight:bold;font-size:11px;padding:4px 10px;border-radius:6px;">${badge}</span></td>` : ""}
      </tr></table>
    </div>
    <div style="padding:24px;">
      <h2 style="margin:0 0 12px 0;font-size:16px;color:#0f172a;">${title}</h2>
      <div style="font-size:13px;line-height:1.7;color:#475569;">${bodyHtml}</div>
      ${
        ctaLabel && ctaUrl
          ? `<div style="text-align:center;padding:20px 0 8px 0;">
               <a href="${ctaUrl}" style="display:inline-block;background:#0284c7;color:#ffffff;font-weight:800;font-size:13px;padding:12px 28px;border-radius:10px;text-decoration:none;">${ctaLabel}</a>
             </div>`
          : ""
      }
    </div>
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      ${footerLines.map((l) => `<div style="font-size:10px;color:#94a3b8;line-height:1.6;">${l}</div>`).join("")}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Renderiza um template do banco (por code) com variáveis + layout corporativo.
 */
export async function renderEmailTemplate(
  templateCode: string,
  vars: TemplateVariables
): Promise<RenderedEmail | null> {
  const [tpl] = await db
    .select()
    .from(communicationTemplates)
    .where(
      and(
        eq(communicationTemplates.code, templateCode),
        eq(communicationTemplates.active, true)
      )
    );

  if (!tpl) return null;
  return renderTemplateContent(tpl.subject || tpl.title, tpl.body, vars);
}

/**
 * Renderiza assunto+corpo arbitrários (ex.: teste do editor antes de salvar).
 */
export async function renderTemplateContent(
  subjectRaw: string,
  bodyRaw: string,
  vars: TemplateVariables
): Promise<RenderedEmail> {
  const company = await getCompanyInfo();
  const companyName = company.company_trade_name || company.company_name || "PrintFlow ERP";

  const allVars: TemplateVariables = {
    empresa_nome: companyName,
    empresa_telefone: company.company_phone,
    empresa_whatsapp: company.company_whatsapp,
    empresa_email: company.company_email,
    ...vars,
  };

  const subject = replaceVariables(subjectRaw, allVars);
  const bodyReplaced = replaceVariables(bodyRaw, allVars);

  // Se o corpo já tem HTML, usa direto; senão converte quebras de linha
  const isHtml = /<[a-z][\s\S]*>/i.test(bodyReplaced);
  const bodyHtml = isHtml ? bodyReplaced : bodyReplaced.replace(/\n/g, "<br/>");

  const address = [
    [company.company_address, company.company_number].filter(Boolean).join(", "),
    company.company_neighborhood,
    [company.company_city, company.company_uf].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(" • ");

  const html = buildCorporateHtml({
    companyName,
    companySubtitle: "Gráfica Rápida & Papelaria Personalizada",
    badge: vars.codigo_pedido ? String(vars.codigo_pedido) : undefined,
    title: subject,
    bodyHtml,
    ctaLabel: vars.link_aprovacao ? "Acessar Portal do Cliente" : undefined,
    ctaUrl: vars.link_aprovacao ? String(vars.link_aprovacao) : undefined,
    footerLines: [
      address || "",
      [company.company_phone, company.company_whatsapp && `WhatsApp: ${company.company_whatsapp}`]
        .filter(Boolean)
        .join(" • "),
      "E-mail transacional automático — não responda diretamente.",
    ].filter(Boolean),
  });

  const text = bodyReplaced.replace(/<[^>]*>/g, "");
  return { subject, html, text };
}
