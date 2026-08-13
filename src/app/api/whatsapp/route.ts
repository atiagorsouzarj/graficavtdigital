import { NextResponse } from "next/server";
import { db } from "@/db";
import { whatsappConfig, communicationTemplates } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { WhatsappService } from "@/lib/whatsappService";
import { AntiBanEngine } from "@/lib/antiBanEngine";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Idempotente: populou a base apenas no primeiro boot (retorna cedo se já houver dados)
    await seedDatabase();

    const [config] = await db.select().from(whatsappConfig).limit(1);
    const templates = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.channel, "whatsapp"));

    const chatOverview = WhatsappService.getLiveChatOverview();

    const defaultConfig = config || {
      instanceName: "Baileys Main Instance (Baileys v6.7.0)",
      status: "disconnected",
      connectedPhone: "+55 (21) 97886-9414",
      botEnabled: true,
      botGreetingMsg:
        "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano",
      botSecurityToken: "sec_token_grafica_9921",
    };

    return NextResponse.json({
      config: defaultConfig,
      templates,
      liveChat: chatOverview,
      socketInfo: WhatsappService.getSocketInfo(),
      antiBan: AntiBanEngine.getStats(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
    }

    const action = String(body.action || "");

    // 1. Generate Baileys QR Code
    if (action === "generate_qr") {
      const qrData = await WhatsappService.generateQrCode();
      return NextResponse.json(qrData);
    }

    // 2. Connect / Disconnect Baileys Bridge (socket real)
    if (action === "connect" || action === "disconnect") {
      const nextStatus = (body.action === "connect" ? "connected" : "disconnected") as
        | "connected"
        | "disconnected";
      const status = await WhatsappService.setConnectionStatus(nextStatus);
      return NextResponse.json({ success: true, status, socketInfo: WhatsappService.getSocketInfo() });
    }

    // 3. Send Message with Anti-Ban Delay & Presence
    if (action === "send_message") {
      const phone = String(body.phone || "").trim();
      const message = String(body.message || "").trim();

      if (!phone || !message) {
        return NextResponse.json(
          { success: false, status: "failed", error: "Telefone (phone) e mensagem (message) são obrigatórios." },
          { status: 400 }
        );
      }

      const result = await WhatsappService.sendMessageWithPresence({
        phone,
        clientName: body.clientName ? String(body.clientName) : undefined,
        templateCode: body.templateCode ? String(body.templateCode) : undefined,
        message,
        sender: (body.sender as "agent" | "bot") || "agent",
      });

      return NextResponse.json(result, { status: result.success ? 200 : 429 });
    }

    // 4. Pause / Resume Bot for a Contact (Human Agent Takeover)
    if (action === "pause_bot" || action === "resume_bot") {
      const phone = String(body.phone || "").trim();
      if (!phone) {
        return NextResponse.json({ error: "Telefone (phone) é obrigatório." }, { status: 400 });
      }
      const pause = action === "pause_bot";
      const isPaused = WhatsappService.toggleBotPauseForContact(phone, pause);
      return NextResponse.json({
        success: true,
        contactPhone: phone,
        botPaused: isPaused,
        message: isPaused
          ? "Bot de autoatendimento pausado. Atendente humano assumiu a conversa!"
          : "Bot de autoatendimento reativado para este contato.",
      });
    }

    // 5. Bot Auto-Responder Simulation
    if (action === "bot_simulate") {
      const phone = String(body.phone || "(11) 98765-4321");
      const message = String(body.message || "").trim();
      if (!message) {
        return NextResponse.json({ error: "Mensagem (message) é obrigatória." }, { status: 400 });
      }
      const result = await WhatsappService.processBotQuery(phone, message);
      return NextResponse.json({
        success: true,
        userMessage: message,
        ...result,
      });
    }

    // 6. Update Configuration
    if (action === "update_config") {
      const [existing] = await db.select().from(whatsappConfig).limit(1);
      if (existing) {
        const [updated] = await db
          .update(whatsappConfig)
          .set({
            instanceName: body.instanceName !== undefined ? String(body.instanceName) : existing.instanceName,
            status: body.status !== undefined ? String(body.status) : existing.status,
            connectedPhone:
              body.connectedPhone !== undefined ? String(body.connectedPhone) : existing.connectedPhone,
            botEnabled: body.botEnabled !== undefined ? Boolean(body.botEnabled) : existing.botEnabled,
            botGreetingMsg:
              body.botGreetingMsg !== undefined ? String(body.botGreetingMsg) : existing.botGreetingMsg,
            botSecurityToken:
              body.botSecurityToken !== undefined ? String(body.botSecurityToken) : existing.botSecurityToken,
            updatedAt: new Date(),
          })
          .where(eq(whatsappConfig.id, existing.id))
          .returning();
        return NextResponse.json(updated);
      }
    }

    return NextResponse.json({ success: false, error: `Ação desconhecida: "${action}"` }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
