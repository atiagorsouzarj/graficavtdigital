import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotesOrders, financialTransactions, financialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json(); // { action: 'generate_link' | 'generate_pix' | 'webhook', orderId, amount }

    if (body.action === "generate_link") {
      const linkId = `inf_link_${Date.now().toString().slice(-8)}`;
      const url = `https://pay.infinitepay.io/grafica-express/${linkId}?amount=${body.amount}`;

      if (body.orderId) {
        await db
          .update(quotesOrders)
          .set({
            infinitePayTxId: linkId,
            infinitePayLink: url,
            paymentMethod: "infinitepay_link",
          })
          .where(eq(quotesOrders.id, body.orderId));
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
      const pixCode = `00020126580014br.gov.bcb.pix0136financeiro@graficaexpress.com.br520400005303986540${parseFloat(body.amount || "10.00").toFixed(2)}5802BR5922GRAFICA EXPRESS LTDA6009SAO PAULO62070503***6304A8F2`;
      return NextResponse.json({
        success: true,
        pixCopiaECola: pixCode,
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`,
        expiresInSeconds: 3600,
      });
    }

    if (body.action === "webhook") {
      // Webhook simulation: client paid via InfinitePay
      if (body.orderId) {
        const [order] = await db.select().from(quotesOrders).where(eq(quotesOrders.id, body.orderId));
        if (order) {
          await db
            .update(quotesOrders)
            .set({
              paymentStatus: "paid",
              updatedAt: new Date(),
            })
            .where(eq(quotesOrders.id, body.orderId));

          const [acc] = await db.select().from(financialAccounts).where(eq(financialAccounts.name, "InfinitePay"));
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
      }
      return NextResponse.json({ success: true, message: "Webhook InfinitePay processado com sucesso" });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
