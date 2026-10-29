import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { Partner } from "@/models/Partner";
import { Hotel } from "@/models/Hotel";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/data/mongoose";

async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  return (
    (session.user as { id?: string }).id ??
    (session as typeof session & { userId?: string }).userId ??
    null
  );
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Bạn cần đăng nhập." },
        { status: 401 },
      );
    }

    await connectDB();

    const partner = await Partner.findOne({
      ownerUserId: userId,
    }).lean();

    if (!partner) {
      return NextResponse.json(
        { message: "Bạn chưa đăng ký hồ sơ đối tác." },
        { status: 404 },
      );
    }

    const hotels = await Hotel.find({
      partnerId: partner._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      hotels: hotels.map((hotel) => ({
        id: hotel._id.toString(),
        name: hotel.name,
        description: hotel.description,
        phone: hotel.phone,
        country: hotel.country,
        city: hotel.city,
        address: hotel.address,
        status: hotel.status,
        createdAt: hotel.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get hotels error:", error);

    return NextResponse.json(
      { message: "Không thể tải danh sách khách sạn." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Bạn cần đăng nhập." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";

    if (!name || !country || !city || !address) {
      return NextResponse.json(
        {
          message:
            "Vui lòng nhập tên khách sạn, quốc gia, tỉnh/thành phố và địa chỉ.",
        },
        { status: 400 },
      );
    }

    if (
      name.length > 200 ||
      description.length > 5000 ||
      phone.length > 20 ||
      country.length > 100 ||
      city.length > 100 ||
      address.length > 255
    ) {
      return NextResponse.json(
        { message: "Một hoặc nhiều trường vượt quá độ dài cho phép." },
        { status: 400 },
      );
    }

    await connectDB();

    const partner = await Partner.findOne({
      ownerUserId: userId,
    });

    if (!partner) {
      return NextResponse.json(
        { message: "Vui lòng đăng ký hồ sơ đối tác trước." },
        { status: 403 },
      );
    }

    const hotel = await Hotel.create({
      partnerId: partner._id,
      name,
      description,
      phone,
      country,
      city,
      address,
      status: "PENDING",
    });

    // Hoàn tất onboarding khi đã tạo khách sạn đầu tiên.
    if (partner.onboardingStatus !== "COMPLETED") {
      partner.onboardingStatus = "COMPLETED";
      await partner.save();

      // Role chỉ được thay đổi ở server.
      await User.findByIdAndUpdate(userId, {
        $set: { role: "HOTEL_OWNER" },
      });
    }

    return NextResponse.json(
      {
        message: "Đăng ký khách sạn thành công.",
        hotel: {
          id: hotel._id.toString(),
          name: hotel.name,
          status: hotel.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create hotel error:", error);

    return NextResponse.json(
      { message: "Không thể đăng ký khách sạn." },
      { status: 500 },
    );
  }
}
