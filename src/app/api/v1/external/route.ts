import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys, clients, quotesOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * API Pública Externa v1 — protegida por API Key registrada na tabela api_keys.
 * Toda requisição DEVE enviar o header X-API-Key (ou Authorization: Bearer).
 */

async function resolveApiKey(authHeader: string | null) {
  if (!authHeader) return null;
  const keyClean = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!keyClean) return null;

  const [foundKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, keyClean));
  if (!foundKey || !foundKey.active) return null;

  // Registra último uso da chave
  try {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, foundKey.id));
  } catch (error) {
    console.error("apiKeys lastUsedAt update error:", error);
  }

  return foundKey;
}

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function GET(request: Request) {
  try {
    const authHeader =
      request.headers.get("x-api-key") || request.headers.get("authorization");
    const validKey = await resolveApiKey(authHeader);
    if (!validKey) {
      return unauthorized("API Key inválida, inativa ou ausente (envie o header X-API-Key).");
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const phone = searchParams.get("phone");

    // VoIP Telephony popup integration: lookup caller by phone number
    if (action === "voip_lookup") {
      const searchPhone = (phone || "").replace(/\D/g, "");
      if (searchPhone.length < 8) {
        return NextResponse.json(
          { error: "Parâmetro 'phone' é obrigatório (mínimo 8 dígitos)." },
          { status: 400 }
        );
      }

      const clientList = await db.select().from(clients);
      const matched = clientList.filter((c) => {
        const p1 = (c.phone || "").replace(/\D/g, "");
        const p2 = (c.whatsapp || "").replace(/\D/g, "");
        return p1.endsWith(searchPhone) || p2.endsWith(searchPhone);
      });

      let activeOrders: unknown[] = [];
      if (matched.length > 0) {
        activeOrders = await db
          .select()
          .from(quotesOrders)
          .where(eq(quotesOrders.clientId, matched[0].id));
      }

      return NextResponse.json({
        type: "voip_caller_id",
        found: matched.length > 0,
        client: matched[0] || null,
        recentOrders: activeOrders,
        message:
          matched.length > 0
            ? `Cliente identificado: ${matched[0].name}`
            : "Número não cadastrado",
      });
    }

    if (action === "list_clients") {
      const list = await db.select().from(clients).limit(50);
      return NextResponse.json({ count: list.length, clients: list });
    }

    if (action === "list_orders") {
      const list = await db.select().from(quotesOrders).limit(50);
      return NextResponse.json({ count: list.length, orders: list });
    }

    return NextResponse.json({
      system: "Gráfica & Papelaria ERP CRM API v1",
      status: "online",
      endpoints: [
        "GET /api/v1/external?action=voip_lookup&phone=11987654321",
        "GET /api/v1/external?action=list_clients",
        "GET /api/v1/external?action=list_orders",
        "POST /api/v1/external (Comercial Webhook Trigger)",
      ],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader =
      request.headers.get("x-api-key") || request.headers.get("authorization");
    const validKey = await resolveApiKey(authHeader);
    if (!validKey) {
      return unauthorized("API Key inválida, inativa ou ausente (envie o header X-API-Key).");
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
    }

    // External commercial automation trigger
    return NextResponse.json({
      success: true,
      event: body.event || "external_automation_trigger",
      processedAt: new Date().toISOString(),
      payloadReceived: body,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
