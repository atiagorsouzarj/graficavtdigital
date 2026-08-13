import { NextResponse } from "next/server";
import { db } from "@/db";
import { gabaritos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/gabaritos
 * Lista gabaritos (público: só os ativos; admin: todos)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin") === "1";
    const category = searchParams.get("category");

    let query = db.select().from(gabaritos).orderBy(desc(gabaritos.createdAt));
    const list = await query;
    let filtered = admin ? list : list.filter((g) => g.active);
    if (category) filtered = filtered.filter((g) => g.category === category);
    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * POST /api/gabaritos
 * Cria novo gabarito (admin)
 * Body: { code, title, description?, category, fileUrl, fileName, fileType, fileSizeKb?, widthMm?, heightMm?, bleedMm?, requiresAuth? }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const code = String(body.code || "").trim();
    const title = String(body.title || "").trim();
    const fileUrl = String(body.fileUrl || "").trim();
    const fileName = String(body.fileName || "").trim();
    const fileType = String(body.fileType || "").trim();

    if (!code || !title || !fileUrl || !fileName || !fileType) {
      return NextResponse.json(
        { error: "Campos obrigatórios: code, title, fileUrl, fileName, fileType" },
        { status: 400 }
      );
    }

    const [existing] = await db.select().from(gabaritos).where(eq(gabaritos.code, code));
    if (existing) {
      return NextResponse.json({ error: `Já existe um gabarito com code "${code}".` }, { status: 409 });
    }

    const [created] = await db
      .insert(gabaritos)
      .values({
        code,
        title,
        description: body.description ? String(body.description) : null,
        category: String(body.category || "outros"),
        productType: body.productType ? String(body.productType) : null,
        fileUrl,
        fileName,
        fileType,
        fileSizeKb: body.fileSizeKb ? parseInt(String(body.fileSizeKb), 10) : 0,
        widthMm: body.widthMm ? parseInt(String(body.widthMm), 10) : null,
        heightMm: body.heightMm ? parseInt(String(body.heightMm), 10) : null,
        bleedMm: body.bleedMm ? parseInt(String(body.bleedMm), 10) : 3,
        requiresAuth: Boolean(body.requiresAuth),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
