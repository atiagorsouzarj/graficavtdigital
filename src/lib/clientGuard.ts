/**
 * ClientGuard - Helpers para rotas API que exigem cliente autenticado
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { clientSessions, clients } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { CLIENT_SESSION_COOKIE, verifySessionToken } from "@/lib/clientAuth";

export interface AuthenticatedClient {
  clientId: string;
  sessionId: string;
  client: typeof clients.$inferSelect;
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
}

export function isErrorResponse(obj: any): obj is NextResponse {
  return obj instanceof NextResponse;
}
