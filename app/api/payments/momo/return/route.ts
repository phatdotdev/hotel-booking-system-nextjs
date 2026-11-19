import { paymentConfig, verifyMomoResult } from "@/lib/payments/gateways";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const payload = Object.fromEntries(params.entries());
  const destination = new URL("/booking/success", paymentConfig().baseUrl || new URL(request.url).origin);
  if (verifyMomoResult(payload) && params.get("orderId")) destination.searchParams.set("code", params.get("orderId")!);
  else destination.searchParams.set("payment", "invalid");
  return Response.redirect(destination);
}
