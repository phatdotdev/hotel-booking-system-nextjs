import { isValidObjectId } from "mongoose";
import getAuthenticatedUserId from "@/lib/auth/get-authenticated-user-id";
import { connectDB } from "@/lib/data/mongoose";
import { Booking } from "@/models/Booking";
import { canUsePayment, createMomoPayment, createVnpayUrl } from "@/lib/payments/gateways";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ message: "Mã đơn không hợp lệ." }, { status: 400 });
  await connectDB();
  const booking = await Booking.findOne({ _id: id, userId, status: "PENDING", paymentStatus: "UNPAID", paymentMethod: { $in: ["VNPAY", "MOMO"] } });
  if (!booking) return Response.json({ message: "Đơn không chờ thanh toán." }, { status: 409 });
  if (!canUsePayment(booking.paymentMethod)) return Response.json({ message: "Cổng thanh toán chưa được cấu hình." }, { status: 503 });
  try {
    const url = booking.paymentMethod === "VNPAY"
      ? createVnpayUrl({ code: booking.bookingCode, amount: booking.pricing.totalAmount, ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1" })
      : booking.paymentUrl || await createMomoPayment({ code: booking.bookingCode, amount: booking.pricing.totalAmount, requestId: booking.paymentRequestId });
    await Booking.updateOne({ _id: booking._id, status: "PENDING" }, { $set: { paymentUrl: url } });
    return Response.json({ paymentUrl: url });
  } catch (error) {
    console.error("Retry payment failed:", error);
    return Response.json({ message: "Chưa thể mở cổng thanh toán. Vui lòng thử lại." }, { status: 502 });
  }
}
