import { NextResponse } from "next/server";
import { db } from "@/db";
import { printers, printerCategories } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import {
  DEFAULT_KONICA_C284E_CONSUMABLES,
  calculateLaserCostDetails,
  LaserConsumablesData,
} from "@/lib/laserPricingEngine";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const categories = await db.select().from(printerCategories);
    const printerList = await db.select().from(printers).orderBy(desc(printers.createdAt));

    const mappedPrinters = printerList.map((p) => {
      let cData: LaserConsumablesData = DEFAULT_KONICA_C284E_CONSUMABLES;
      if (p.consumablesData) {
        try {
          cData = typeof p.consumablesData === "string" ? JSON.parse(p.consumablesData) : (p.consumablesData as any);
        } catch {
          cData = DEFAULT_KONICA_C284E_CONSUMABLES;
        }
      }
      const calc = calculateLaserCostDetails(cData);
      return {
        ...p,
        consumablesData: cData,
        calculationDetails: calc,
      };
    });

    return NextResponse.json({ categories, printers: mappedPrinters });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); // { name, categoryId, categoryName, technology, brand, model }

    let consumablesData: LaserConsumablesData = body.consumablesData || DEFAULT_KONICA_C284E_CONSUMABLES;
    if (body.coveragePercent) {
      consumablesData.coveragePercent = parseFloat(body.coveragePercent);
    }

    const calc = calculateLaserCostDetails(consumablesData);

    const [created] = await db
      .insert(printers)
      .values({
        categoryId: body.categoryId || null,
        categoryName: body.categoryName || "Laser Digital",
        name: body.name || "Nova Impressora Laser",
        brand: body.brand || "Konica Minolta",
        model: body.model || "C284e",
        technology: body.technology || "laser",
        maxSheetWidthMm: parseInt(body.maxSheetWidthMm || "330", 10),
        maxSheetHeightMm: parseInt(body.maxSheetHeightMm || "488", 10),
        maintenanceCostPerImp: calc.totalPartsCostA4.toFixed(4),
        energyCostPerImp: "0.0200",
        fixedCostPerImp: calc.costColorA4.toFixed(4),
        coveragePercent: String(calc.coveragePercent),
        consumablesData: consumablesData as any,
      })
      .returning();

    return NextResponse.json({ ...created, calculationDetails: calc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
