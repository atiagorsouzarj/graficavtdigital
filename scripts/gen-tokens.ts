import { ensureOrderTokens } from "../src/lib/orderTokens";
import { db } from "../src/db";
import { quotesOrders } from "../src/db/schema";

async function main() {
  const orders = await db.select().from(quotesOrders);
  for (const o of orders) {
    await ensureOrderTokens(o.id);
    console.log("Tokens gerados para", o.code);
  }
  process.exit(0);
}
main();
