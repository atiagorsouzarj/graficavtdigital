import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { validateCPF, validateCNPJ, validateEmail } from "@/lib/validation";
import { eq, or, ilike, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await seedDatabase();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    let query = db.select().from(clients);
    if (q) {
      const search = `%${q}%`;
      // @ts-expect-error Drizzle dynamic query
      query = db
        .select()
        .from(clients)
        .where(
          or(
            ilike(clients.name, search),
            ilike(clients.tradeName, search),
            ilike(clients.nickname, search),
            ilike(clients.document, search),
            ilike(clients.email, search),
            ilike(clients.phone, search),
            ilike(clients.whatsapp, search)
          )
        );
    }

    const list = await query.orderBy(desc(clients.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    console.error("Error GET clients:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = body.type || "PF";
    const docClean = (body.document || "").replace(/\D/g, "");

    // Validations
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

    const [newClient] = await db
      .insert(clients)
      .values({
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
        whatsapp: body.whatsapp || body.mobile || body.phone || null,
        email: body.email,

        noAutoWhatsapp: Boolean(body.noAutoWhatsapp),
        promoWhatsapp: body.promoWhatsapp !== undefined ? Boolean(body.promoWhatsapp) : true,
        promoEmail: body.promoEmail !== undefined ? Boolean(body.promoEmail) : true,
        infoCall: body.infoCall !== undefined ? Boolean(body.infoCall) : true,

        creditLimit: body.creditLimit ? String(body.creditLimit) : "0.00",
        notes: body.notes || null,
        tags: body.tags || null,
      })
      .returning();

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error POST client:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
