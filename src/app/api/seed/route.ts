import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";
import { db } from "@/db";
import { printers } from "@/db/schema";

export const dynamic = "force-dynamic";

async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const existing = await db.select().from(printers).limit(1);
    return existing.length === 0;
  } catch {
    return true;
  }
}

/**
 * Endpoint de seed protegido:
 * - GET retorna apenas o estado da base (sem executar nada).
 * - POST executa SOMENTE no primeiro boot (base vazia) ou com token administrativo válido.
 */
export async function GET() {
  const empty = await isDatabaseEmpty();
  return NextResponse.json({
    success: true,
    seeded: !empty,
    message: empty ? "Banco vazio — aguardando primeiro boot." : "Banco já populado.",
  });
}

export async function POST(request: Request) {
  const empty = await isDatabaseEmpty();

  const adminToken = process.env.SYSTEM_ADMIN_TOKEN;
  const providedToken = request.headers.get("x-admin-token") || "";

  const tokenAuthorized = Boolean(adminToken) && providedToken === adminToken;

  if (!empty && !tokenAuthorized) {
    return NextResponse.json(
      {
        error:
          "A base já está populada. Para forçar re-seed, envie o header X-Admin-Token válido.",
      },
      { status: 403 }
    );
  }

  const result = await seedDatabase();
  return NextResponse.json(result);
}
