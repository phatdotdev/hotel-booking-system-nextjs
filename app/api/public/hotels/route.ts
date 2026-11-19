import { NextResponse } from "next/server";
import { connection } from "next/server";
import { connectDB } from "@/lib/data/mongoose";
import { Hotel } from "@/models/Hotel";
import { RoomType } from "@/models/RoomType";
import { Review } from "@/models/Review";

function escaped(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  await connection();
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 20));
    const minPrice = params.has("minPrice") ? Number(params.get("minPrice")) : undefined;
    const maxPrice = params.has("maxPrice") ? Number(params.get("maxPrice")) : undefined;
    const starRating = params.has("starRating") ? Number(params.get("starRating")) : undefined;
    if ([minPrice, maxPrice, starRating].some((n) => n !== undefined && (!Number.isFinite(n) || n < 0)) || (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) || (starRating !== undefined && (!Number.isInteger(starRating) || starRating < 1 || starRating > 5))) {
      return NextResponse.json({ success: false, message: "Bộ lọc không hợp lệ." }, { status: 400 });
    }
    await connectDB();
    const query: Record<string, unknown> = { status: "ACTIVE" };
    const search = params.get("search")?.trim().slice(0, 100);
    if (search) query.$or = ["name", "city"].map((key) => ({ [key]: { $regex: escaped(search), $options: "i" } }));
    if (starRating) query.starRating = starRating;
    const propertyType = params.get("propertyType");
    if (propertyType) query.propertyType = propertyType.toUpperCase();
    const amenities = params.get("amenities")?.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (amenities?.length) query.amenities = { $all: amenities };
    const hotels = await Hotel.find(query).lean();
    const ids = hotels.map((hotel) => hotel._id);
    const [rooms, ratings] = await Promise.all([
      RoomType.find({ hotelId: { $in: ids }, isActive: true }).select("hotelId basePrice").lean(),
      Review.aggregate([{ $match: { hotelId: { $in: ids } } }, { $group: { _id: "$hotelId", rating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }]),
    ]);
    const prices = new Map<string, number>();
    for (const room of rooms) {
      const id = String(room.hotelId);
      prices.set(id, Math.min(prices.get(id) ?? Infinity, room.basePrice));
    }
    const ratingMap = new Map(ratings.map((item) => [String(item._id), item]));
    const filtered = hotels.flatMap((hotel) => {
      const id = String(hotel._id);
      const pricePerNight = prices.get(id);
      if (pricePerNight === undefined || (minPrice !== undefined && pricePerNight < minPrice) || (maxPrice !== undefined && pricePerNight > maxPrice)) return [];
      const rating = ratingMap.get(id);
      return [{ ...hotel, _id: id, pricePerNight, rating: rating?.rating ?? undefined, reviewCount: rating?.reviewCount ?? 0 }];
    });
    filtered.sort((a, b) => b.starRating - a.starRating || a.pricePerNight - b.pricePerNight);
    return NextResponse.json({ success: true, data: filtered.slice((page - 1) * limit, page * limit), pagination: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) } });
  } catch (error) {
    console.error("Public hotel search:", error);
    return NextResponse.json({ success: false, message: "Không thể tải khách sạn." }, { status: 500 });
  }
}
