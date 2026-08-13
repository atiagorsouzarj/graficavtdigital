import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, quoteOrderItems } from "@/db/schema";
import { requireClient, isErrorResponse } from "@/lib/clientGuard";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/cliente/pedidos/[id]
 * Retorna o pedido SOMENTE se принадлежит ao cliente autenticado
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireClient();
  if (isErrorResponse(result)) return result;

  const { clientId } = result;
  const { id } = await params;
  const cleanId = decodeURIComponent(id).trim();

  const [order] = await db
    .select()
    .from(quotesOrders)
    .where(
      and(
        eq(quotesOrders.clientId, clientId),
        eq(quotesOrders.id, cleanId)
      )
    );

  if (!order) {
    return NextResponse.json(
      { error: "Pedido não encontrado ou não pertence a você." },
      { status: 404 }
    );
  }

  const items = await db
    .select()
    .from(quoteOrderItems)
    .where(eq(quoteOrderItems.orderId, order.id));

  return NextResponse.json({ ...order, items });
}
