import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { validateCPF, validateCNPJ, validateEmail } from "@/lib/validation";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const type = body.type || "PF";
    const docClean = (body.document || "").replace(/\D/g, "");

    if (docClean) {
      if (type === "PF" && !validateCPF(docClean)) {
        return NextResponse.json({ error: "CPF informado é inválido." }, { status: 400 });
      }
      if (type === "PJ" && !validateCNPJ(docClean)) {
        return NextResponse.json({ error: "CNPJ informado é inválido." }, { status: 400 });
      }
    }

    if (body.email && !validateEmail(body.email)) {
      return NextResponse.json({ error: "E-mail informado é inválido." }, { status: 400 });
    }

    const [updated] = await db
      .update(clients)
      .set({
        type: type,
        name: body.name,
        tradeName: body.tradeName || null,
        nickname: body.nickname || null,
        clientStatus: body.clientStatus || "Liberado",

        document: body.document,
        stateRegistration: body.stateRegistration || null,
        birthDate: body.birthDate || null,
        gender: body.gender || null,

        contactPerson: body.contactPerson || null,
        originMarketing: body.originMarketing || null,
        foundUs: body.foundUs || null,
        segment: body.segment || null,

        zipCode: body.zipCode || null,
        address: body.address || null,
        number: body.number || null,
        complement: body.complement || null,
        neighborhood: body.neighborhood || null,
        city: body.city || null,
        state: body.state || null,

        phone: body.phone || null,
        mobile: body.mobile || null,
        whatsapp: body.whatsapp || null,
        email: body.email,

        noAutoWhatsapp: Boolean(body.noAutoWhatsapp),
        promoWhatsapp: Boolean(body.promoWhatsapp),
        promoEmail: Boolean(body.promoEmail),
        infoCall: Boolean(body.infoCall),

        creditLimit: body.creditLimit ? String(body.creditLimit) : undefined,
        notes: body.notes || null,
        tags: body.tags || null,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(clients).where(eq(clients.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
