import { NextResponse } from "next/server";
import { db } from "@/db";
import { financialTransactions, financialAccounts } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const list = await db.select().from(financialTransactions).orderBy(desc(financialTransactions.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body.code || `LAN-${Date.now().toString().slice(-6)}`;

    const [created] = await db
      .insert(financialTransactions)
      .values({
        code,
        description: body.description,
        type: body.type || "income",
        category: body.category || "Outros",
        costCenter: body.costCenter || "Loja Física",
        accountId: body.accountId || null,
        accountName: body.accountName || "Caixa Loja",
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
        paymentDate: body.status === "paid" ? new Date() : null,
        amount: String(body.amount || "0.00"),
        status: body.status || "paid",
        paymentMethod: body.paymentMethod || "PDV",
        orderId: body.orderId || null,
      })
      .returning();

    // If account was specified and transaction is paid, update balance
    if (body.accountId && body.status === "paid") {
      const [acc] = await db.select().from(financialAccounts).where(eq(financialAccounts.id, body.accountId));
      if (acc) {
        const currBal = parseFloat(acc.balance);
        const transAmt = parseFloat(body.amount || "0");
        const newBal = body.type === "income" ? currBal + transAmt : currBal - transAmt;
        await db
          .update(financialAccounts)
          .set({ balance: newBal.toFixed(2) })
          .where(eq(financialAccounts.id, body.accountId));
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
