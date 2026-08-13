import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, quoteOrderItems } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/cliente/rastreio/[code]?t=TOKEN
 *
 * Acesso PÚBLICO via token de uso único (reutilizável para rastreio).
 * Retorna apenas dados essenciais para o cliente.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = decodeURIComponent(code).trim();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("t");

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Link de rastreio inválido. Solicite um novo link pelo WhatsApp ou entre na sua área de cliente.",
        },
        { status: 401 }
      );
    }

    // Busca por ID primeiro
    let [order] = await db
      .select()
      .from(quotesOrders)
      .where(
        and(
          eq(quotesOrders.id, cleanCode),
          eq(quotesOrders.trackingToken, token),
          gt(quotesOrders.trackingTokenExpiresAt, new Date())
        )
      );

    if (!order) {
      const byCode = await db
        .select()
        .from(quotesOrders)
        .where(
          and(
            eq(quotesOrders.code, cleanCode),
            eq(quotesOrders.trackingToken, token),
            gt(quotesOrders.trackingTokenExpiresAt, new Date())
          )
        );
      order = byCode[0];
    }

    if (!order) {
      // Verifica se existe (mensagem mais útil)
      let exists = await db
        .select()
        .from(quotesOrders)
        .where(eq(quotesOrders.id, cleanCode));
      if (exists.length === 0) {
        exists = await db
          .select()
          .from(quotesOrders)
          .where(eq(quotesOrders.code, cleanCode));
      }
      if (exists[0]) {
        return NextResponse.json(
          { error: "Link de rastreio expirado. Solicite um novo." },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { error: "Pedido não encontrado." },
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
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      shippingTrackingCode: order.shippingTrackingCode,
      shippingAddress: order.shippingAddress,
      artApprovalStatus: order.artApprovalStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
