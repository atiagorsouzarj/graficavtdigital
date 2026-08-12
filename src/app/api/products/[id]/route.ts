import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  DEFAULT_PRODUCT_COMPOSITIONS,
  ProductCompositionData,
  calculateProductPricingDetails,
} from "@/lib/productPricingEngine";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    let cData: ProductCompositionData = DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;
    if (product.compositionData) {
      try {
        cData = typeof product.compositionData === "string" ? JSON.parse(product.compositionData) : (product.compositionData as any);
      } catch {
        cData = DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;
      }
    }

    const calc = calculateProductPricingDetails(cData);
    return NextResponse.json({ ...product, compositionData: cData, calculationDetails: calc });
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

    let compositionData: ProductCompositionData = body.compositionData || DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;
    if (body.lossMarginPercent !== undefined) compositionData.lossMarginPercent = parseFloat(body.lossMarginPercent);
    if (body.taxPercent !== undefined) compositionData.taxPercent = parseFloat(body.taxPercent);
    if (body.cardTaxPercent !== undefined) compositionData.cardTaxPercent = parseFloat(body.cardTaxPercent);
    if (body.targetMarginPercent !== undefined) compositionData.targetMarginPercent = parseFloat(body.targetMarginPercent);

    const calc = calculateProductPricingDetails(compositionData);

    const [updated] = await db
      .update(products)
      .set({
        code: body.code,
        name: body.name,
        category: body.category,
        description: body.description,
        salesUnit: compositionData.salesUnit,
        printerId: body.printerId || null,
        paperMaterialId: body.paperMaterialId || null,
        defaultYieldPerSheet: compositionData.yieldPerA3Sheet,
        yieldFactor: String(compositionData.yieldFactor),
        lossMarginPercent: String(compositionData.lossMarginPercent),
        taxPercent: String(compositionData.taxPercent),
        cardTaxPercent: String(compositionData.cardTaxPercent),
        targetMarginPercent: String(compositionData.targetMarginPercent),
        calculatedBaseCost: calc.baseCompositionCost.toFixed(4),
        costWithLoss: calc.costWithLoss.toFixed(4),
        suggestedPrice: body.overrideSellPrice ? String(body.overrideSellPrice) : String(calc.suggestedPrice),
        minSellPrice: String(calc.minSellPrice),
        overrideSellPrice: body.overrideSellPrice ? String(body.overrideSellPrice) : null,
        compositionData: compositionData as any,
        active: body.active,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({ ...updated, calculationDetails: calc });
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
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
