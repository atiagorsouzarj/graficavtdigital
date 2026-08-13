import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders } from "@/db/schema";
import { requireClient, isErrorResponse } from "@/lib/clientGuard";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/cliente/pedidos
 * Retorna apenas os pedidos do cliente autenticado
 */
export async function GET() {
  const result = await requireClient();
  if (isErrorResponse(result)) return result;

  const { clientId } = result;
  try {
    const orders = await db
      .select()
      .from(quotesOrders)
      .where(eq(quotesOrders.clientId, clientId))
      .orderBy(desc(quotesOrders.createdAt));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("cliente/pedidos error:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar seus pedidos." },
      { status: 500 }
    );
  }
}
