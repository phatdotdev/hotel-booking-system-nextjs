import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";

export type OnlineMethod = "VNPAY" | "MOMO";

export function paymentConfig() {
  const rawBaseUrl = process.env.PAYMENT_BASE_URL?.replace(/\/$/, "") ?? "";
  let baseUrl = "";
  try {
    const url = new URL(rawBaseUrl);
    if (url.protocol === "https:" && url.pathname === "/" && !url.search && !url.hash && !url.username && !url.password) baseUrl = url.origin;
  } catch { /* Invalid URL disables online payments. */ }
  return {
    baseUrl,
    vnpay: !!(process.env.VNPAY_TMN_CODE && process.env.VNPAY_HASH_SECRET),
    momo: !!(process.env.MOMO_PARTNER_CODE && process.env.MOMO_ACCESS_KEY && process.env.MOMO_SECRET_KEY),
  };
}

export function canUsePayment(method: OnlineMethod) {
  const config = paymentConfig();
  return !!config.baseUrl && (method === "VNPAY" ? config.vnpay : config.momo);
}

function secureEqual(actual: string, expected: string) {
  if (!/^[a-f\d]+$/i.test(actual) || actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function vnpayHash(params: URLSearchParams) {
  const values = [...params.entries()].filter(([key]) => key !== "vnp_SecureHash" && key !== "vnp_SecureHashType").sort(([a], [b]) => a.localeCompare(b, "en"));
  return createHmac("sha512", process.env.VNPAY_HASH_SECRET!).update(new URLSearchParams(values).toString()).digest("hex");
}

export function verifyVnpay(params: URLSearchParams) {
  if (!process.env.VNPAY_HASH_SECRET || !process.env.VNPAY_TMN_CODE || params.get("vnp_TmnCode") !== process.env.VNPAY_TMN_CODE) return false;
  if ([...params.keys()].some((key) => params.getAll(key).length !== 1)) return false;
  return secureEqual(params.get("vnp_SecureHash") ?? "", vnpayHash(params));
}

function vnpayDate(date: Date) {
  const values = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const part = (type: string) => values.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}${part("month")}${part("day")}${part("hour")}${part("minute")}${part("second")}`;
}

export function createVnpayUrl(input: { code: string; amount: number; ip: string }) {
  const baseUrl = process.env.VNPAY_PAYMENT_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const url = new URL(baseUrl);
  if (url.protocol !== "https:") throw new Error("VNPAY_PAYMENT_URL phải dùng HTTPS.");
  const now = new Date();
  const params = new URLSearchParams({
    vnp_Version: "2.1.0", vnp_Command: "pay", vnp_TmnCode: process.env.VNPAY_TMN_CODE!,
    vnp_Amount: String(input.amount * 100), vnp_CurrCode: "VND", vnp_TxnRef: input.code,
    vnp_OrderInfo: `Thanh toan dat phong ${input.code}`, vnp_OrderType: "other",
    vnp_Locale: "vn", vnp_ReturnUrl: `${paymentConfig().baseUrl}/api/payments/vnpay/return`,
    vnp_IpAddr: input.ip, vnp_CreateDate: vnpayDate(now),
    vnp_ExpireDate: vnpayDate(new Date(now.getTime() + 15 * 60000)),
  });
  params.sort();
  params.set("vnp_SecureHash", vnpayHash(params));
  url.search = params.toString();
  return url.toString();
}

function momoSignature(values: Record<string, string>, result = false) {
  const fields = result
    ? ["accessKey", "amount", "extraData", "message", "orderId", "orderInfo", "orderType", "partnerCode", "payType", "requestId", "responseTime", "resultCode", "transId"]
    : ["accessKey", "amount", "extraData", "ipnUrl", "orderId", "orderInfo", "partnerCode", "redirectUrl", "requestId", "requestType"];
  const raw = fields.map((key) => `${key}=${values[key] ?? ""}`).join("&");
  return createHmac("sha256", process.env.MOMO_SECRET_KEY!).update(raw).digest("hex");
}

export function verifyMomoResult(payload: Record<string, unknown>) {
  if (!process.env.MOMO_SECRET_KEY || !process.env.MOMO_ACCESS_KEY || payload.partnerCode !== process.env.MOMO_PARTNER_CODE) return false;
  const values = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value ?? "")]));
  values.accessKey = process.env.MOMO_ACCESS_KEY;
  return secureEqual(values.signature ?? "", momoSignature(values, true));
}

export async function createMomoPayment(input: { code: string; amount: number; requestId: string }) {
  const endpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";
  const url = new URL(endpoint);
  if (url.protocol !== "https:") throw new Error("MOMO_ENDPOINT phải dùng HTTPS.");
  const payload = {
    partnerCode: process.env.MOMO_PARTNER_CODE!, requestId: input.requestId,
    amount: input.amount, orderId: input.code, orderInfo: `Thanh toan dat phong ${input.code}`,
    redirectUrl: `${paymentConfig().baseUrl}/api/payments/momo/return`,
    ipnUrl: `${paymentConfig().baseUrl}/api/payments/momo/ipn`,
    requestType: "captureWallet", extraData: "", lang: "vi",
  };
  const signature = momoSignature({ ...Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value)])), accessKey: process.env.MOMO_ACCESS_KEY! });
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, signature }), cache: "no-store", signal: AbortSignal.timeout(15000) });
  const result = await response.json() as { resultCode?: number; payUrl?: string; message?: string; orderId?: string; requestId?: string; amount?: number };
  if (!response.ok || result.resultCode !== 0 || !result.payUrl || result.orderId !== input.code || result.requestId !== input.requestId || Number(result.amount) !== input.amount) throw new Error(result.message || "MoMo không tạo được phiên thanh toán.");
  const payUrl = new URL(result.payUrl);
  if (payUrl.protocol !== "https:" || !(payUrl.hostname === "momo.vn" || payUrl.hostname.endsWith(".momo.vn"))) throw new Error("MoMo trả về URL không hợp lệ.");
  return payUrl.toString();
}

export function newPaymentRequestId() { return randomUUID().replace(/-/g, ""); }
