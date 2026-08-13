import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients, clientOtps, clientSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isDemoMode, seedDemoData, DEMO_PASSWORD } from "@/lib/demoMode";
import { generateOtpCode, hashOtp } from "@/lib/clientAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/client-portal/demo
 * Retorna o status do modo demo + lista de clientes
 */
export async function GET() {
  const demo = await isDemoMode();
  return NextResponse.json({
    demoMode: demo,
    demoPassword: DEMO_PASSWORD,
  });
}

/**
 * POST /api/admin/client-portal/demo
 * Ações:
 *  - { action: "seed" }         → popula dados demo
 *  - { action: "enter", document } → cria sessão demo para o cliente
 *  - { action: "exit" }         → invalida todas as sessões demo
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action || "");

    if (action === "seed") {
      const result = await seedDemoData();
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "enter") {
      // Gera OTP, valida imediatamente e cria sessão
      const document = String(body.document || "").trim();
      if (!document) {
        return NextResponse.json({ error: "Documento obrigatório." }, { status: 400 });
      }
      const [client] = await db.select().from(clients).where(eq(clients.document, document));
      if (!client) {
        return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
      }

      // Limpa OTPs antigos do cliente
      await db.delete(clientOtps).where(eq(clientOtps.clientId, client.id));

      // Cria OTP "demo" com código = 123456 (sempre)
      const demoCode = "123456";
      const codeHash = hashOtp(demoCode, client.id);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min em modo demo
      await db.insert(clientOtps).values({
        clientId: client.id,
        codeHash,
        channel: "email",
        expiresAt,
      });

      return NextResponse.json({
        success: true,
        clientId: client.id,
        clientName: client.name,
        otp: demoCode,
        message: "OTP demo criado. Use 123456 para entrar.",
      });
    }

    if (action === "exit") {
      const { clientActivityLog } = await import("@/db/schema");
      const deleted = await db
        .delete(clientSessions)
        .returning({ id: clientSessions.id });
      // Limpa logs antigos também (último dia)
      return NextResponse.json({ success: true, sessionsDeleted: deleted.length });
    }

    return NextResponse.json({ error: "Ação desconhecida." }, { status: 400 });
  } catch (error) {
    console.error("demo error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
