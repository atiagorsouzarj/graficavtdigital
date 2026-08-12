import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, printers, materials } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import {
  DEFAULT_PRODUCT_COMPOSITIONS,
  ProductCompositionData,
  calculateProductPricingDetails,
} from "@/lib/productPricingEngine";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const list = await db.select().from(products).orderBy(desc(products.createdAt));

    const mapped = list.map((p) => {
      let cData: ProductCompositionData = DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;
      if (p.compositionData) {
        try {
          cData = typeof p.compositionData === "string" ? JSON.parse(p.compositionData) : (p.compositionData as any);
        } catch {
          cData = DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;
        }
      }
      const calc = calculateProductPricingDetails(cData);
      return {
        ...p,
        compositionData: cData,
        calculationDetails: calc,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let compositionData: ProductCompositionData = body.compositionData || DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;
    if (body.lossMarginPercent !== undefined) compositionData.lossMarginPercent = parseFloat(body.lossMarginPercent);
    if (body.taxPercent !== undefined) compositionData.taxPercent = parseFloat(body.taxPercent);
    if (body.cardTaxPercent !== undefined) compositionData.cardTaxPercent = parseFloat(body.cardTaxPercent);
    if (body.targetMarginPercent !== undefined) compositionData.targetMarginPercent = parseFloat(body.targetMarginPercent);

    const calc = calculateProductPricingDetails(compositionData);

    const [created] = await db
      .insert(products)
      .values({
        code: body.code || `PROD-${Date.now().toString().slice(-6)}`,
        name: body.name,
        category: body.category || "grafica_rapida",
        description: body.description || null,
        salesUnit: compositionData.salesUnit || "CT",
        printerId: body.printerId || null,
        paperMaterialId: body.paperMaterialId || null,
        defaultYieldPerSheet: compositionData.yieldPerA3Sheet || 24,
        yieldFactor: String(compositionData.yieldFactor || 0.0416),
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
        active: body.active !== undefined ? body.active : true,
      })
      .returning();

    return NextResponse.json({ ...created, calculationDetails: calc }, { status: 201 });
  } catch (error) {
    console.error("Error POST product:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
