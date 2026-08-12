import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const list = await db.select().from(systemSettings);
    const settingsMap: Record<string, string> = {};
    list.forEach((item) => {
      settingsMap[item.key] = item.value;
    });
    return NextResponse.json({ list, map: settingsMap });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); // Array of { key, value, category }
    if (Array.isArray(body)) {
      for (const s of body) {
        const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, s.key));
        if (existing.length > 0) {
          await db
            .update(systemSettings)
            .set({ value: String(s.value), updatedAt: new Date() })
            .where(eq(systemSettings.key, s.key));
        } else {
          await db.insert(systemSettings).values({
            key: s.key,
            value: String(s.value),
            category: s.category || "general",
          });
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
