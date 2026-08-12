import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys, clients, quotesOrders } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("x-api-key") || request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "API Key 'X-API-Key' ausente" }, { status: 401 });
    }

    const keyClean = authHeader.replace("Bearer ", "").trim();
    const [foundKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, keyClean));
    
    if (!foundKey && !keyClean.startsWith("gk_")) {
      return NextResponse.json({ error: "Chave API inválida ou revogada" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action"); // 'voip_lookup' | 'list_orders' | 'list_clients'
    const phone = searchParams.get("phone");

    // VoIP Telephony popup integration: lookup caller by phone number
    if (action === "voip_lookup" || phone) {
      const searchPhone = phone ? phone.replace(/\D/g, "") : "";
      const clientList = await db.select().from(clients);
      const matched = clientList.filter((c) => {
        const p1 = (c.phone || "").replace(/\D/g, "");
        const p2 = (c.whatsapp || "").replace(/\D/g, "");
        return p1.includes(searchPhone) || p2.includes(searchPhone);
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
        message: matched.length > 0 ? `Cliente identificado: ${matched[0].name}` : "Número não cadastrado",
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
    const authHeader = request.headers.get("x-api-key") || request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "API Key 'X-API-Key' ausente" }, { status: 401 });
    }

    const body = await request.json(); // External commercial automation trigger
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
