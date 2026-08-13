/**
 * Helpers para gerenciar tokens públicos de pedidos (arte, rastreio)
 */
import { db } from "@/db";
import { quotesOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePublicToken, PUBLIC_TOKEN_TTL_DAYS } from "@/lib/clientAuth";

/**
 * Gera tokens públicos para um pedido (arte + rastreio)
 * Se já existir token válido, mantém
 */
export async function ensureOrderTokens(orderId: string): Promise<{
  artApprovalToken: string | null;
  artApprovalTokenExpiresAt: Date | null;
  trackingToken: string | null;
  trackingTokenExpiresAt: Date | null;
}> {
  const [order] = await db.select().from(quotesOrders).where(eq(quotesOrders.id, orderId));
  if (!order) throw new Error("Pedido não encontrado");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + PUBLIC_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const updateData: Record<string, unknown> = {};

  // Token de aprovação de arte: gera se não existir OU se expirou/invalidado
  if (
    !order.artApprovalToken ||
    !order.artApprovalTokenExpiresAt ||
    order.artApprovalTokenExpiresAt < now
  ) {
    updateData.artApprovalToken = generatePublicToken();
    updateData.artApprovalTokenExpiresAt = expiresAt;
  }

  // Token de rastreio: gera se não existir OU se expirou
  if (
    !order.trackingToken ||
    !order.trackingTokenExpiresAt ||
    order.trackingTokenExpiresAt < now
  ) {
    updateData.trackingToken = generatePublicToken();
    updateData.trackingTokenExpiresAt = expiresAt;
  }

  if (Object.keys(updateData).length > 0) {
    await db
      .update(quotesOrders)
      .set(updateData)
      .where(eq(quotesOrders.id, orderId));
  }

  // Re-busca para retornar os valores atualizados
  const [updated] = await db.select().from(quotesOrders).where(eq(quotesOrders.id, orderId));
  return {
    artApprovalToken: updated?.artApprovalToken || null,
    artApprovalTokenExpiresAt: updated?.artApprovalTokenExpiresAt || null,
    trackingToken: updated?.trackingToken || null,
    trackingTokenExpiresAt: updated?.trackingTokenExpiresAt || null,
  };
}

/**
 * Constrói a URL pública de aprovação de arte
 */
export function buildArtApprovalUrl(baseUrl: string, orderId: string, token: string): string {
  return `${baseUrl}/aprovar-arte/${orderId}?token=${token}`;
}

/**
 * Constrói a URL pública de rastreio
 */
export function buildTrackingUrl(baseUrl: string, orderId: string, token: string): string {
  return `${baseUrl}/rastreio/${orderId}?t=${token}`;
}
