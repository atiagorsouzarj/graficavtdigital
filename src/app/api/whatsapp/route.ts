import { NextResponse } from "next/server";
import { db } from "@/db";
import { whatsappConfig, communicationTemplates } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getWhatsAppInstance, initializeWhatsApp, sendMessage } from "@/lib/whatsappService";

export const dynamic = "force-dynamic";

// Outbox memory store for real-time history
const outboxHistory = [
  { id: "wa_1", phone: "(11) 98765-4321", clientName: "Studio Design Ltda", templateCode: "quote_sent", body: "Olá Studio Design Ltda, tudo bem? Segue o seu orçamento *PV-0000101* no valor de *R$ 215,00*.", status: "LIDO", time: "Há 12 min" },
  { id: "wa_2", phone: "(11) 97123-4567", clientName: "Lucas Mendes", templateCode: "art_approval", body: "Olá Lucas Mendes! A arte digital do pedido *PV-0000008* está pronta para validação em https://printflow.com.br/aprovar-arte/demo.", status: "ENTREGUE", time: "Há 28 min" },
  { id: "wa_3", phone: "(11) 99112-2334", clientName: "Restaurante Sabor & Arte", templateCode: "ready_for_pickup", body: "Eba! Seu pedido *ORC-2025-009* está PRONTO PARA RETIRADA no balcão da gráfica.", status: "ENTREGUE", time: "Há 1 hora" },
];

export async function GET() {
  try {
    await seedDatabase();

    // Inicializar Baileys em background
    try {
      await initializeWhatsApp();
    } catch (e) {
      console.error('[API] Erro ao inicializar Baileys:', e);
    }

    const instance = getWhatsAppInstance();
    const [config] = await db.select().from(whatsappConfig).limit(1);
    const templates = await db.select().from(communicationTemplates).where(eq(communicationTemplates.channel, "whatsapp"));

    // Gerar QR code PNG se tiver dados do Baileys
    let qrCodeImage = null;
    if (instance.qrCode) {
      qrCodeImage = await QRCode.toDataURL(instance.qrCode, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 300,
      });
    }

    const response = {
      config: {
        ...config,
        status: instance.isConnected ? "connected" : instance.qrCode ? "pairing" : "disconnected",
        connectedPhone: instance.phoneNumber || config?.connectedPhone || null,
        qrCodeUrl: qrCodeImage,
      },
      templates,
      outbox: outboxHistory,
      socketInfo: {
        engine: "Baileys @whiskeysockets v6.7.0",
        isConnected: instance.isConnected,
        phoneNumber: instance.phoneNumber,
        qrPending: !!instance.qrCode,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const instance = getWhatsAppInstance();

    // 1. Inicializar / Gerar novo QR Code real do Baileys
    if (body.action === "generate_qr" || body.action === "init") {
      try {
        const wh = await initializeWhatsApp();

        if (wh.qrCode) {
          const qrCodeImage = await QRCode.toDataURL(wh.qrCode, {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 300,
          });

          return NextResponse.json({
            success: true,
            qrCodeUrl: qrCodeImage,
            status: "pairing",
            message: "QR Code gerado - escaneie com WhatsApp em 60 segundos",
          });
        } else if (wh.isConnected) {
          return NextResponse.json({
            success: true,
            status: "connected",
            phoneNumber: wh.phoneNumber,
            message: "WhatsApp já está conectado",
          });
        } else {
          return NextResponse.json({
            success: false,
            message: "Aguarde o QR Code ser gerado...",
          }, { status: 202 });
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: String(error),
        }, { status: 500 });
      }
    }

    // 2. Verificar status de conexão
    if (body.action === "status") {
      return NextResponse.json({
        isConnected: instance.isConnected,
        phoneNumber: instance.phoneNumber,
        hasQR: !!instance.qrCode,
        qrExpired: instance.lastQRTime ? Date.now() - instance.lastQRTime > 60000 : true,
      });
    }

    // 3. Enviar mensagem real via Baileys
    if (body.action === "send_message") {
      if (!instance.isConnected) {
        return NextResponse.json({
          success: false,
          error: "WhatsApp não está conectado",
        }, { status: 400 });
      }

      try {
        const result = await sendMessage(body.phone, body.message);

        const newEntry = {
          id: result.messageId || `wa_${Date.now()}`,
          phone: body.phone,
          clientName: body.clientName || "Cliente WhatsApp",
          templateCode: body.templateCode || "custom",
          body: body.message,
          status: "ENTREGUE",
          time: "Agora mesmo",
        };
        outboxHistory.unshift(newEntry);

        return NextResponse.json({
          success: true,
          sentTo: body.phone,
          message: body.message,
          timestamp: new Date().toISOString(),
          status: "delivered",
          entry: newEntry,
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: String(error),
        }, { status: 500 });
      }
    }

    // 4. Bot Auto-Responder Simulation (Testing Customer Menu Options)
    if (body.action === "bot_simulate") {
      const userText = (body.message || "").trim();
      let botReply = "";

      if (userText === "1") {
        botReply = "📋 *Solicitação de Orçamento*\n\nPara agilizar o seu atendimento, por favor envie:\n• O item que precisa (ex: Cartão de Visita, Banner, Caneca)\n• A quantidade desejada\n• Se possui arte pronta\n\nNossa equipe comercial retornará em instantes!";
      } else if (userText === "2") {
        botReply = "🎨 *Aprovação de Arte Digital*\n\nVocê pode visualizar e aprovar sua prova digital diretamente pelo portal do cliente:\n👉 https://printflow.com.br/aprovar-arte/demo\n\nLá você pode autorizar a impressão ou solicitar ajustes no layout!";
      } else if (userText === "3" || userText.toUpperCase().startsWith("PV") || userText.toUpperCase().startsWith("ORC")) {
        const orderCode = userText.length > 3 ? userText.toUpperCase() : "PV-0000101";
        botReply = `🔍 *Status do Pedido ${orderCode}*\n\n• *Cliente:* Studio Design Ltda\n• *Status Produção:* 🖨️ Em Impressão Digital\n• *Situação Financeira:* ✅ PAGO\n• *Envio SuperFrete:* SF982310844BR (SEDEX)\n\nAcompanhe em tempo real em: https://printflow.com.br/rastreio/${orderCode}`;
      } else if (userText === "4") {
        botReply = "👨‍💻 *Atendimento Humano*\n\nEntendi! Transferindo você agora para um de nossos atendentes. Por favor aguarde um momento na linha...";
      } else {
        const [config] = await db.select().from(whatsappConfig).limit(1);
        botReply = config?.botGreetingMsg || "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Escolha uma opção de 1 a 4.";
      }

      return NextResponse.json({
        success: true,
        userMessage: userText,
        botReply,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
    }

    // 5. Update Bot Configuration & Token
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
