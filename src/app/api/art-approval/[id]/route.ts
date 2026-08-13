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

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
    }

    // Valida a ação: apenas 'approve' ou 'reject'
    const action = String(body.action || "");
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Ação inválida — use 'approve' ou 'reject'." },
        { status: 400 }
      );
    }

    const [order] = await db
      .select()
      .from(quotesOrders)
      .where(or(eq(quotesOrders.id, cleanId), eq(quotesOrders.code, cleanId)));

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Não permite aprovar/rejeitar depois que a arte já foi aprovada
    if (action === "approve" && order.artApprovalStatus === "approved") {
      return NextResponse.json(
        { error: "A arte deste pedido já foi aprovada." },
        { status: 409 }
      );
    }

    const isApprove = action === "approve";
    const status = isApprove ? "approved" : "changes_requested";
    const kanbanStatus = isApprove ? "production_ready" : "art_pending";

    let reason: string | null = null;
    if (!isApprove) {
      reason = String(body.reason || "Alteração solicitada pelo cliente").trim().slice(0, 500);
    }

    const [updated] = await db
      .update(quotesOrders)
      .set({
        artApprovalStatus: status,
        status: kanbanStatus,
        artRejectionReason: isApprove ? null : reason,
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
