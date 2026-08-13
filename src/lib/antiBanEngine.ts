/**
 * AntiBanEngine - Proteção contra banimento do WhatsApp (Baileys)
 *
 * Regras de segurança aplicadas:
 * 1. Cooldown de resposta automática por contato (evita "spam" de bot)
 * 2. Cota global diária e por hora (limita volume total de mensagens)
 * 3. Cota por contato por hora/dia (evita assediar o mesmo número)
 * 4. Delay humano com jitter entre mensagens (1.5s - 3.5s)
 * 5. Delay estendido para disparos em lote (8s - 15s entre envios)
 * 6. Simulação de digitação proporcional ao tamanho do texto
 */

interface SendRecord {
  timestamp: number;
}

interface RateLimitResult {
  allowed: boolean;
  reason?:
    | "global_daily_limit"
    | "global_hourly_limit"
    | "contact_daily_limit"
    | "contact_hourly_limit"
    | "cooldown";
  cooldownRemainingMs?: number;
}

export interface AntiBanStats {
  engine: string;
  totalSentToday: number;
  totalSentLastHour: number;
  globalDailyLimit: number;
  globalHourlyLimit: number;
  perContactHourlyLimit: number;
  perContactDailyLimit: number;
  autoReplyCooldownMs: number;
  bulkDelayRangeMs: [number, number];
  trackedContacts: number;
}

export const ANTI_BAN_LIMITS = {
  globalDailyLimit: 500,
  globalHourlyLimit: 80,
  perContactDailyLimit: 40,
  perContactHourlyLimit: 15,
  autoReplyCooldownMs: 30_000,
  humanTypingDelayRangeMs: [1500, 3500] as [number, number],
  bulkDelayRangeMs: [8000, 15000] as [number, number],
};

const globalSends: SendRecord[] = [];
const contactSends = new Map<string, SendRecord[]>();
const lastAutoReplyAt = new Map<string, number>();

function cleanPhone(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}

function prune(records: SendRecord[], windowMs: number): SendRecord[] {
  const cutoff = Date.now() - windowMs;
  return records.filter((r) => r.timestamp >= cutoff);
}

export class AntiBanEngine {
  /**
   * Jitter delay humano (mesma assinatura do antiBanDelay clássico).
   */
  static async humanDelay(minMs = 1500, maxMs = 3500): Promise<void> {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Delay estendido para campanhas / disparos em massa (anti-ban reforçado).
   */
  static async bulkDelay(): Promise<void> {
    const [minMs, maxMs] = ANTI_BAN_LIMITS.bulkDelayRangeMs;
    return this.humanDelay(minMs, maxMs);
  }

  /**
   * Tempo de digitação simulado: ~220ms por "palavra" com jitter humano.
   */
  static async typingDelayForText(text: string): Promise<void> {
    const wordCount = (text || "").split(/\s+/).filter(Boolean).length;
    const baseMs = Math.min(Math.max(wordCount * 220, 900), 4200);
    await this.humanDelay(baseMs, Math.round(baseMs * 1.8));
  }

  /**
   * Verifica se o envio para um contato está liberado (cotas + cooldown).
   */
  static checkRateLimit(phone: string): RateLimitResult {
    const p = cleanPhone(phone);
    const now = Date.now();

    // Cooldown de resposta automática do bot por contato
    const lastReply = lastAutoReplyAt.get(p) || 0;
    const cooldownRemaining = ANTI_BAN_LIMITS.autoReplyCooldownMs - (now - lastReply);
    if (cooldownRemaining > 0) {
      return { allowed: false, reason: "cooldown", cooldownRemainingMs: cooldownRemaining };
    }

    const globalHour = prune(globalSends, 60 * 60 * 1000);
    const globalDay = prune(globalSends, 24 * 60 * 60 * 1000);

    if (globalDay.length >= ANTI_BAN_LIMITS.globalDailyLimit) {
      return { allowed: false, reason: "global_daily_limit" };
    }
    if (globalHour.length >= ANTI_BAN_LIMITS.globalHourlyLimit) {
      return { allowed: false, reason: "global_hourly_limit" };
    }

    const contactRecords = contactSends.get(p) || [];
    const contactHour = prune(contactRecords, 60 * 60 * 1000);
    const contactDay = prune(contactRecords, 24 * 60 * 60 * 1000);

    if (contactDay.length >= ANTI_BAN_LIMITS.perContactDailyLimit) {
      return { allowed: false, reason: "contact_daily_limit" };
    }
    if (contactHour.length >= ANTI_BAN_LIMITS.perContactHourlyLimit) {
      return { allowed: false, reason: "contact_hourly_limit" };
    }

    return { allowed: true };
  }

  /**
   * Registra envio real para fins de contagem de cota.
   */
  static recordSend(phone: string): void {
    const p = cleanPhone(phone);
    const now = Date.now();
    globalSends.push({ timestamp: now });
    if (!contactSends.has(p)) contactSends.set(p, []);
    contactSends.get(p)!.push({ timestamp: now });
  }

  /**
   * Registra resposta automática do bot (alimenta o cooldown anti-spam).
   */
  static recordAutoReply(phone: string): void {
    lastAutoReplyAt.set(cleanPhone(phone), Date.now());
  }

  /**
   * Tempo restante até o bot poder responder novamente o contato.
   */
  static getAutoReplyCooldownRemaining(phone: string): number {
    const p = cleanPhone(phone);
    const lastReply = lastAutoReplyAt.get(p) || 0;
    const remaining = ANTI_BAN_LIMITS.autoReplyCooldownMs - (Date.now() - lastReply);
    return remaining > 0 ? remaining : 0;
  }

  static getStats(): AntiBanStats {
    return {
      engine: "AntiBanEngine v1 (cooldown + cotas + jitter humano)",
      totalSentToday: prune(globalSends, 24 * 60 * 60 * 1000).length,
      totalSentLastHour: prune(globalSends, 60 * 60 * 1000).length,
      globalDailyLimit: ANTI_BAN_LIMITS.globalDailyLimit,
      globalHourlyLimit: ANTI_BAN_LIMITS.globalHourlyLimit,
      perContactHourlyLimit: ANTI_BAN_LIMITS.perContactHourlyLimit,
      perContactDailyLimit: ANTI_BAN_LIMITS.perContactDailyLimit,
      autoReplyCooldownMs: ANTI_BAN_LIMITS.autoReplyCooldownMs,
      bulkDelayRangeMs: ANTI_BAN_LIMITS.bulkDelayRangeMs,
      trackedContacts: contactSends.size,
    };
  }
}
