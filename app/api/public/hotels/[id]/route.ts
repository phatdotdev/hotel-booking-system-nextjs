import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/data/mongoose";
import { Hotel } from "@/models/Hotel";
import { RoomType } from "@/models/RoomType";
import { Review } from "@/models/Review";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ success: false, message: "Mã khách sạn không hợp lệ." }, { status: 400 });
  try {
    await connectDB();
    const hotel = await Hotel.findOne({ _id: id, status: "ACTIVE" }).select("-partnerId -documents -videos -__v").lean();
    if (!hotel) return Response.json({ success: false, message: "Không tìm thấy khách sạn." }, { status: 404 });
    const [rooms, reviews, summary] = await Promise.all([
      RoomType.find({ hotelId: id, isActive: true }).sort({ basePrice: 1 }).lean(),
      Review.find({ hotelId: id }).sort({ createdAt: -1 }).limit(30).populate("userId", "fullName").lean(),
      Review.aggregate([{ $match: { hotelId: hotel._id } }, { $group: { _id: null, rating: { $avg: "$rating" }, count: { $sum: 1 } } }]),
    ]);
    return Response.json({ success: true, data: { ...hotel, rooms, reviews: reviews.map((review) => ({ _id: review._id, rating: review.rating, comment: review.comment, createdAt: review.createdAt, author: (review.userId as { fullName?: string } | null)?.fullName ?? "Khách lưu trú" })), rating: summary[0]?.rating ?? null, reviewCount: summary[0]?.count ?? 0 } });
  } catch (error) {
    console.error("Public hotel detail:", error);
    return Response.json({ success: false, message: "Không thể tải chi tiết khách sạn." }, { status: 500 });
  }
}
