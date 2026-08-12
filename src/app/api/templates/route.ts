import { NextResponse } from "next/server";
import { db } from "@/db";
import { communicationTemplates } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const list = await db.select().from(communicationTemplates).orderBy(desc(communicationTemplates.updatedAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json(); // { id, body, title, subject, active }
    const [updated] = await db
      .update(communicationTemplates)
      .set({
        title: body.title,
        subject: body.subject || null,
        body: body.body,
        active: body.active !== undefined ? body.active : true,
        updatedAt: new Date(),
      })
      .where(eq(communicationTemplates.id, body.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
