import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/api-keys
 * Retorna todas as chaves cadastradas (uso administrativo).
 * ATENÇÃO: este endpoint deveria estar protegido em produção por sessão admin.
 * Como o sistema atual não tem autenticação por sessão, a proteção será feita
 * via token administrativo opcional (SYSTEM_ADMIN_TOKEN).
 */
function isAdmin(request: Request): boolean {
  const required = process.env.SYSTEM_ADMIN_TOKEN;
  if (!required) return true; // ambiente dev/demo
  const provided =
    request.headers.get("x-admin-token") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  return provided === required;
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Token administrativo necessário." }, { status: 401 });
  }
  try {
    const list = await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function generateSecureKey(): string {
  // 32 bytes aleatórios em hex (64 chars) com prefixo gk_ legível
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return "gk_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Token administrativo necessário." }, { status: 401 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Informe o nome da chave." }, { status: 400 });
    }

    const permissions = String(body.permissions || "read,write");
    const newKey = generateSecureKey();

    const [created] = await db
      .insert(apiKeys)
      .values({ name, key: newKey, permissions, active: true })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
