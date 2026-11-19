import { paymentConfig } from "@/lib/payments/gateways";
import { connection } from "next/server";
export async function GET() {
  await connection();
  const config = paymentConfig();
  return Response.json({ vnpay: !!config.baseUrl && config.vnpay, momo: !!config.baseUrl && config.momo });
}
