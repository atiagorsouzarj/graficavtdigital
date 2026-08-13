/**
 * DemoMode - Modo de demonstração para visualizar o portal de dentro
 *
 * Quando ativado (DEMO_MODE=true ou via /configuracoes), o sistema:
 * 1. Mostra o código OTP na resposta da API (apenas para dev/staging)
 * 2. Pré-popula o banco com clientes e pedidos fictícios
 * 3. Permite entrar como qualquer cliente fictício com 1 clique
 *
 * ATENÇÃO: nunca ative em produção real!
 */

import { db } from "@/db";
import { clients, quotesOrders, quoteOrderItems, systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEMO_CLIENTS = [
  {
    name: "Maria Silva (DEMO)",
    document: "111.222.333-96",
    email: "demo.cliente1@exemplo.com",
    phone: "(21) 99887-7766",
    type: "PF" as const,
  },
  {
    name: "Padaria do João (DEMO)",
    document: "11.222.333/0001-81",
    email: "demo.padaria@exemplo.com",
    phone: "(11) 91234-5678",
    type: "PJ" as const,
    tradeName: "Padaria do João LTDA",
  },
  {
    name: "Raphaela Pinheiro (REAL)",
    document: "172.595.737-08",
    email: "raphaela.pinheiro@gmail.com",
    phone: "(21) 99690-2449",
    type: "PF" as const,
  },
];

const DEMO_PASSWORD = "123456";

export interface DemoClient {
  id: string;
  name: string;
  document: string;
  email: string;
}

/**
 * Lê se o modo demo está ativado (env ou banco)
 */
export async function isDemoMode(): Promise<boolean> {
  // Variável de ambiente sempre vence
  if (process.env.DEMO_MODE === "true") return true;

  // Senão, checa o banco
  try {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "client_portal_demo_mode"));
    return setting?.value === "true";
  } catch {
    return false;
  }
}

/**
 * Lista clientes fictícios (para o painel de demo)
 */
export async function listDemoClients(): Promise<DemoClient[]> {
  const out: DemoClient[] = [];
  for (const c of DEMO_CLIENTS) {
    const [dbClient] = await db.select().from(clients).where(eq(clients.document, c.document));
    if (dbClient) {
      out.push({
        id: dbClient.id,
        name: dbClient.name,
        document: dbClient.document || "",
        email: dbClient.email || "",
      });
    }
  }
  return out;
}

/**
 * Popula o banco com clientes e pedidos de demonstração
 * Idempotente: se já existem, não duplica
 */
export async function seedDemoData(): Promise<{
  clientsCreated: number;
  ordersCreated: number;
}> {
  let clientsCreated = 0;
  let ordersCreated = 0;

  // 1. Garante que os clientes demo existem
  const clientIds: string[] = [];
  for (const c of DEMO_CLIENTS) {
    let [existing] = await db.select().from(clients).where(eq(clients.document, c.document));
    if (!existing) {
      [existing] = await db
        .insert(clients)
        .values({
          name: c.name,
          document: c.document,
          email: c.email,
          phone: c.phone,
          type: c.type,
          tradeName: c.type === "PJ" ? c.tradeName : null,
          clientStatus: "Liberado",
        })
        .returning();
      clientsCreated++;
    }
    if (existing) clientIds.push(existing.id);
  }

  // 2. Cria pedidos fictícios para o primeiro cliente (se não tiver nenhum)
  const firstClientId = clientIds[0];
  if (firstClientId) {
    const existingOrders = await db
      .select()
      .from(quotesOrders)
      .where(eq(quotesOrders.clientId, firstClientId));
    if (existingOrders.length === 0) {
      const demoOrders = [
        {
          code: "PV-DEMO-001",
          type: "order" as const,
          status: "art_approval",
          artApprovalStatus: "pending",
          subtotalAmount: "180.00",
          discountAmount: "0.00",
          freightAmount: "0.00",
          totalAmount: "180.00",
          paymentStatus: "pending",
          paymentMethod: "pix",
          shippingMethod: "pickup",
          notes: "Pedido de demonstração — aguardando aprovação da arte do cliente.",
        },
        {
          code: "ORC-DEMO-002",
          type: "quote" as const,
          status: "sent",
          subtotalAmount: "450.00",
          discountAmount: "0.00",
          freightAmount: "25.00",
          totalAmount: "475.00",
          paymentStatus: "pending",
          paymentMethod: "pix",
          shippingMethod: "superfrete_sedex",
          notes: "Orçamento de demonstração. Aprove os itens ou entre em contato.",
        },
        {
          code: "PV-DEMO-003",
          type: "order" as const,
          status: "completed",
          subtotalAmount: "95.00",
          discountAmount: "5.00",
          freightAmount: "0.00",
          totalAmount: "90.00",
          paymentStatus: "paid",
          paymentMethod: "pix",
          shippingMethod: "pickup",
          notes: "Pedido concluído — para histórico.",
        },
      ];

      for (const o of demoOrders) {
        const [order] = await db
          .insert(quotesOrders)
          .values({
            ...o,
            clientId: firstClientId,
            clientName: DEMO_CLIENTS[0].name,
            clientDocument: DEMO_CLIENTS[0].document,
            clientPhone: DEMO_CLIENTS[0].phone,
            clientEmail: DEMO_CLIENTS[0].email,
          })
          .returning();

        // Itens
        await db.insert(quoteOrderItems).values([
          {
            orderId: order.id,
            productName: "Cartão de Visita Couchê 300g 4x4",
            quantity: 500,
            unitPrice: "0.18",
            totalPrice: "90.00",
          },
          {
            orderId: order.id,
            productName: "Adesivo Vinil 10x5cm",
            quantity: 100,
            unitPrice: "0.90",
            totalPrice: "90.00",
          },
        ]);

        ordersCreated++;
      }
    }
  }

  return { clientsCreated, ordersCreated };
}

export { DEMO_PASSWORD };
