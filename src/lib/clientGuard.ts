/**
 * ClientGuard - Helpers para rotas API que exigem cliente autenticado
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { clientSessions, clients } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { CLIENT_SESSION_COOKIE, verifySessionToken } from "@/lib/clientAuth";

export interface AuthenticatedClient {
  clientId: string;
  sessionId: string;
  client: typeof clients.$inferSelect;
}

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

export async function requireClient(): Promise<AuthenticatedClient | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Sessão expirada. Faça login novamente." },
      { status: 401 }
    );
  }

  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json(
      { error: "Token de sessão inválido." },
      { status: 401 }
    );
  }

  // Defesa: se o token contém ids corrompidos/inválidos, não deixa chegar ao banco
  if (!isValidUuid(session.clientId) || !isValidUuid(session.sessionId)) {
    return NextResponse.json(
      { error: "Sessão inválida. Faça login novamente." },
      { status: 401 }
    );
  }

  try {
    // Valida no banco
    const [dbSession] = await db
      .select()
      .from(clientSessions)
      .where(
        and(
          eq(clientSessions.id, session.sessionId),
          gt(clientSessions.expiresAt, new Date())
        )
      );

    if (!dbSession) {
      return NextResponse.json(
        { error: "Sessão expirada. Faça login novamente." },
        { status: 401 }
      );
    }

    // Carrega dados do cliente
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, session.clientId));

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    // Atualiza lastUsedAt (best-effort)
    try {
      await db
        .update(clientSessions)
        .set({ lastUsedAt: new Date() })
        .where(eq(clientSessions.id, dbSession.id));
    } catch {
      // não crítico
    }

    return { clientId: session.clientId, sessionId: session.sessionId, client };
  } catch (error) {
    // Evita vazar um 500 por qualquer problema de query (ex.: valor não-uuid).
    console.error("requireClient error:", error);
    return NextResponse.json(
      { error: "Sessão inválida. Faça login novamente." },
      { status: 401 }
    );
  }
}

export function isErrorResponse(obj: any): obj is NextResponse {
  return obj instanceof NextResponse;
}
