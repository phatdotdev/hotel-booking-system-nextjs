import { isValidObjectId } from "mongoose";
import getAuthenticatedUserId from "@/lib/auth/get-authenticated-user-id";
import { connectDB } from "@/lib/data/mongoose";
import { Booking } from "@/models/Booking";
import { Review } from "@/models/Review";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  let body: { bookingId?: string; rating?: number; comment?: string };
  try { body = await request.json(); } catch { return Response.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  if (!isValidObjectId(body.bookingId) || !Number.isInteger(body.rating) || body.rating! < 1 || body.rating! > 5 || (body.comment?.length ?? 0) > 2000) return Response.json({ message: "Đánh giá không hợp lệ." }, { status: 400 });
  await connectDB();
  const booking = await Booking.findOne({ _id: body.bookingId, userId, status: "CHECKED_OUT" });
  if (!booking) return Response.json({ message: "Chỉ có thể đánh giá sau khi hoàn tất kỳ nghỉ." }, { status: 403 });
  try {
    const review = await Review.create({ bookingId: booking._id, hotelId: booking.hotelId, userId, rating: body.rating, comment: body.comment?.trim() ?? "" });
    return Response.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return Response.json({ message: "Bạn đã đánh giá đơn này." }, { status: 409 });
    throw error;
  }
}
