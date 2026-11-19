import { connectDB } from "@/lib/data/mongoose";
import { Booking } from "@/models/Booking";
import { confirmPayment, rejectPayment } from "@/lib/payments/booking-state";
import { verifyMomoResult } from "@/lib/payments/gateways";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return new Response(null, { status: 400 }); }
  if (!verifyMomoResult(body)) return new Response(null, { status: 400 });
  try {
    await connectDB();
    const booking = await Booking.findOne({ bookingCode: body.orderId, paymentMethod: "MOMO" });
    if (!booking || booking.paymentRequestId !== body.requestId || booking.pricing.totalAmount !== Number(body.amount)) return new Response(null, { status: 400 });
    if (booking.paymentStatus === "PAID" || booking.status === "CANCELLED") return new Response(null, { status: 204 });
    if (Number(body.resultCode) === 0) await confirmPayment(String(booking._id), String(body.transId ?? ""));
    else if (Number(body.resultCode) !== 9000) await rejectPayment(String(booking._id));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("MoMo IPN failed:", error);
    return new Response(null, { status: 500 });
  }
}
