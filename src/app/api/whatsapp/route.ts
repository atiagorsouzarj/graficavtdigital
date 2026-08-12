import { NextResponse } from "next/server";
import { db } from "@/db";
import { whatsappConfig, communicationTemplates } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { WhatsappService } from "@/lib/whatsappService";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const [config] = await db.select().from(whatsappConfig).limit(1);
    const templates = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.channel, "whatsapp"));

    const chatOverview = WhatsappService.getLiveChatOverview();

    const defaultConfig = config || {
      instanceName: "Baileys Main Instance (Baileys v6.7.0)",
      status: "connected",
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
      socketInfo: {
        engine: "Baileys WebSockets Bridge v6.7.0 (useMultiFileAuthState)",
        batteryLevel: "98%",
        uptime: "14 dias, 6 horas",
        sessionToken: "baileys_sess_9918237912837",
        authDir: ".wh-auth/",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); // { action: 'generate_qr' | 'connect' | 'disconnect' | 'send_message' | 'bot_simulate' | 'pause_bot' | 'resume_bot' | 'update_config' }

    // 1. Generate Baileys QR Code
    if (body.action === "generate_qr") {
      const qrData = await WhatsappService.generateQrCode();
      return NextResponse.json(qrData);
    }

    // 2. Connect / Disconnect Baileys Bridge
    if (body.action === "connect" || body.action === "disconnect") {
      const nextStatus = body.action === "connect" ? "connected" : "disconnected";
      await WhatsappService.setConnectionStatus(nextStatus);
      return NextResponse.json({ success: true, status: nextStatus });
    }

    // 3. Send Message with Anti-Ban Delay & Presence
    if (body.action === "send_message") {
      const result = await WhatsappService.sendMessageWithPresence({
        phone: body.phone,
        clientName: body.clientName,
        templateCode: body.templateCode,
        message: body.message,
        sender: body.sender || "agent",
      });
      return NextResponse.json(result);
    }

    // 4. Pause / Resume Bot for a Contact (Human Agent Takeover)
    if (body.action === "pause_bot" || body.action === "resume_bot") {
      const pause = body.action === "pause_bot";
      const isPaused = WhatsappService.toggleBotPauseForContact(body.phone || "", pause);
      return NextResponse.json({
        success: true,
        contactPhone: body.phone,
        botPaused: isPaused,
        message: isPaused
          ? "Bot de autoatendimento pausado. Atendente humano assumiu a conversa!"
          : "Bot de autoatendimento reativado para este contato.",
      });
    }

    // 5. Bot Auto-Responder Simulation
    if (body.action === "bot_simulate") {
      const phone = body.phone || "(11) 98765-4321";
      const result = WhatsappService.processBotQuery(phone, body.message || "");
      return NextResponse.json({
        success: true,
        userMessage: body.message,
        ...result,
      });
    }

    // 6. Update Configuration
    if (body.action === "update_config") {
      const [existing] = await db.select().from(whatsappConfig).limit(1);
      if (existing) {
        const [updated] = await db
          .update(whatsappConfig)
          .set({
            instanceName: body.instanceName || existing.instanceName,
            status: body.status !== undefined ? body.status : existing.status,
            connectedPhone: body.connectedPhone !== undefined ? body.connectedPhone : existing.connectedPhone,
            botEnabled: body.botEnabled !== undefined ? body.botEnabled : existing.botEnabled,
            botGreetingMsg: body.botGreetingMsg !== undefined ? body.botGreetingMsg : existing.botGreetingMsg,
            botSecurityToken: body.botSecurityToken !== undefined ? body.botSecurityToken : existing.botSecurityToken,
            updatedAt: new Date(),
          })
          .where(eq(whatsappConfig.id, existing.id))
          .returning();
        return NextResponse.json(updated);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
