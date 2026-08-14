/**
 * EmailSender - Envio de e-mails transacionais
 *
 * Ordem de configuração SMTP (v3.3.2):
 *   1. Configurações salvas no PAINEL (/configuracoes → Portal do Cliente),
 *      gravadas em system_settings (client_portal_smtp_*)
 *   2. Variáveis de ambiente (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM...)
 *
 * Se nenhuma estiver completa, salva o "envio" no log do sistema e retorna
 * sucesso em modo "logged" (dev/demo) — o e-mail NÃO é entregue de verdade.
 */

import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { inArray } from "drizzle-orm";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mode: "smtp" | "logged";
}

export interface SmtpConfig {
  host?: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
  secure: boolean;
  source: "painel" | "env" | "none";
}

let smtpModuleCache: any = null;

const SMTP_KEYS = [
  "client_portal_smtp_host",
  "client_portal_smtp_port",
  "client_portal_smtp_user",
  "client_portal_smtp_pass",
  "client_portal_smtp_from",
  "client_portal_smtp_secure",
];

/**
 * Resolve a configuração SMTP: painel (banco) primeiro, env como fallback.
 */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  // 1. Tenta o painel (system_settings)
  try {
    const rows = await db
      .select()
      .from(systemSettings)
      .where(inArray(systemSettings.key, SMTP_KEYS));
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (r.key && r.value) map[r.key] = r.value;
    }
    if (map["client_portal_smtp_host"] && map["client_portal_smtp_user"] && map["client_portal_smtp_pass"]) {
      return {
        host: map["client_portal_smtp_host"],
        port: parseInt(map["client_portal_smtp_port"] || "587", 10),
        user: map["client_portal_smtp_user"],
        pass: map["client_portal_smtp_pass"],
        from: map["client_portal_smtp_from"] || map["client_portal_smtp_user"],
        secure: map["client_portal_smtp_secure"] === "true",
        source: "painel",
      };
    }
  } catch {
    // banco indisponível — cai para env
  }

  // 2. Variáveis de ambiente
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      secure: process.env.SMTP_SECURE === "true",
      source: "env",
    };
  }

  return {
    port: 587,
    from: "noreply@printflow.com.br",
    secure: false,
    source: "none",
  };
}

async function loadSmtpModule(): Promise<any> {
  if (smtpModuleCache !== null) return smtpModuleCache;
  // Carrega nodemailer dinamicamente (sem análise estática do webpack)
  const moduleName = "node" + "mailer";
  try {
    const dynamicImport = new Function("m", "return import(m)");
    const mod = await dynamicImport(moduleName).catch(() => null);
    smtpModuleCache = mod;
  } catch {
    smtpModuleCache = null;
  }
  return smtpModuleCache;
}

/**
 * Testa a conexão SMTP com a configuração atual (painel ou env).
 * Retorna detalhes do que está configurado e se autenticou no servidor.
 */
export async function verifySmtpConnection(): Promise<{
  ok: boolean;
  source: string;
  host?: string;
  from?: string;
  error?: string;
}> {
  const config = await getSmtpConfig();
  if (config.source === "none") {
    return {
      ok: false,
      source: "none",
      error:
        "SMTP não configurado. Preencha Host, Usuário e Senha no painel, ou defina SMTP_HOST/SMTP_USER/SMTP_PASS no ambiente.",
    };
  }
  const nodemailer = await loadSmtpModule();
  if (!nodemailer) {
    return {
      ok: false,
      source: config.source,
      host: config.host,
      error: "Pacote nodemailer não instalado. Execute: npm install nodemailer --legacy-peer-deps",
    };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 10000,
    });
    await transporter.verify();
    return { ok: true, source: config.source, host: config.host, from: config.from };
  } catch (error) {
    return {
      ok: false,
      source: config.source,
      host: config.host,
      error: String(error),
    };
  }
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const smtpConfig = await getSmtpConfig();

  // Tenta enviar via SMTP se configurado
  if (smtpConfig.source !== "none") {
    const nodemailer = await loadSmtpModule();
    if (nodemailer) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          auth: { user: smtpConfig.user, pass: smtpConfig.pass },
          connectionTimeout: 10000,
        });

        const info = await transporter.sendMail({
          from: smtpConfig.from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text || input.html.replace(/<[^>]*>/g, ""),
        });

        console.log(`[EMAIL SMTP:${smtpConfig.source}] ${input.subject} → ${input.to} (${info.messageId})`);
        return {
          success: true,
          messageId: info.messageId,
          mode: "smtp",
        };
      } catch (error) {
        console.error("SMTP send failed, falling back to log:", error);
        // Cai no fallback de log abaixo
      }
    }
  }

  // Fallback: log no sistema (modo dev/demo)
  try {
    const messageId = `logged_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const logEntry = {
      messageId,
      to: input.to,
      subject: input.subject,
      sentAt: new Date().toISOString(),
      bodyLength: input.html.length,
      preview: input.text?.slice(0, 200) || input.html.replace(/<[^>]*>/g, "").slice(0, 200),
    };

    // Salva em system_settings (chave única por messageId)
    await db.insert(systemSettings).values({
      key: `email_log:${messageId}`,
      value: JSON.stringify(logEntry),
      category: "email_log",
    });

    console.log(`[EMAIL LOG] ${input.subject} → ${input.to} (${input.html.length} bytes)`);

    return { success: true, messageId, mode: "logged" };
  } catch (error) {
    console.error("Email log failed:", error);
    return {
      success: false,
      error: String(error),
      mode: "logged",
    };
  }
}
