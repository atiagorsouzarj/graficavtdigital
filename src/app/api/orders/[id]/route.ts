import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, quoteOrderItems, financialTransactions, financialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [order] = await db.select().from(quotesOrders).where(eq(quotesOrders.id, id));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const items = await db.select().from(quoteOrderItems).where(eq(quoteOrderItems.orderId, id));
    return NextResponse.json({ ...order, items });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.select().from(quotesOrders).where(eq(quotesOrders.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const prevOrder = existing[0];

    const subtotal = body.subtotalAmount !== undefined ? parseFloat(body.subtotalAmount) : parseFloat(prevOrder.subtotalAmount);
    const discount = body.discountAmount !== undefined ? parseFloat(body.discountAmount) : parseFloat(prevOrder.discountAmount);
    const freight = body.freightAmount !== undefined ? parseFloat(body.freightAmount) : parseFloat(prevOrder.freightAmount);
    const total = (subtotal - discount + freight).toFixed(2);

    const [updated] = await db
      .update(quotesOrders)
      .set({
        type: body.type !== undefined ? body.type : prevOrder.type,
        clientName: body.clientName !== undefined ? body.clientName : prevOrder.clientName,
        clientDocument: body.clientDocument !== undefined ? body.clientDocument : prevOrder.clientDocument,
        clientPhone: body.clientPhone !== undefined ? body.clientPhone : prevOrder.clientPhone,
        clientEmail: body.clientEmail !== undefined ? body.clientEmail : prevOrder.clientEmail,
        status: body.status !== undefined ? body.status : prevOrder.status,
        subtotalAmount: String(subtotal.toFixed(2)),
        discountAmount: String(discount.toFixed(2)),
        freightAmount: String(freight.toFixed(2)),
        totalAmount: String(total),
        paymentMethod: body.paymentMethod !== undefined ? body.paymentMethod : prevOrder.paymentMethod,
        paymentStatus: body.paymentStatus !== undefined ? body.paymentStatus : prevOrder.paymentStatus,
        infinitePayLink: body.infinitePayLink !== undefined ? body.infinitePayLink : prevOrder.infinitePayLink,
        shippingMethod: body.shippingMethod !== undefined ? body.shippingMethod : prevOrder.shippingMethod,
        shippingTrackingCode: body.shippingTrackingCode !== undefined ? body.shippingTrackingCode : prevOrder.shippingTrackingCode,
        shippingLabelUrl: body.shippingLabelUrl !== undefined ? body.shippingLabelUrl : prevOrder.shippingLabelUrl,
        artApprovalStatus: body.artApprovalStatus !== undefined ? body.artApprovalStatus : prevOrder.artApprovalStatus,
        artMockupUrl: body.artMockupUrl !== undefined ? body.artMockupUrl : prevOrder.artMockupUrl,
        artNotes: body.artNotes !== undefined ? body.artNotes : prevOrder.artNotes,
        artRejectionReason: body.artRejectionReason !== undefined ? body.artRejectionReason : prevOrder.artRejectionReason,
        artApprovedAt: body.artApprovalStatus === "approved" && !prevOrder.artApprovedAt ? new Date() : prevOrder.artApprovedAt,
        notes: body.notes !== undefined ? body.notes : prevOrder.notes,
        updatedAt: new Date(),
      })
      .where(eq(quotesOrders.id, id))
      .returning();

    // If payment status changed to paid from unpaid, generate financial transaction automatically
    if (prevOrder.paymentStatus !== "paid" && updated.paymentStatus === "paid") {
      const [acc] = await db.select().from(financialAccounts).limit(1);
      await db.insert(financialTransactions).values({
        code: updated.code,
        description: `Venda ${updated.type === "quote" ? "Orçamento" : "balcão"} ${updated.code}`,
        type: "income",
        category: "Venda Balcão",
        costCenter: "Loja Física",
        accountId: acc ? acc.id : null,
        accountName: acc ? acc.name : "Caixa Loja",
        dueDate: new Date(),
        paymentDate: new Date(),
        amount: updated.totalAmount,
        status: "paid",
        paymentMethod: updated.paymentMethod || "PDV",
        orderId: updated.id,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error PUT order:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(quotesOrders).where(eq(quotesOrders.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
