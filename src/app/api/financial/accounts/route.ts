import { NextResponse } from "next/server";
import { db } from "@/db";
import { financialAccounts } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const list = await db.select().from(financialAccounts).orderBy(desc(financialAccounts.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [created] = await db
      .insert(financialAccounts)
      .values({
        name: body.name,
        type: body.type || "bank",
        accountNumber: body.accountNumber || null,
        balance: String(body.balance || "0.00"),
        active: true,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
