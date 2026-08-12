import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json(); // { to, subject, html, variables }
    return NextResponse.json({
      success: true,
      messageId: `msg_smtp_${Date.now().toString().slice(-8)}`,
      recipient: body.to,
      subject: body.subject,
      status: "delivered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
