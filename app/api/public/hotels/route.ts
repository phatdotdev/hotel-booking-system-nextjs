// File: app/api/public/hotels/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/data/mongoose";
import { Hotel } from "@/models/Hotel";

export async function GET(request: Request) {
  try {
    await connectDB();

    // 1. Lấy các tham số tìm kiếm từ URL (query string)
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search") || ""; // Trùng với name="search" ở Header
    const city = searchParams.get("city") || "";

    // Phân trang
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    // 2. Xây dựng bộ lọc query cho Mongoose
    const query: any = {
      status: "ACTIVE", // QUAN TRỌNG: Chỉ hiện khách sạn đã được duyệt
    };

    // Nếu người dùng có gõ vào ô tìm kiếm
    if (searchQuery) {
      // Tìm tương đối (không phân biệt hoa thường) trong Tên, Thành phố, hoặc Địa chỉ
      query.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { city: { $regex: searchQuery, $options: "i" } },
        { address: { $regex: searchQuery, $options: "i" } },
        { country: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Nếu muốn lọc chính xác theo thành phố (ví dụ từ bộ lọc sidebar)
    if (city) {
      query.city = { $regex: `^${city}$`, $options: "i" };
    }

    // 3. Thực thi truy vấn
    const hotels = await Hotel.find(query)
      .select("-partnerId -createdAt -updatedAt -__v") // Loại bỏ các trường bảo mật/không cần thiết
      .sort({ starRating: -1, createdAt: -1 }) // Ưu tiên khách sạn nhiều sao trước, mới nhất trước
      .skip(skip)
      .limit(limit)
      .lean();

    // 4. Đếm tổng số lượng để làm phân trang
    const total = await Hotel.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: hotels,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Public get hotels error:", error);

    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tìm kiếm khách sạn." },
      { status: 500 },
    );
  }
}
