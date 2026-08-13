/**
 * EmailSender - Envio de e-mails transacionais
 *
 * Se SMTP estiver configurado (variáveis SMTP_HOST, SMTP_USER, SMTP_PASS,
 * SMTP_FROM), envia o e-mail real. Caso contrário, salva o "envio" no log
 * do sistema e retorna sucesso (modo dev/demo).
 */

import { db } from "@/db";
import { systemSettings } from "@/db/schema";

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

let smtpModuleCache: any = null;
let smtpConfigChecked = false;
let smtpAvailable = false;

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "noreply@printflow.com.br",
    secure: process.env.SMTP_SECURE === "true",
  };
}

async function loadSmtpModule(): Promise<any> {
  if (smtpModuleCache !== null) return smtpModuleCache;
  // Tenta carregar nodemailer dinamicamente (sem análise estática)
  const moduleName = "node" + "mailer"; // truque: evita webpack analisar
  try {
    const dynamicImport = new Function("m", "return import(m)");
    const mod = await dynamicImport(moduleName).catch(() => null);
    smtpModuleCache = mod;
  } catch {
    smtpModuleCache = null;
  }
  return smtpModuleCache;
}

async function isSmtpAvailable(): Promise<boolean> {
  if (smtpConfigChecked) return smtpAvailable;
  smtpConfigChecked = true;
  const config = getSmtpConfig();
  if (!config.host || !config.user || !config.pass) {
    smtpAvailable = false;
    return false;
  }
  const nodemailer = await loadSmtpModule();
  smtpAvailable = Boolean(nodemailer);
  return smtpAvailable;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const smtpConfig = getSmtpConfig();

  // Tenta enviar via SMTP se disponível
  if (await isSmtpAvailable()) {
    try {
      const nodemailer = await loadSmtpModule();
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: { user: smtpConfig.user, pass: smtpConfig.pass },
      });

      const info = await transporter.sendMail({
        from: smtpConfig.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text || input.html.replace(/<[^>]*>/g, ""),
      });

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
