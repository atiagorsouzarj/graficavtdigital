import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, quoteOrderItems } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    // Search by UUID or order code
    const [order] = await db
      .select()
      .from(quotesOrders)
      .where(or(eq(quotesOrders.id, cleanId), eq(quotesOrders.code, cleanId)));

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(quoteOrderItems)
      .where(eq(quoteOrderItems.orderId, order.id));

    return NextResponse.json({ ...order, items });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();
    const body = await request.json(); // { action: 'approve' | 'reject', reason?: string }

    const [order] = await db
      .select()
      .from(quotesOrders)
      .where(or(eq(quotesOrders.id, cleanId), eq(quotesOrders.code, cleanId)));

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const isApprove = body.action === "approve";
    const status = isApprove ? "approved" : "changes_requested";
    const kanbanStatus = isApprove ? "production_ready" : "art_pending";

    const [updated] = await db
      .update(quotesOrders)
      .set({
        artApprovalStatus: status,
        status: kanbanStatus,
        artRejectionReason: isApprove ? null : (body.reason || "Alteração solicitada pelo cliente"),
        artApprovedAt: isApprove ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(quotesOrders.id, order.id))
      .returning();

    return NextResponse.json({
      success: true,
      artApprovalStatus: updated.artApprovalStatus,
      status: updated.status,
      message: isApprove
        ? "Arte aprovada com sucesso! Seu pedido foi encaminhado para a fila de produção."
        : "Solicitação de alteração enviada! Nossa equipe de design fará os ajustes.",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
