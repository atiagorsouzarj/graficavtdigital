import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { validateCPF, validateCNPJ, validateEmail } from "@/lib/validation";
import { eq, or, ilike, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Idempotente: populou a base apenas no primeiro boot (retorna cedo se já houver dados)
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
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
    }

    const type = String(body.type || "PF");
    if (type !== "PF" && type !== "PJ") {
      return NextResponse.json({ error: "Tipo deve ser 'PF' ou 'PJ'." }, { status: 400 });
    }

    // Campos obrigatórios
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const document = String(body.document || "").trim();
    const docClean = document.replace(/\D/g, "");

    if (!name) {
      return NextResponse.json(
        { error: type === "PJ" ? "Informe a Razão Social." : "Informe o Nome Completo." },
        { status: 400 }
      );
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "E-mail informado é inválido." }, { status: 400 });
    }

    if (!docClean) {
      return NextResponse.json(
        { error: type === "PJ" ? "Informe o CNPJ." : "Informe o CPF." },
        { status: 400 }
      );
    }

    if (type === "PF" && !validateCPF(docClean)) {
      return NextResponse.json({ error: "CPF informado é inválido." }, { status: 400 });
    }
    if (type === "PJ" && !validateCNPJ(docClean)) {
      return NextResponse.json({ error: "CNPJ informado é inválido." }, { status: 400 });
    }

    // Evita duplicidade de CPF/CNPJ e e-mail (CRM)
    const [existingDoc] = await db.select().from(clients).where(eq(clients.document, document));
    if (existingDoc) {
      return NextResponse.json(
        {
          error: "Já existe um cadastro com esse CPF/CNPJ.",
          duplicate: true,
          clientId: existingDoc.id,
        },
        { status: 409 }
      );
    }

    const [existingEmail] = await db.select().from(clients).where(eq(clients.email, email));
    if (existingEmail) {
      return NextResponse.json(
        { error: "Já existe um cadastro com esse e-mail.", duplicate: true, clientId: existingEmail.id },
        { status: 409 }
      );
    }

    // Normaliza telefones (somente dígitos, máx. 11)
    const normalizePhone = (value: unknown): string | null => {
      const cleaned = String(value || "").replace(/\D/g, "");
      return cleaned ? cleaned.slice(0, 11) : null;
    };
    const phone = normalizePhone(body.phone);
    const mobile = normalizePhone(body.mobile);
    const whatsapp = normalizePhone(body.whatsapp) || mobile || phone;

    const [newClient] = await db
      .insert(clients)
      .values({
        type,
        name,
        tradeName: body.tradeName ? String(body.tradeName) : null,
        nickname: body.nickname ? String(body.nickname) : null,
        clientStatus: body.clientStatus ? String(body.clientStatus) : "Liberado",

        document,
        stateRegistration: body.stateRegistration ? String(body.stateRegistration) : null,
        birthDate: body.birthDate ? String(body.birthDate) : null,
        gender: body.gender ? String(body.gender) : null,

        contactPerson: body.contactPerson ? String(body.contactPerson) : null,
        originMarketing: body.originMarketing ? String(body.originMarketing) : null,
        foundUs: body.foundUs ? String(body.foundUs) : null,
        segment: body.segment ? String(body.segment) : null,

        zipCode: body.zipCode ? String(body.zipCode).replace(/\D/g, "").slice(0, 8) : null,
        address: body.address ? String(body.address) : null,
        number: body.number ? String(body.number) : null,
        complement: body.complement ? String(body.complement) : null,
        neighborhood: body.neighborhood ? String(body.neighborhood) : null,
        city: body.city ? String(body.city) : null,
        state: body.state ? String(body.state).slice(0, 2) : null,

        phone,
        mobile,
        whatsapp,
        email,

        noAutoWhatsapp: Boolean(body.noAutoWhatsapp),
        promoWhatsapp: body.promoWhatsapp !== undefined ? Boolean(body.promoWhatsapp) : true,
        promoEmail: body.promoEmail !== undefined ? Boolean(body.promoEmail) : true,
        infoCall: body.infoCall !== undefined ? Boolean(body.infoCall) : true,

        creditLimit: body.creditLimit ? String(body.creditLimit) : "0.00",
        notes: body.notes ? String(body.notes) : null,
        tags: body.tags ? String(body.tags) : null,
      })
      .returning();

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error POST client:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
