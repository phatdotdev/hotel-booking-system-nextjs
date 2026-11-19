import { isValidObjectId } from "mongoose";
import getAuthenticatedUserId from "@/lib/auth/get-authenticated-user-id";
import { connectDB } from "@/lib/data/mongoose";
import { Booking } from "@/models/Booking";
import { BookingNight } from "@/models/BookingNight";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ message: "Mã đặt phòng không hợp lệ." }, { status: 400 });
  await connectDB();
  const booking = await Booking.findOneAndUpdate({ _id: id, userId, status: "CONFIRMED", paymentMethod: "PAY_AT_HOTEL", paymentStatus: "UNPAID", checkInDate: { $gt: new Date(Date.now() + 24 * 3600000) } }, { $set: { status: "CANCELLED" } }, { new: true });
  if (!booking) return Response.json({ message: "Chỉ có thể tự hủy đơn thanh toán tại khách sạn trước giờ nhận phòng ít nhất 24 giờ. Với đơn thanh toán trực tuyến, hãy liên hệ khách sạn để xử lý hoàn tiền." }, { status: 409 });
  await BookingNight.deleteMany({ bookingId: booking._id });
  return Response.json({ success: true });
}
