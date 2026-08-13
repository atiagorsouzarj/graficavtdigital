import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, quoteOrderItems } from "@/db/schema";
import { eq, and, gt, isNull, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/art-approval/[id]?token=XXX
 *
 * Acesso PÚBLICO via token de uso único.
 * Valida: token + expiração. Após 1 uso (approve/reject), token é invalidado.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Link de aprovação inválido. Solicite um novo link pelo WhatsApp ou entre na sua área de cliente.",
        },
        { status: 401 }
      );
    }

    // Primeiro busca por ID com token
    let [order] = await db
      .select()
      .from(quotesOrders)
      .where(
        and(
          eq(quotesOrders.id, cleanId),
          eq(quotesOrders.artApprovalToken, token),
          gt(quotesOrders.artApprovalTokenExpiresAt, new Date())
        )
      );

    // Se não achou, tenta por código
    if (!order) {
      const byCode = await db
        .select()
        .from(quotesOrders)
        .where(
          and(
            eq(quotesOrders.code, cleanId),
            eq(quotesOrders.artApprovalToken, token),
            gt(quotesOrders.artApprovalTokenExpiresAt, new Date())
          )
        );
      order = byCode[0];
    }

    if (!order) {
      // Verifica se o pedido existe (mesmo sem token válido)
      let exists = await db
        .select()
        .from(quotesOrders)
        .where(eq(quotesOrders.id, cleanId));
      if (exists.length === 0) {
        exists = await db
          .select()
          .from(quotesOrders)
          .where(eq(quotesOrders.code, cleanId));
      }
      if (exists[0]) {
        return NextResponse.json(
          {
            error:
              "Link expirado ou já utilizado. Solicite um novo link pelo WhatsApp da gráfica.",
          },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { error: "Prova de arte não encontrada." },
        { status: 404 }
      );
    }

    const items = await db
      .select()
      .from(quoteOrderItems)
      .where(eq(quoteOrderItems.orderId, order.id));

    return NextResponse.json({
      id: order.id,
      code: order.code,
      clientName: order.clientName,
      artApprovalStatus: order.artApprovalStatus,
      artMockupUrl: order.artMockupUrl,
      artNotes: order.artNotes,
      artRejectionReason: order.artRejectionReason,
      totalAmount: order.totalAmount,
      items: items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        paperMaterialName: i.paperMaterialName,
      })),
    });
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
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const body = (await request.json().catch(() => ({}))) as { action?: string; reason?: string };
    const action = String(body.action || "");

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Ação inválida — use 'approve' ou 'reject'." },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token ausente. Solicite um novo link." },
        { status: 401 }
      );
    }

    const [order] = await db
      .select()
      .from(quotesOrders)
      .where(
        and(
          eq(quotesOrders.id, cleanId),
          eq(quotesOrders.artApprovalToken, token),
          gt(quotesOrders.artApprovalTokenExpiresAt, new Date())
        )
      );

    if (!order) {
      return NextResponse.json(
        { error: "Link expirado, inválido ou já utilizado." },
        { status: 410 }
      );
    }

    if (order.artApprovalStatus === "approved") {
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
        artApprovalToken: null,
        artApprovalTokenExpiresAt: null,
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
