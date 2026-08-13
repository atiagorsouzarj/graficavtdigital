import QRCode from "qrcode";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { db } from "@/db";
import { whatsappConfig, communicationTemplates, quotesOrders } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { AntiBanEngine } from "@/lib/antiBanEngine";
import fs from "fs";
import path from "path";

const authDir = path.join(process.cwd(), ".wh-auth");
let baileysSocket: any = null;
let baileysQrCode: string | null = null;
let socketConnectedAt: number | null = null;
let connectedPhoneNumber: string | null = null;
let reconnectAttempts = 0;
let reconnectTimer: NodeJS.Timeout | null = null;
let intentionalDisconnect = false;
let pairingFlag = false;

const qrWaiters: Array<(qr: string) => void> = [];
const openWaiters: Array<() => void> = [];

if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

export interface WhatsappStatusResponse {
  instanceName: string;
  status: "connected" | "pairing" | "disconnected";
  connectedPhone: string;
  qrCodeUrl?: string | null;
  pairingCode?: string | null;
  botEnabled: boolean;
  botSecurityToken: string;
}

export interface LiveChatMessage {
  id: string;
  contactPhone: string;
  contactName: string;
  sender: "customer" | "agent" | "bot";
  message: string;
  timestamp: string;
  status: "sent" | "delivered" | "read" | "failed" | "queued";
}

export interface LiveChatContact {
  phone: string;
  name: string;
  lastMessage: string;
  lastTime: string;
  botPaused: boolean;
  unreadCount: number;
}

const pausedContactsSet = new Set<string>();
const liveChatMessages: LiveChatMessage[] = [
  {
    id: "msg_1",
    contactPhone: "(11) 98765-4321",
    contactName: "Studio Design & Eventos",
    sender: "customer",
    message: "Olá! Gostaria de saber o valor de 500 cartões de visita e se entregam em SP.",
    timestamp: "10:15",
    status: "read",
  },
  {
    id: "msg_2",
    contactPhone: "(11) 98765-4321",
    contactName: "Studio Design & Eventos",
    sender: "bot",
    message: "Olá! O valor de 500 cartões de visita Couchê 300g com verniz é R$ 95,00. Entregamos via SuperFrete SEDEX em toda SP!",
    timestamp: "10:16",
    status: "read",
  },
  {
    id: "msg_3",
    contactPhone: "(21) 99690-2449",
    contactName: "Raphaela Pinheiro",
    sender: "customer",
    message: "Boa tarde! O meu pedido PV-003798 já está pronto?",
    timestamp: "11:30",
    status: "read",
  },
  {
    id: "msg_4",
    contactPhone: "(21) 99690-2449",
    contactName: "Raphaela Pinheiro",
    sender: "agent",
    message: "Boa tarde Raphaela! Sim, o seu topo de bolo e impressões estão prontos e embalados para retirada!",
    timestamp: "11:32",
    status: "delivered",
  },
];

const STATUS_LABELS: Record<string, string> = {
  draft: "📝 Rascunho",
  sent: "📤 Orçamento Enviado",
  art_approval: "🎨 Aguardando Aprovação de Arte",
  art_pending: "✏️ Alteração de Arte Solicitada",
  production_ready: "✅ Pronto para Produção",
  in_printing: "🖨️ Em Impressão Digital",
  finishing: "✂️ Em Acabamento",
  ready_for_pickup: "📦 Pronto para Entrega / Retirada",
  completed: "🚚 Despachado / Concluído",
  cancelled: "❌ Cancelado",
};

/**
 * Senior Baileys WhatsApp Service - makeWASocket (WebSockets Bridge), Anti-Ban Delays,
 * Human Presence, Live Chat & Kanban Triggers.
 */
export class WhatsappService {
  /**
   * Anti-ban jitter delay helper (simulates human typing pauses).
   */
  static async antiBanDelay(minMs: number = 1500, maxMs: number = 3500): Promise<void> {
    return AntiBanEngine.humanDelay(minMs, maxMs);
  }

  static isSocketConnected(): boolean {
    return Boolean(baileysSocket && socketConnectedAt);
  }

  static getSocketInfo() {
    return {
      engine: "Baileys WebSockets Bridge v6.7.24 (makeWASocket + useMultiFileAuthState)",
      connected: this.isSocketConnected(),
      connectedPhone: connectedPhoneNumber,
      uptimeSeconds: socketConnectedAt ? Math.floor((Date.now() - socketConnectedAt) / 1000) : 0,
      authDir: ".wh-auth/",
      reconnectAttempts,
      qrCodeAvailable: Boolean(baileysQrCode),
    };
  }

