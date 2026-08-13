import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function isAdmin(request: Request): boolean {
  const required = process.env.SYSTEM_ADMIN_TOKEN;
  if (!required) return true;
  const provided =
    request.headers.get("x-admin-token") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  return provided === required;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Token administrativo necessário." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [existing] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    if (!existing) {
      return NextResponse.json({ error: "Chave não encontrada." }, { status: 404 });
    }

    // Revoga em vez de excluir (mantém histórico)
    await db
      .update(apiKeys)
      .set({ active: false })
      .where(eq(apiKeys.id, id));

    return NextResponse.json({ success: true, revoked: id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
