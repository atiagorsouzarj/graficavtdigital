import { NextResponse } from "next/server";
import { db } from "@/db";
import { finishes } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const list = await db.select().from(finishes).orderBy(desc(finishes.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [created] = await db
      .insert(finishes)
      .values({
        name: body.name,
        unit: body.unit || "unit",
        costPrice: String(body.costPrice || "0.00"),
        sellPrice: String(body.sellPrice || "0.00"),
        estimatedMinutes: parseInt(body.estimatedMinutes || "2", 10),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
