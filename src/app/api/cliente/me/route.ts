import { NextResponse } from "next/server";
import { requireClient, isErrorResponse } from "@/lib/clientGuard";

export const dynamic = "force-dynamic";

/**
 * GET /api/cliente/me
 * Retorna dados do cliente autenticado + estatísticas
 */
export async function GET() {
  const result = await requireClient();
  if (isErrorResponse(result)) return result;

  const { client } = result;
  return NextResponse.json({
    id: client.id,
    name: client.name,
    type: client.type,
    document: client.document,
    email: client.email,
    phone: client.phone,
    mobile: client.mobile,
    whatsapp: client.whatsapp,
    city: client.city,
    state: client.state,
  });
}
