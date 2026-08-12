import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await seedDatabase();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await seedDatabase();
  return NextResponse.json(result);
}
