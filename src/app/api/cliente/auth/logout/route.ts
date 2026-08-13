import { NextResponse } from "next/server";
import { db } from "@/db";
import { clientSessions, clientActivityLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CLIENT_SESSION_COOKIE, verifySessionToken } from "@/lib/clientAuth";

export const dynamic = "force-dynamic";

/**
 * POST /api/cliente/auth/logout
 * Invalida a sessão atual e limpa o cookie
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await (await import("next/headers")).cookies();
    const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        // Log
        try {
          await db.insert(clientActivityLog).values({
            clientId: session.clientId,
            sessionId: session.sessionId,
            action: "logout",
            resourceType: "auth",
          });
        } catch {
          /* ignore */
        }
        // Apaga sessão
        await db.delete(clientSessions).where(eq(clientSessions.id, session.sessionId));
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(CLIENT_SESSION_COOKIE);
    return response;
  } catch (error) {
    console.error("logout error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
