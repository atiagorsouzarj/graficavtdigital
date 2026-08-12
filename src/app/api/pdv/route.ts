import { NextResponse } from "next/server";
import { db } from "@/db";
import { pdvShifts, quotesOrders, quoteOrderItems, financialTransactions, financialAccounts } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const [activeShift] = await db.select().from(pdvShifts).where(eq(pdvShifts.status, "open")).limit(1);
    if (!activeShift) {
      // Create new open shift
      const [newShift] = await db
        .insert(pdvShifts)
        .values({
          operatorName: "Tiago Souza",
          openingBalance: "150.00",
          cashTotal: "0.00",
          cardTotal: "0.00",
          pixTotal: "0.00",
          status: "open",
        })
        .returning();
      return NextResponse.json({ activeShift: newShift });
    }
    return NextResponse.json({ activeShift });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); // { items, clientId, clientName, paymentMethod, discount, receivedAmount }

    const code = `PV-${Date.now().toString().slice(-7)}`;
    const items = body.items || [];
    const subtotal = items.reduce((acc: number, item: { price: number; qty: number }) => acc + (item.price * item.qty), 0);
    const discount = parseFloat(body.discount || "0");
    const total = Math.max(0, subtotal - discount).toFixed(2);

    const [order] = await db
      .insert(quotesOrders)
      .values({
        code,
        type: "order",
        clientName: body.clientName || "Cliente Balcão PDV",
        status: "completed",
        subtotalAmount: String(subtotal.toFixed(2)),
        discountAmount: String(discount.toFixed(2)),
        freightAmount: "0.00",
        totalAmount: total,
        paymentMethod: body.paymentMethod || "cash",
        paymentStatus: "paid",
        artApprovalStatus: "approved",
        operatorName: "Tiago Souza",
      })
      .returning();

    for (const item of items) {
      await db.insert(quoteOrderItems).values({
        orderId: order.id,
        productId: item.productId || null,
        productName: item.name || "Item PDV",
        quantity: item.qty || 1,
        unitPrice: String(item.price || "0.00"),
        totalPrice: String(((item.price || 0) * (item.qty || 1)).toFixed(2)),
      });
    }

    // Add financial entry to Caixa Loja
    const [accCaixa] = await db.select().from(financialAccounts).where(eq(financialAccounts.name, "Caixa Loja"));
    await db.insert(financialTransactions).values({
      code: order.code,
      description: `Venda balcão ${order.code}`,
      type: "income",
      category: "Venda Balcão",
      costCenter: "Loja Física",
      accountId: accCaixa ? accCaixa.id : null,
      accountName: accCaixa ? accCaixa.name : "Caixa Loja",
      dueDate: new Date(),
      paymentDate: new Date(),
      amount: total,
      status: "paid",
      paymentMethod: body.paymentMethod === "cash" ? "Dinheiro" : body.paymentMethod === "pix" ? "PIX" : "Cartão",
      orderId: order.id,
    });

    return NextResponse.json({
      success: true,
      order,
      receiptNumber: code,
      total,
      change: body.receivedAmount ? (parseFloat(body.receivedAmount) - parseFloat(total)).toFixed(2) : "0.00",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
