import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
    }

    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();

    if (!to || !validateEmail(to)) {
      return NextResponse.json({ error: "Destinatário (to) inválido." }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: "Assunto (subject) é obrigatório." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      messageId: `msg_smtp_${Date.now().toString().slice(-8)}`,
      recipient: to,
      subject,
      status: "delivered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
