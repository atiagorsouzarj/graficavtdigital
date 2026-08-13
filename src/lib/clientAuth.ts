/**
 * ClientAuth - Helpers de autenticação para clientes
 *
 * Recursos:
 * - Hash SHA256 para OTPs (rápido, suficiente para código de 6 dígitos)
 * - Tokens de sessão com hash + JWT-like
 * - Validação de tokens públicos de uso único (arte, rastreio)
 */

import crypto from "crypto";
import { cookies, headers } from "next/headers";

export const CLIENT_SESSION_COOKIE = "pf_client_session";
export const CLIENT_SESSION_TTL_HOURS = 4; // 4 horas
export const CLIENT_REFRESH_TTL_DAYS = 7; // 7 dias para refresh
export const OTP_TTL_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_BLOCK_MINUTES = 15;
export const OTP_RATE_LIMIT_PER_HOUR = 3;
export const PUBLIC_TOKEN_TTL_DAYS = 14; // 14 dias para token de arte/rastreio

const SECRET =
  process.env.CLIENT_AUTH_SECRET ||
  process.env.SYSTEM_ADMIN_TOKEN ||
  "printflow-dev-secret-change-in-production";

/**
 * Gera código OTP de 6 dígitos
 */
export function generateOtpCode(): string {
  const buf = crypto.randomBytes(4);
  const num = buf.readUInt32BE(0) % 1000000;
  return num.toString().padStart(6, "0");
}

/**
 * Hash SHA256 do OTP (rápido e suficiente para códigos curtos)
 */
export function hashOtp(code: string, clientId: string): string {
  return crypto
    .createHash("sha256")
    .update(`${code}:${clientId}:${SECRET}`)
    .digest("hex");
}

/**
 * Gera token público de uso único (arte/rastreio)
 */
export function generatePublicToken(): string {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
}

/**
 * Cria um token de sessão assinado (HMAC)
 * Formato: <base64url(payload)>.<base64url(signature)>
 */
export function createSessionToken(clientId: string, sessionId: string): string {
  const payload = {
    cid: clientId,
    sid: sessionId,
    iat: Math.floor(Date.now() / 1000),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${payloadB64}.${sig}`;
}

/**
 * Verifica e extrai dados de um session token
 * Retorna null se inválido
 */
export function verifySessionToken(token: string): { clientId: string; sessionId: string } | null {
  if (!token || !token.includes(".")) return null;
  try {
    const [payloadB64, sig] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(payloadB64)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
    );
    return { clientId: payload.cid, sessionId: payload.sid };
  } catch {
    return null;
  }
}

/**
 * Hash do session token para guardar no banco (não armazena o token puro)
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Lê o session token dos cookies (uso server-side)
 */
export async function getSessionFromCookies(): Promise<{ clientId: string; sessionId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Lê o IP do cliente (do header x-forwarded-for ou x-real-ip)
 */
export async function getClientIp(): Promise<string | null> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      h.get("cf-connecting-ip") ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Lê o user-agent
 */
export async function getUserAgent(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("user-agent") || null;
  } catch {
    return null;
  }
}

/**
 * Mascara e-mail para exibição: ti***@vtdigital.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `*@${domain}`;
  return `${local.substring(0, 2)}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

/**
 * Mascara telefone: (21) ****-2449
 */
export function maskPhone(phone: string): string {
  const clean = (phone || "").replace(/\D/g, "");
  if (clean.length < 4) return "****";
  return `(**) *****-${clean.slice(-4)}`;
}

/**
 * Gera o template HTML do e-mail do OTP
 */
export function buildOtpEmailHtml(code: string, clientName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
      <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:linear-gradient(135deg,#0c4a6e,#1e3a8a);padding:28px 24px;text-align:center;color:#fff;">
          <h1 style="margin:0;font-size:20px;font-weight:800;letter-spacing:-0.3px;">PrintFlow Gráfica Criativa</h1>
          <p style="margin:6px 0 0;font-size:12px;opacity:0.85;text-transform:uppercase;letter-spacing:1.5px;">Área do Cliente</p>
        </div>
        <div style="padding:32px 28px;">
          <p style="margin:0 0 8px;font-size:15px;color:#0f172a;">Olá, <strong>${clientName || "cliente"}</strong>! 👋</p>
          <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.5;">Use o código abaixo para acessar sua área de cliente. Ele é válido por <strong>5 minutos</strong>.</p>
          <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;padding:22px;text-align:center;margin:20px 0;">
            <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#0c4a6e;">${code}</span>
          </div>
          <p style="margin:18px 0 0;font-size:12px;color:#64748b;line-height:1.5;">Se você não solicitou este código, ignore este e-mail. Por segurança, nunca compartilhe este código com ninguém.</p>
        </div>
        <div style="background:#f8fafc;padding:18px 24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} PrintFlow Gráfica Criativa — Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template de texto puro (fallback)
 */
export function buildOtpEmailText(code: string, clientName: string): string {
  return `Olá, ${clientName || "cliente"}!

Seu código de acesso à Área do Cliente PrintFlow é:

${code}

Válido por 5 minutos. Não compartilhe com ninguém.

Se você não solicitou este código, ignore esta mensagem.

— PrintFlow Gráfica Criativa`;
}
