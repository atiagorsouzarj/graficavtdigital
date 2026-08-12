import { makeWASocket, useMultiFileAuthState, DisconnectReason, WAMessage } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';

interface WhatsAppInstance {
  sock: any | null;
  qrCode: string | null;
  isConnected: boolean;
  phoneNumber: string | null;
  lastQRTime: number;
}

const authDir = path.join(process.cwd(), '.wh-auth');
let whatsappInstance: WhatsAppInstance = {
  sock: null,
  qrCode: null,
  isConnected: false,
  phoneNumber: null,
  lastQRTime: 0,
};

// Garantir que o diretório de auth existe
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

export async function initializeWhatsApp() {
  if (whatsappInstance.sock) {
    return whatsappInstance;
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: ['PrintFlow ERP', 'Chrome', '120.0'],
      syncFullHistory: false,
      shouldIgnoreJid: () => false,
      retryRequestDelayMs: 100,
    });

    // Evento: QR Code gerado
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update;

      if (qr) {
        // Novo QR code disponível
        whatsappInstance.qrCode = qr;
        whatsappInstance.lastQRTime = Date.now();
        console.log('[WhatsApp] QR Code gerado (válido por 60s)');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('[WhatsApp] Conexão fechada:', lastDisconnect?.error);

        if (shouldReconnect) {
          whatsappInstance.sock = null;
          whatsappInstance.isConnected = false;
          // Auto-reconectar após 5s
          setTimeout(() => {
            initializeWhatsApp().catch(console.error);
          }, 5000);
        } else {
          console.log('[WhatsApp] Logout detectado - aguardando novo QR');
          whatsappInstance.isConnected = false;
        }
      } else if (connection === 'open') {
        whatsappInstance.isConnected = true;
        whatsappInstance.qrCode = null;
        const jid = sock.user?.id;
        whatsappInstance.phoneNumber = jid ? jid.split(':')[0] : null;
        console.log('[WhatsApp] Conectado:', whatsappInstance.phoneNumber);
      }
    });

    // Evento: Credenciais atualizadas
    sock.ev.on('creds.update', saveCreds);

    // Evento: Mensagens recebidas (opcional)
    sock.ev.on('messages.upsert', async (m) => {
      console.log('[WhatsApp] Mensagem recebida:', m.messages[0]?.key?.remoteJid);
    });

    whatsappInstance.sock = sock;
    return whatsappInstance;
  } catch (error) {
    console.error('[WhatsApp] Erro ao inicializar:', error);
    throw error;
  }
}

export function getWhatsAppInstance() {
  return whatsappInstance;
}

export async function sendMessage(phoneNumber: string, text: string) {
  if (!whatsappInstance.sock || !whatsappInstance.isConnected) {
    throw new Error('WhatsApp não está conectado');
  }

  try {
    const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    const response = await whatsappInstance.sock.sendMessage(jid, { text });
    return { success: true, messageId: response.key.id };
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar mensagem:', error);
    throw error;
  }
}

export async function sendMediaMessage(
  phoneNumber: string,
  mediaPath: string,
  caption?: string
) {
  if (!whatsappInstance.sock || !whatsappInstance.isConnected) {
    throw new Error('WhatsApp não está conectado');
  }

  try {
    const jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    const mediaBuffer = fs.readFileSync(mediaPath);
    const mediaType = mediaPath.endsWith('.pdf') ? 'document' : 'image';

    const response = await whatsappInstance.sock.sendMessage(jid, {
      [mediaType]: mediaBuffer,
      caption,
    });
    return { success: true, messageId: response.key.id };
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar mídia:', error);
    throw error;
  }
}

export async function disconnect() {
  if (whatsappInstance.sock) {
    await whatsappInstance.sock.end();
    whatsappInstance.sock = null;
    whatsappInstance.isConnected = false;
    whatsappInstance.qrCode = null;
  }
}