  private static async persistStatus(status: string, qrCodeUrl?: string | null): Promise<void> {
    try {
      const [existing] = await db.select().from(whatsappConfig).limit(1);
      if (existing) {
        const setData: Record<string, unknown> = { status, updatedAt: new Date() };
        if (qrCodeUrl !== undefined) setData.qrCodeUrl = qrCodeUrl;
        await db.update(whatsappConfig).set(setData).where(eq(whatsappConfig.id, existing.id));
      }
    } catch (error) {
      console.error("persistStatus WhatsApp error:", error);
    }
  }

  private static scheduleReconnect(): void {
    if (reconnectTimer || intentionalDisconnect || reconnectAttempts >= 10) return;
    const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 300000);
    reconnectAttempts += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (!intentionalDisconnect) {
        try {
          this.initSocket();
        } catch (error) {
          console.error("WhatsApp reconnect failed:", error);
          this.scheduleReconnect();
        }
      }
    }, delay);
  }

  /**
   * Cria o socket Baileys REAL (makeWASocket) com proteções anti-ban:
   * - connectTimeoutMs / qrTimeout (evita sessão pendurada)
   * - markOnlineOnConnect: false (não fica "online" permanentemente)
   * - Listener messages.upsert (bot automático com cooldown + cotas)
   * - Reconexão automática com backoff exponencial
   */
  private static initSocket(): any {
    if (baileysSocket) {
      try {
        intentionalDisconnect = true;
        baileysSocket.end(new Error("socket_replace"));
      } catch {
        /* ignore */
      }
      baileysSocket = null;
    }

    let sock: any = null;
    let state: any = null;

    (async () => {
      const auth = await useMultiFileAuthState(authDir);
      state = auth.state;
      const saveCreds = auth.saveCreds;

      if (baileysSocket && baileysSocket !== sock) {
        // A nova sessão foi criada por outro request; descarta esta.
        try {
          sock?.end(new Error("duplicate_socket"));
        } catch {
          /* ignore */
        }
        return;
      }

      sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["PrintFlow ERP", "Chrome", "120.0"],
        syncFullHistory: false,
        retryRequestDelayMs: 100,
        connectTimeoutMs: 60000,
        qrTimeout: 60000,
        markOnlineOnConnect: false,
      });

      baileysSocket = sock;

      sock.ev.on("connection.update", (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          baileysQrCode = qr;
          pairingFlag = true;
          const waiters = qrWaiters.splice(0, qrWaiters.length);
          waiters.forEach((w) => {
            try {
              w(qr);
            } catch (err) {
              console.error("QR waiter error:", err);
            }
          });
        }

        if (connection === "open") {
          socketConnectedAt = Date.now();
          reconnectAttempts = 0;
          pairingFlag = false;
          baileysQrCode = null;
          connectedPhoneNumber = sock.user?.id?.split(":")[0] || null;
          this.persistStatus("connected", null);
          const waiters = openWaiters.splice(0, openWaiters.length);
          waiters.forEach((w) => {
            try {
              w();
            } catch (err) {
              console.error("Open waiter error:", err);
            }
          });
        }

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          socketConnectedAt = null;
          const wasLoggedOut = statusCode === 401;

          if (wasLoggedOut && typeof sock.logout === "function") {
            try {
              sock.logout();
            } catch {
              /* ignore */
            }
          }

          if (!intentionalDisconnect && !wasLoggedOut) {
            this.scheduleReconnect();
          }

          intentionalDisconnect = false;
          this.persistStatus("disconnected", null);
        }
      });

      sock.ev.on("creds.update", saveCreds);

      // BOT AUTOMÁTICO: mensagens reais recebidas via WebSocket
      sock.ev.on("messages.upsert", async (update: any) => {
        const { messages, type } = update;
        if (type !== "notify") return;

        for (const msg of messages || []) {
          if (!msg || msg.key?.fromMe) continue;

          const jid = String(msg.key?.remoteJid || "");
          if (!jid.endsWith("@s.whatsapp.net")) continue;

          const content = msg.message || {};
          const text =
            content.conversation ||
            content.extendedTextMessage?.text ||
            content.imageMessage?.caption ||
            content.videoMessage?.caption ||
            "";
          if (!text) continue;

          const phone = jid.replace("@s.whatsapp.net", "");

          try {
            const result = await this.processBotQuery(phone, text);
            if (!result.reply || result.throttled || result.botPaused) continue;

            // Anti-ban: delay humano antes de responder
            await this.antiBanDelay(1500, 3500);
            const sent = await this.sendRawText(jid, result.reply);
            if (sent) AntiBanEngine.recordSend(phone);
          } catch (error) {
            console.error("messages.upsert bot handler error:", error);
          }
        }
      });
    })().catch((error) => {
      console.error("initSocket async error:", error);
    });

    return sock;
  }

  /**
   * Envia texto real pelo socket com presença de digitação humana.
   */
  private static async sendRawText(jid: string, text: string): Promise<boolean> {
    if (!baileysSocket) return false;
    try {
      await baileysSocket.sendPresenceUpdate("composing", jid);
      await AntiBanEngine.typingDelayForText(text);
      const res = await baileysSocket.sendMessage(jid, { text });
      await baileysSocket.sendPresenceUpdate("paused", jid);
      return Boolean(res);
    } catch (error) {
      console.error("sendRawText error:", error);
      return false;
    }
  }

  /**
   * Connect or Disconnect Baileys Bridge socket session.
   */
  static async setConnectionStatus(status: "connected" | "disconnected"): Promise<string> {
    if (status === "disconnected") {
      await this.disconnectSocket();
      return "disconnected";
    }

    if (!this.isSocketConnected()) {
      if (!baileysSocket) this.initSocket();
      // Aguarda a conexão abrir (ou QR para pareamento)
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 15000);
        openWaiters.push(() => {
          clearTimeout(timer);
          resolve();
        });
      });
    }

    if (this.isSocketConnected()) {
      await this.persistStatus("connected", null);
      return "connected";
    }

    await this.persistStatus("pairing", baileysQrCode);
    return "pairing";
  }

  static async disconnectSocket(): Promise<void> {
    intentionalDisconnect = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (baileysSocket) {
      try {
        await baileysSocket.end(new Error("manual_disconnect"));
      } catch {
        /* ignore */
      }
      baileysSocket = null;
    }
    socketConnectedAt = null;
    baileysQrCode = null;
    await this.persistStatus("disconnected", null);
  }

  /**
   * Generates a real Baileys QR Code via makeWASocket (WebSockets integration)
   * with qrTimeout protection (60s).
   */
  static async generateQrCode(): Promise<{
    qrCodeUrl: string;
    pairingCode: string;
    status: string;
  }> {
    try {
      await this.disconnectSocket();
      intentionalDisconnect = false;
      this.initSocket();

      return await new Promise((resolve) => {
        let settled = false;
        const finish = (result: { qrCodeUrl: string; pairingCode: string; status: string }) => {
          if (!settled) {
            settled = true;
            resolve(result);
          }
        };

        const timeout = setTimeout(() => {
          finish({ qrCodeUrl: "", pairingCode: "TIMEOUT", status: "timeout" });
        }, 65000);

        qrWaiters.push(async (qr: string) => {
          clearTimeout(timeout);
          const qrCodeUrl = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 320,
            color: { dark: "#0f172a", light: "#ffffff" },
          });

          await this.persistStatus("pairing", qrCodeUrl);
          finish({
            qrCodeUrl,
            pairingCode: "BAILEYS_REAL_SOCKET",
            status: "pairing",
          });
        });
      });
    } catch (error) {
      console.error("generateQrCode error:", error);
      return {
        qrCodeUrl: "",
        pairingCode: "ERROR",
        status: "error",
      };
    }
  }

  /**
   * Toggle Human Agent Takeover (Pausing/Resuming Bot for a specific customer contact).
   */
  static toggleBotPauseForContact(phone: string, pause: boolean): boolean {
    const cleanPhone = phone.replace(/\D/g, "");
    if (pause) {
      pausedContactsSet.add(cleanPhone);
    } else {
      pausedContactsSet.delete(cleanPhone);
    }
    return pausedContactsSet.has(cleanPhone);
  }

  static isBotPausedForContact(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, "");
    return pausedContactsSet.has(cleanPhone);
  }

  /**
   * Send WhatsApp message with anti-ban delay and presence ('composing') simulation.
   * Envia de verdade pelo socket quando conectado; senão fica em fila ("queued").
   */
  static async sendMessageWithPresence(payload: {
    phone: string;
    clientName?: string;
    templateCode?: string;
    message: string;
    sender?: "agent" | "bot";
  }): Promise<{
    success: boolean;
    sentTo: string;
    message: string;
    timestamp: string;
    status: string;
    error?: string;
  }> {
    const phone = String(payload.phone || "").trim();
    const message = String(payload.message || "").trim();

    if (!phone || !message) {
      return {
        success: false,
        sentTo: phone,
        message,
        timestamp: new Date().toISOString(),
        status: "failed",
        error: "Telefone e mensagem são obrigatórios.",
      };
    }

    // Anti-ban: verifica cotas antes de qualquer envio
    const rateCheck = AntiBanEngine.checkRateLimit(phone);
    if (!rateCheck.allowed) {
      return {
        success: false,
        sentTo: phone,
        message,
        timestamp: new Date().toISOString(),
        status: "rate_limited",
        error: `Envio bloqueado pela proteção anti-ban (${rateCheck.reason}). ${
          rateCheck.cooldownRemainingMs
            ? `Aguarde ${Math.ceil(rateCheck.cooldownRemainingMs / 1000)}s antes de responder este contato novamente.`
            : "Cota de mensagens atingida."
        }`,
      };
    }

    const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    let finalStatus: LiveChatMessage["status"] = "queued";

    if (this.isSocketConnected()) {
      // Anti-ban: delay humano entre 1.5s e 3.5s antes do envio
      await this.antiBanDelay(1500, 3500);
      const jid = `${phone.replace(/\D/g, "")}@s.whatsapp.net`;
      const sent = await this.sendRawText(jid, message);
      finalStatus = sent ? "delivered" : "failed";
      if (sent) AntiBanEngine.recordSend(phone);
    }

    const newMsg: LiveChatMessage = {
      id: `msg_${Date.now()}`,
      contactPhone: phone,
      contactName: payload.clientName || "Cliente WhatsApp",
      sender: payload.sender || "agent",
      message,
      timestamp: timeNow,
      status: finalStatus,
    };

    liveChatMessages.push(newMsg);

    return {
      success: finalStatus !== "failed",
      sentTo: phone,
      message,
      timestamp: new Date().toISOString(),
      status: finalStatus,
    };
  }

  /**
   * Trigger Kanban stage transition WhatsApp message.
   */
  static async triggerKanbanStageMessage(
    orderCode: string,
    clientName: string,
    phone: string,
    newStatus: string
  ): Promise<boolean> {
    try {
      const templateCode = `wa_${newStatus}`;
      const [template] = await db
        .select()
        .from(communicationTemplates)
        .where(eq(communicationTemplates.code, templateCode));

      let body =
        template?.body ||
        `Olá ${clientName}! O status do seu pedido *${orderCode}* foi atualizado para: *${newStatus.toUpperCase()}*. Acompanhe em: https://printflow.com.br/rastreio/${orderCode}`;

      body = body
        .replace(/\{\{nome_cliente\}\}/g, clientName)
        .replace(/\{\{codigo_pedido\}\}/g, orderCode)
        .replace(/\{\{link_aprovacao\}\}/g, `https://printflow.com.br/aprovar-arte/${orderCode}`);

      const result = await this.sendMessageWithPresence({
        phone,
        clientName,
        templateCode,
        message: body,
        sender: "bot",
      });

      return result.success;
    } catch (err) {
      console.error("Error triggering Kanban WhatsApp message:", err);
      return false;
    }
  }

  /**
   * Process customer message through Bot engine with human takeover check,
   * cooldown anti-spam e cotas anti-ban.
   */
  static async processBotQuery(phone: string, userTextRaw: string): Promise<{
    botPaused: boolean;
    reply: string;
    timestamp: string;
    throttled: boolean;
  }> {
    const isPaused = this.isBotPausedForContact(phone);
    const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Store incoming customer message in Live Chat
    liveChatMessages.push({
      id: `msg_${Date.now()}`,
      contactPhone: phone,
      contactName: "Cliente WhatsApp",
      sender: "customer",
      message: userTextRaw,
      timestamp: timeNow,
      status: "read",
    });

    if (isPaused) {
      return {
        botPaused: true,
        reply: "Bot pausado para este contato (Atendente humano assumiu a conversa).",
        timestamp: timeNow,
        throttled: true,
      };
    }

    // Anti-ban: cooldown de resposta automática por contato
    const cooldownRemaining = AntiBanEngine.getAutoReplyCooldownRemaining(phone);
    if (cooldownRemaining > 0) {
      return { botPaused: false, reply: "", timestamp: timeNow, throttled: true };
    }

    // Anti-ban: cotas globais e por contato
    const rateCheck = AntiBanEngine.checkRateLimit(phone);
    if (!rateCheck.allowed) {
      return { botPaused: false, reply: "", timestamp: timeNow, throttled: true };
    }

    const userText = userTextRaw.trim().toUpperCase();
    let botReply = "";

    if (userText === "1") {
      botReply =
        "📋 *Solicitação de Orçamento*\n\nPara agilizar o seu atendimento, por favor envie:\n• O item que precisa (ex: Cartão de Visita, Banner, Caneca, DTF)\n• A quantidade desejada\n• Se possui arte pronta\n\nNossa equipe comercial retornará em instantes!";
    } else if (userText === "2") {
      botReply =
        "🎨 *Aprovação de Arte Digital*\n\nVocê pode visualizar e aprovar sua prova digital diretamente pelo portal do cliente:\n👉 https://printflow.com.br/aprovar-arte/demo\n\nLá você pode autorizar a impressão ou solicitar ajustes no layout!";
    } else if (
      userText === "3" ||
      userText.startsWith("PV") ||
      userText.startsWith("ORC") ||
      userText.startsWith("CUP")
    ) {
      botReply = await this.buildOrderStatusReply(userText);
    } else if (userText === "4") {
      this.toggleBotPauseForContact(phone, true);
      botReply =
        "👨‍💻 *Atendimento Humano*\n\nEntendi! Pausamos o robô automático e transferimos você para um de nossos atendentes humanos. Por favor aguarde um momento...";
    } else {
      const [config] = await db.select().from(whatsappConfig).limit(1);
      botReply =
        config?.botGreetingMsg ||
        "Olá! Bem-vindo à PrintFlow Gráfica Criativa. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano";
    }

    // Registra resposta automática no cooldown anti-ban
    AntiBanEngine.recordAutoReply(phone);

    // Store bot reply in Live Chat
    liveChatMessages.push({
      id: `msg_bot_${Date.now()}`,
      contactPhone: phone,
      contactName: "PrintFlow Bot",
      sender: "bot",
      message: botReply,
      timestamp: timeNow,
      status: "delivered",
    });

    return {
      botPaused: false,
      reply: botReply,
      timestamp: timeNow,
      throttled: false,
    };
  }

  /**
   * Consulta status REAL do pedido no banco (comando "3" do bot).
   */
  private static async buildOrderStatusReply(userText: string): Promise<string> {
    const code = userText.trim();
    if (code === "3") {
      return "🔍 *Consulta de Status do Pedido*\n\nDigite o código do seu pedido (ex: *PV-0000101*) para consultar o status em tempo real.\n\nVocê encontra o código no e-mail, orçamento ou nota do pedido.";
    }

    try {
      const [order] = await db
        .select()
        .from(quotesOrders)
        .where(or(eq(quotesOrders.code, code), eq(quotesOrders.id, code)));

      if (order) {
        const statusLabel = STATUS_LABELS[order.status] || order.status.toUpperCase();
        const payLabel = order.paymentStatus === "paid" ? "✅ PAGO" : "⏳ PENDENTE";
        return `🔍 *Status do Pedido ${order.code}*\n\n• *Cliente:* ${order.clientName}\n• *Status Produção:* ${statusLabel}\n• *Situação Financeira:* ${payLabel}${
          order.shippingTrackingCode ? `\n• *Envio:* ${order.shippingTrackingCode}` : ""
        }\n\nAcompanhe em tempo real em: https://printflow.com.br/rastreio/${order.code}`;
      }
    } catch (error) {
      console.error("buildOrderStatusReply error:", error);
    }

    return `🔍 *Pedido ${code} não encontrado*\n\nNão localizamos um pedido com esse código. Confira se digitou corretamente ou envie *3* para saber como consultar seu pedido.`;
  }

  /**
   * Get all live chat conversations grouped by contact.
   */
  static getLiveChatOverview(): {
    contacts: LiveChatContact[];
    messages: LiveChatMessage[];
  } {
    const contactsMap = new Map<string, LiveChatContact>();

    liveChatMessages.forEach((msg) => {
      const phone = msg.contactPhone;
      const isPaused = this.isBotPausedForContact(phone);

      contactsMap.set(phone, {
        phone,
        name: msg.contactName || "Cliente WhatsApp",
        lastMessage: msg.message,
        lastTime: msg.timestamp,
        botPaused: isPaused,
        unreadCount: msg.sender === "customer" ? 1 : 0,
      });
    });

    return {
      contacts: Array.from(contactsMap.values()),
      messages: liveChatMessages,
    };
  }
}
