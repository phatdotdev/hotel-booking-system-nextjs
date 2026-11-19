import { paymentConfig, verifyVnpay } from "@/lib/payments/gateways";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const destination = new URL("/booking/success", paymentConfig().baseUrl || new URL(request.url).origin);
  if (verifyVnpay(params) && params.get("vnp_TxnRef")) destination.searchParams.set("code", params.get("vnp_TxnRef")!);
  else destination.searchParams.set("payment", "invalid");
  return Response.redirect(destination);
}
