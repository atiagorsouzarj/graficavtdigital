/**
 * ClientLookup - Busca de cliente por CPF/CNPJ tolerante a formatação.
 *
 * BUG CORRIGIDO: o login do portal comparava o documento digitado de forma
 * EXATA contra o campo `clients.document`. Se o CRM salvou "111.222.333-96"
 * e o cliente digitasse "11122233396" (ou vice-versa), o login falhava com
 * "CPF/CNPJ não encontrado". Agora a comparação usa apenas os dígitos.
 */
import { db } from "@/db";
import { clients } from "@/db/schema";
import { sql } from "drizzle-orm";

export type ClientRow = typeof clients.$inferSelect;

/**
 * Busca cliente por CPF/CNPJ ignorando pontuação.
 * Retorna null se o documento não tiver 11 ou 14 dígitos.
 */
export async function findClientByDocument(docInput: string): Promise<ClientRow | null> {
  const clean = (docInput || "").replace(/\D/g, "");
  if (clean.length !== 11 && clean.length !== 14) return null;

  const rows = await db
    .select()
    .from(clients)
    .where(sql`regexp_replace(coalesce(${clients.document}, ''), '[^0-9]', '', 'g') = ${clean}`)
    .limit(2);

  return rows[0] || null;
}
