import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { createMomoPayment, createVnpayUrl, verifyVnpay, verifyMomoResult } from "../lib/payments/gateways.ts";

test("VNPAY URL signature is valid and rejects altered amounts", () => {
  process.env.VNPAY_TMN_CODE = "TESTMERCHANT";
  process.env.VNPAY_HASH_SECRET = "test-secret-only";
  process.env.PAYMENT_BASE_URL = "https://merchant.example";
  const url = new URL(createVnpayUrl({ code: "BK-123456", amount: 1200000, ip: "127.0.0.1" }));
  assert.equal(url.searchParams.get("vnp_Amount"), "120000000");
  assert.equal(verifyVnpay(url.searchParams), true);
  url.searchParams.set("vnp_Amount", "120000100");
  assert.equal(verifyVnpay(url.searchParams), false);
});

test("MoMo IPN signature is valid and rejects altered results", () => {
  process.env.MOMO_PARTNER_CODE = "TESTPARTNER";
  process.env.MOMO_ACCESS_KEY = "test-access";
  process.env.MOMO_SECRET_KEY = "test-secret-only";
  const body = {
    partnerCode: "TESTPARTNER", amount: 1200000, extraData: "", message: "Successful.",
    orderId: "BK-123456", orderInfo: "Thanh toan dat phong BK-123456", orderType: "momo_wallet",
    payType: "qr", requestId: "test-request", responseTime: 123456789, resultCode: 0, transId: 456,
  };
  const raw = `accessKey=test-access&amount=1200000&extraData=&message=Successful.&orderId=BK-123456&orderInfo=Thanh toan dat phong BK-123456&orderType=momo_wallet&partnerCode=TESTPARTNER&payType=qr&requestId=test-request&responseTime=123456789&resultCode=0&transId=456`;
  const signature = createHmac("sha256", process.env.MOMO_SECRET_KEY).update(raw).digest("hex");
  assert.equal(verifyMomoResult({ ...body, signature }), true);
  assert.equal(verifyMomoResult({ ...body, amount: 1200001, signature }), false);
});

test("MoMo create request signs merchant fields and returns gateway URL", async () => {
  process.env.PAYMENT_BASE_URL = "https://merchant.example";
  process.env.MOMO_PARTNER_CODE = "TESTPARTNER";
  process.env.MOMO_ACCESS_KEY = "test-access";
  process.env.MOMO_SECRET_KEY = "test-secret-only";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    const raw = `accessKey=test-access&amount=1200000&extraData=&ipnUrl=https://merchant.example/api/payments/momo/ipn&orderId=BK-123456&orderInfo=Thanh toan dat phong BK-123456&partnerCode=TESTPARTNER&redirectUrl=https://merchant.example/api/payments/momo/return&requestId=test-request&requestType=captureWallet`;
    assert.equal(body.signature, createHmac("sha256", process.env.MOMO_SECRET_KEY).update(raw).digest("hex"));
    return Response.json({ resultCode: 0, payUrl: "https://test-payment.momo.vn/v2/gateway/pay?id=1", orderId: body.orderId, requestId: body.requestId, amount: body.amount });
  };
  try {
    assert.equal(await createMomoPayment({ code: "BK-123456", amount: 1200000, requestId: "test-request" }), "https://test-payment.momo.vn/v2/gateway/pay?id=1");
  } finally { globalThis.fetch = originalFetch; }
});
