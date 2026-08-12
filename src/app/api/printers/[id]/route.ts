import { NextResponse } from "next/server";
import { db } from "@/db";
import { printers } from "@/db/schema";
import {
  DEFAULT_KONICA_C284E_CONSUMABLES,
  calculateLaserCostDetails,
  LaserConsumablesData,
} from "@/lib/laserPricingEngine";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [printer] = await db.select().from(printers).where(eq(printers.id, id));
    if (!printer) {
      return NextResponse.json({ error: "Impressora não encontrada" }, { status: 404 });
    }

    let cData: LaserConsumablesData = DEFAULT_KONICA_C284E_CONSUMABLES;
    if (printer.consumablesData) {
      try {
        cData = typeof printer.consumablesData === "string" ? JSON.parse(printer.consumablesData) : (printer.consumablesData as any);
      } catch {
        cData = DEFAULT_KONICA_C284E_CONSUMABLES;
      }
    }

    const calc = calculateLaserCostDetails(cData);
    return NextResponse.json({ ...printer, consumablesData: cData, calculationDetails: calc });
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

    let consumablesData: LaserConsumablesData = body.consumablesData || DEFAULT_KONICA_C284E_CONSUMABLES;
    if (body.coveragePercent !== undefined) {
      consumablesData.coveragePercent = parseFloat(body.coveragePercent);
    }

    const calc = calculateLaserCostDetails(consumablesData);

    const [updated] = await db
      .update(printers)
      .set({
        name: body.name,
        brand: body.brand,
        model: body.model,
        technology: body.technology,
        maxSheetWidthMm: body.maxSheetWidthMm ? parseInt(body.maxSheetWidthMm, 10) : undefined,
        maxSheetHeightMm: body.maxSheetHeightMm ? parseInt(body.maxSheetHeightMm, 10) : undefined,
        fixedCostPerImp: calc.costColorA4.toFixed(4),
        maintenanceCostPerImp: calc.totalPartsCostA4.toFixed(4),
        coveragePercent: String(calc.coveragePercent),
        consumablesData: consumablesData as any,
        updatedAt: new Date(),
      })
      .where(eq(printers.id, id))
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
    await db.delete(printers).where(eq(printers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
