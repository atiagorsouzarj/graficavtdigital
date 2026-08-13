import { NextResponse } from "next/server";
import { db } from "@/db";
import { gabaritos, clientActivityLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/gabaritos/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [g] = await db.select().from(gabaritos).where(eq(gabaritos.id, id));
    if (!g) return NextResponse.json({ error: "Gabarito não encontrado." }, { status: 404 });
    return NextResponse.json(g);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * PATCH /api/gabaritos/[id]
 * Atualiza gabarito
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const [existing] = await db.select().from(gabaritos).where(eq(gabaritos.id, id));
    if (!existing) return NextResponse.json({ error: "Gabarito não encontrado." }, { status: 404 });

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) update.title = String(body.title);
    if (body.description !== undefined) update.description = body.description ? String(body.description) : null;
    if (body.category !== undefined) update.category = String(body.category);
    if (body.productType !== undefined) update.productType = body.productType ? String(body.productType) : null;
    if (body.fileUrl !== undefined) update.fileUrl = String(body.fileUrl);
    if (body.fileName !== undefined) update.fileName = String(body.fileName);
    if (body.fileType !== undefined) update.fileType = String(body.fileType);
    if (body.fileSizeKb !== undefined) update.fileSizeKb = parseInt(String(body.fileSizeKb), 10);
    if (body.widthMm !== undefined) update.widthMm = parseInt(String(body.widthMm), 10);
    if (body.heightMm !== undefined) update.heightMm = parseInt(String(body.heightMm), 10);
    if (body.bleedMm !== undefined) update.bleedMm = parseInt(String(body.bleedMm), 10);
    if (body.requiresAuth !== undefined) update.requiresAuth = Boolean(body.requiresAuth);
    if (body.active !== undefined) update.active = Boolean(body.active);

    const [updated] = await db.update(gabaritos).set(update).where(eq(gabaritos.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * DELETE /api/gabaritos/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.delete(gabaritos).where(eq(gabaritos.id, id)).returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Gabarito não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * POST /api/gabaritos/[id] (action: download)
 * Incrementa o contador de downloads
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action === "download") {
      const [g] = await db.select().from(gabaritos).where(eq(gabaritos.id, id));
      if (!g) return NextResponse.json({ error: "Gabarito não encontrado." }, { status: 404 });

      await db
        .update(gabaritos)
        .set({ downloads: (g.downloads || 0) + 1, updatedAt: new Date() })
        .where(eq(gabaritos.id, id));

      // Log (best-effort)
      try {
        await db.insert(clientActivityLog).values({
          action: "gabarito_download",
          resourceType: "gabarito",
          resourceId: id,
          details: JSON.stringify({ title: g.title, category: g.category }),
        });
      } catch {
        /* ignore */
      }

      return NextResponse.json({ success: true, fileUrl: g.fileUrl, fileName: g.fileName });
    }
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
