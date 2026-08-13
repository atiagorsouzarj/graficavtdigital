import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, financialTransactions, financialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function requireWebhookSignature(request: Request): { ok: boolean; error?: string } {
  const secret = process.env.INFINITEPAY_WEBHOOK_SECRET;
  // Sem segredo configurado (ambiente dev/demo) aceita requisições locais com aviso
  if (!secret) return { ok: true };

  const provided = request.headers.get("x-webhook-secret") || "";
  if (provided !== secret) {
    return { ok: false, error: "Assinatura de webhook inválida (X-Webhook-Secret)." };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
    }

    if (body.action === "generate_link") {
      const amount = Number(body.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: "Valor (amount) inválido." }, { status: 400 });
      }

      const linkId = `inf_link_${Date.now().toString().slice(-8)}`;
      const url = `https://pay.infinitepay.io/grafica-express/${linkId}?amount=${amount.toFixed(2)}`;

      if (body.orderId) {
        await db
          .update(quotesOrders)
          .set({
            infinitePayTxId: linkId,
            infinitePayLink: url,
            paymentMethod: "infinitepay_link",
          })
          .where(eq(quotesOrders.id, String(body.orderId)));
      }

      return NextResponse.json({
        success: true,
        linkId,
        paymentUrl: url,
        feeRates: {
          debit: "1.38%",
          credit1x: "3.16%",
          credit12x: "12.40%",
        },
      });
    }

    if (body.action === "generate_pix") {
      const amount = Number(body.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: "Valor (amount) inválido." }, { status: 400 });
      }
      const amountStr = amount.toFixed(2);
      const pixCode = `00020126580014br.gov.bcb.pix0136financeiro@graficaexpress.com.br520400005303986540${amountStr}5802BR5922GRAFICA EXPRESS LTDA6009SAO PAULO62070503***6304A8F2`;
      return NextResponse.json({
        success: true,
        pixCopiaECola: pixCode,
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`,
        expiresInSeconds: 3600,
      });
    }

    if (body.action === "webhook") {
      const signatureCheck = requireWebhookSignature(request);
      if (!signatureCheck.ok) {
        return NextResponse.json({ error: signatureCheck.error }, { status: 401 });
      }

      if (!body.orderId) {
        return NextResponse.json({ error: "orderId é obrigatório no webhook." }, { status: 400 });
      }

      const [order] = await db
        .select()
        .from(quotesOrders)
        .where(eq(quotesOrders.id, String(body.orderId)));

      if (!order) {
        return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
      }

      if (order.paymentStatus !== "paid") {
        await db
          .update(quotesOrders)
          .set({
            paymentStatus: "paid",
            updatedAt: new Date(),
          })
          .where(eq(quotesOrders.id, order.id));

        const [acc] = await db
          .select()
          .from(financialAccounts)
          .where(eq(financialAccounts.name, "InfinitePay"));
        await db.insert(financialTransactions).values({
          code: order.code,
          description: `Pagamento recebido via InfinitePay (${order.code})`,
          type: "income",
          category: "Link de Pagamento",
          costCenter: "Online",
          accountId: acc ? acc.id : null,
          accountName: acc ? acc.name : "InfinitePay",
          dueDate: new Date(),
          paymentDate: new Date(),
          amount: order.totalAmount,
          status: "paid",
          paymentMethod: "InfinitePay",
          orderId: order.id,
        });
      }

      return NextResponse.json({ success: true, message: "Webhook InfinitePay processado com sucesso" });
    }

    return NextResponse.json({ success: false, error: "Ação desconhecida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
