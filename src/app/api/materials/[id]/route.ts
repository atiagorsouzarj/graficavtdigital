import { NextResponse } from "next/server";
import { db } from "@/db";
import { materials } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const purchasePrice = parseFloat(body.purchasePrice || "0");
    const conversionFactor = parseFloat(body.conversionFactor || "1") || 1;
    const computedUnitCost = (purchasePrice / conversionFactor).toFixed(4);

    const [updated] = await db
      .update(materials)
      .set({
        code: body.code,
        name: body.name,
        itemType: body.itemType,
        category: body.category,
        purchaseUnit: body.purchaseUnit,
        consumptionUnit: body.consumptionUnit,
        conversionFactor: String(conversionFactor),
        stockQuantity: String(body.stockQuantity || "0"),
        minStockQuantity: String(body.minStockQuantity || "0"),
        purchasePrice: String(purchasePrice.toFixed(2)),
        costPrice: computedUnitCost,
        ncm: body.ncm,
        grammage: body.grammage,
        dimensions: body.dimensions,
        finishType: body.finishType,
        supplier: body.supplier,
      })
      .where(eq(materials.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(materials).where(eq(materials.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
