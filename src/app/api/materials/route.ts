import { NextResponse } from "next/server";
import { db } from "@/db";
import { materials } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const list = await db.select().from(materials).orderBy(desc(materials.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const purchasePrice = parseFloat(body.purchasePrice || "0");
    const conversionFactor = parseFloat(body.conversionFactor || "1") || 1;
    const computedUnitCost = (purchasePrice / conversionFactor).toFixed(4);

    const [created] = await db
      .insert(materials)
      .values({
        code: body.code || `MAT-${Date.now().toString().slice(-6)}`,
        name: body.name,
        itemType: body.itemType || "insumo",
        category: body.category || "paper",
        purchaseUnit: body.purchaseUnit || "PCT",
        consumptionUnit: body.consumptionUnit || "FLS",
        conversionFactor: String(conversionFactor),
        stockQuantity: String(body.stockQuantity || "0"),
        minStockQuantity: String(body.minStockQuantity || "0"),
        purchasePrice: String(purchasePrice.toFixed(2)),
        costPrice: computedUnitCost,
        ncm: body.ncm || "4802.57.99",
        grammage: body.grammage || null,
        dimensions: body.dimensions || null,
        finishType: body.finishType || null,
        supplier: body.supplier || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
