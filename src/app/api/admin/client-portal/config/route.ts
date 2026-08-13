import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isDemoMode, listDemoClients, seedDemoData } from "@/lib/demoMode";

export const dynamic = "force-dynamic";

const KEYS = [
  "client_portal_demo_mode",
  "client_portal_smtp_host",
  "client_portal_smtp_user",
  "client_portal_smtp_from",
  "client_portal_otp_subject",
  "client_portal_otp_footer",
  "client_portal_session_hours",
];

/**
 * GET /api/admin/client-portal/config
 * Retorna configurações do portal do cliente
 */
export async function GET() {
  const settings = await db.select().from(systemSettings);
  const map: Record<string, string> = {};
  for (const s of settings) {
    if (s.key && (s.key.startsWith("client_portal_") || KEYS.includes(s.key))) {
      map[s.key] = s.value || "";
    }
  }
  const demo = await isDemoMode();
  return NextResponse.json({
    settings: map,
    demoMode: demo,
    demoClients: demo ? await listDemoClients() : [],
  });
}

/**
 * POST /api/admin/client-portal/config
 * Body: { key, value } ou { action: "seed_demo" | "reset_sessions" }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action || "");

    if (action === "seed_demo") {
      const result = await seedDemoData();
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "reset_sessions") {
      // Importa dinamicamente para evitar ciclos
      const { clientSessions } = await import("@/db/schema");
      const deleted = await db.delete(clientSessions).returning({ id: clientSessions.id });
      return NextResponse.json({ success: true, sessionsDeleted: deleted.length });
    }

    const key = String(body.key || "");
    const value = String(body.value || "");

    if (!KEYS.includes(key) && !key.startsWith("client_portal_")) {
      return NextResponse.json({ error: "Chave de configuração inválida." }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));

    if (existing) {
      await db
        .update(systemSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings).values({ key, value, category: "client_portal" });
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error("config client-portal error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
