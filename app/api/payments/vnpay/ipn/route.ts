import { connectDB } from "@/lib/data/mongoose";
import { Booking } from "@/models/Booking";
import { confirmPayment, rejectPayment } from "@/lib/payments/booking-state";
import { verifyVnpay } from "@/lib/payments/gateways";

function reply(RspCode: string, Message: string) { return Response.json({ RspCode, Message }); }

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (!verifyVnpay(params)) return reply("97", "Invalid signature");
  try {
    await connectDB();
    const booking = await Booking.findOne({ bookingCode: params.get("vnp_TxnRef"), paymentMethod: "VNPAY" });
    if (!booking) return reply("01", "Order not found");
    if (String(booking.pricing.totalAmount * 100) !== params.get("vnp_Amount")) return reply("04", "Invalid amount");
    if (booking.paymentStatus === "PAID" || booking.status === "CANCELLED") return reply("02", "Order already confirmed");
    const success = params.get("vnp_ResponseCode") === "00" && params.get("vnp_TransactionStatus") === "00";
    if (success) await confirmPayment(String(booking._id), params.get("vnp_TransactionNo") ?? "");
    else if (params.get("vnp_TransactionStatus") !== "01") await rejectPayment(String(booking._id));
    return reply("00", "Confirm Success");
  } catch (error) {
    console.error("VNPAY IPN failed:", error);
    return reply("99", "Unknown error");
  }
}
