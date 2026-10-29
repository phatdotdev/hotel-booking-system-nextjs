import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import { Partner } from "@/models/Partner";
import { Hotel } from "@/models/Hotel";
import { connectDB } from "@/lib/data/mongoose";
import { authOptions } from "@/lib/auth/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Bạn cần đăng nhập." },
        { status: 401 },
      );
    }

    const userId =
      (session.user as { id?: string }).id ??
      (session as typeof session & { userId?: string }).userId;

    if (!userId) {
      return NextResponse.json(
        { message: "Không xác định được tài khoản." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "ID khách sạn không hợp lệ." },
        { status: 400 },
      );
    }

    const body = await request.json();

    const fields = [
      "name",
      "description",
      "phone",
      "country",
      "city",
      "address",
    ] as const;

    const update: Record<string, string> = {};

    for (const field of fields) {
      if (typeof body[field] !== "string") {
        return NextResponse.json(
          { message: `Trường ${field} không hợp lệ.` },
          { status: 400 },
        );
      }

      update[field] = body[field].trim();
    }

    if (!update.name || !update.country || !update.city || !update.address) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin bắt buộc." },
        { status: 400 },
      );
    }

    if (
      update.name.length > 200 ||
      update.description.length > 5000 ||
      update.phone.length > 20 ||
      update.country.length > 100 ||
      update.city.length > 100 ||
      update.address.length > 255
    ) {
      return NextResponse.json(
        { message: "Một hoặc nhiều trường vượt quá độ dài cho phép." },
        { status: 400 },
      );
    }

    await connectDB();

    const partner = await Partner.findOne({
      ownerUserId: userId,
    }).select("_id");

    if (!partner) {
      return NextResponse.json(
        { message: "Không tìm thấy hồ sơ đối tác." },
        { status: 404 },
      );
    }

    const hotel = await Hotel.findOneAndUpdate(
      {
        _id: id,
        partnerId: partner._id,
      },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!hotel) {
      return NextResponse.json(
        { message: "Không tìm thấy khách sạn thuộc quyền quản lý của bạn." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Cập nhật khách sạn thành công.",
      hotel: {
        id: hotel._id.toString(),
        name: hotel.name,
        status: hotel.status,
      },
    });
  } catch (error) {
    console.error("Update hotel error:", error);

    return NextResponse.json(
      { message: "Không thể cập nhật khách sạn." },
      { status: 500 },
    );
  }
}
