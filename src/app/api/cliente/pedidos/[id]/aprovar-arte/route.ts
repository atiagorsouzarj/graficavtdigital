import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, clientActivityLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireClient, isErrorResponse } from "@/lib/clientGuard";

export const dynamic = "force-dynamic";

/**
 * POST /api/cliente/pedidos/[id]/aprovar-arte
 * Body: { action: "approve" | "reject", reason?: string }
 *
 * - Exige cliente autenticado
 * - Valida que o pedido pertence ao cliente
 * - Atualiza status e audita
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireClient();
  if (isErrorResponse(auth)) return auth;
  const { clientId, sessionId } = auth;

  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      reason?: string;
    };

    const action = String(body.action || "");
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Ação inválida. Use 'approve' ou 'reject'." },
        { status: 400 }
      );
    }

    // Busca pedido garantindo que pertence ao cliente
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

    if (order.artApprovalStatus === "approved") {
      return NextResponse.json(
        { error: "Este pedido já teve a arte aprovada." },
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
        // Invalida o token de uso único após uso
        artApprovalToken: null,
        artApprovalTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(quotesOrders.id, order.id))
      .returning();

    // Log
    try {
      await db.insert(clientActivityLog).values({
        clientId,
        sessionId,
        action: isApprove ? "art_approved" : "art_rejected",
        resourceType: "order",
        resourceId: order.id,
        details: reason || undefined,
      });
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      success: true,
      artApprovalStatus: updated.artApprovalStatus,
      status: updated.status,
      message: isApprove
        ? "Arte aprovada com sucesso! Seu pedido foi encaminhado para a fila de produção."
        : "Solicitação de alteração enviada! Nossa equipe de design fará os ajustes.",
    });
  } catch (error) {
    console.error("aprovar-arte client error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
