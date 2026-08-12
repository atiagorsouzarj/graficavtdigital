import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, quoteOrderItems, financialTransactions, financialAccounts } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { eq, desc, or, ilike } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await seedDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const q = searchParams.get("q");

    let query = db.select().from(quotesOrders);

    if (q) {
      const search = `%${q}%`;
      // @ts-expect-error Drizzle dynamic query
      query = query.where(
        or(
          ilike(quotesOrders.code, search),
          ilike(quotesOrders.clientName, search),
          ilike(quotesOrders.clientPhone, search),
          ilike(quotesOrders.clientEmail, search)
        )
      );
    } else if (status) {
      // @ts-expect-error Drizzle dynamic query
      query = query.where(eq(quotesOrders.status, status));
    } else if (type) {
      // @ts-expect-error Drizzle dynamic query
      query = query.where(eq(quotesOrders.type, type));
    }

    const list = await query.orderBy(desc(quotesOrders.createdAt));

    // Fetch items for each order
    const result = await Promise.all(
      list.map(async (order) => {
        const items = await db
          .select()
          .from(quoteOrderItems)
          .where(eq(quoteOrderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error GET orders:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body.code || `${body.type === "quote" ? "ORC" : "PV"}-${Date.now().toString().slice(-7)}`;

    const subtotal = parseFloat(body.subtotalAmount || "0");
    const discount = parseFloat(body.discountAmount || "0");
    const freight = parseFloat(body.freightAmount || "0");
    const total = (subtotal - discount + freight).toFixed(2);

    const [order] = await db
      .insert(quotesOrders)
      .values({
        code,
        type: body.type || "order",
        clientId: body.clientId || null,
        clientName: body.clientName || "Cliente Balcão",
        clientDocument: body.clientDocument || null,
        clientPhone: body.clientPhone || null,
        clientEmail: body.clientEmail || null,
        status: body.status || "art_pending",
        subtotalAmount: String(subtotal.toFixed(2)),
        discountAmount: String(discount.toFixed(2)),
        freightAmount: String(freight.toFixed(2)),
        totalAmount: String(total),
        paymentMethod: body.paymentMethod || "pix",
        paymentStatus: body.paymentStatus || "pending",
        shippingMethod: body.shippingMethod || "pickup",
        artApprovalStatus: body.artApprovalStatus || "pending",
        artMockupUrl: body.artMockupUrl || null,
        artNotes: body.artNotes || null,
        notes: body.notes || null,
        operatorName: body.operatorName || "Tiago Souza",
      })
      .returning();

    // Insert items if provided
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        await db.insert(quoteOrderItems).values({
          orderId: order.id,
          productId: item.productId || null,
          productName: item.productName || "Item de Impressão",
          quantity: parseInt(item.quantity || "1", 10),
          unitCost: String(item.unitCost || "0.00"),
          unitPrice: String(item.unitPrice || "0.00"),
          totalPrice: String((parseFloat(item.unitPrice || "0") * parseInt(item.quantity || "1", 10)).toFixed(2)),
          paperMaterialName: item.paperMaterialName || null,
          finishesNotes: item.finishesNotes || null,
        });
      }
    }

    // If marked as paid right away, create financial entry
    if (body.paymentStatus === "paid") {
      const [acc] = await db.select().from(financialAccounts).limit(1);
      await db.insert(financialTransactions).values({
        code: order.code,
        description: `Venda ${order.type === "quote" ? "Orçamento" : "balcão"} ${order.code}`,
        type: "income",
        category: "Venda Balcão",
        costCenter: "Loja Física",
        accountId: acc ? acc.id : null,
        accountName: acc ? acc.name : "Caixa Loja",
        dueDate: new Date(),
        paymentDate: new Date(),
        amount: order.totalAmount,
        status: "paid",
        paymentMethod: order.paymentMethod || "PDV",
        orderId: order.id,
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error POST order:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
