import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { Partner } from "@/models/Partner";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/data/mongoose";

export async function GET() {
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

    await connectDB();

    const partner = await Partner.findOne({
      ownerUserId: userId,
    }).lean();

    if (!partner) {
      return NextResponse.json(
        { message: "Chưa có hồ sơ đối tác." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      partner: {
        id: partner._id.toString(),
        partnerType: partner.partnerType,
        businessName: partner.businessName,
        representativeName: partner.representativeName,
        phone: partner.phone,
        country: partner.country,
        city: partner.city,
        address: partner.address,
        onboardingStatus: partner.onboardingStatus,
        status: partner.status,
      },
    });
  } catch (error) {
    console.error("Get partner error:", error);

    return NextResponse.json(
      { message: "Không thể lấy hồ sơ đối tác." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Xác thực người dùng bằng NextAuth v4
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Bạn cần đăng nhập để đăng ký đối tác." },
        { status: 401 },
      );
    }

    // 2. Lấy User ID từ session do server xác thực
    const userId =
      (session.user as { id?: string }).id ??
      (session as typeof session & { userId?: string }).userId;

    if (!userId) {
      return NextResponse.json(
        { message: "Không xác định được tài khoản người dùng." },
        { status: 401 },
      );
    }

    // 3. Đọc và kiểm tra dữ liệu đầu vào
    const body = await request.json();

    const {
      partnerType,
      businessName,
      representativeName,
      phone,
      country,
      city,
      address,
    } = body;

    if (!["INDIVIDUAL", "BUSINESS"].includes(partnerType)) {
      return NextResponse.json(
        { message: "Loại đối tác không hợp lệ." },
        { status: 400 },
      );
    }

    if (
      ![representativeName, phone, country, city, address].every(
        (value) => typeof value === "string" && value.trim().length > 0,
      )
    ) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin bắt buộc." },
        { status: 400 },
      );
    }

    if (
      partnerType === "BUSINESS" &&
      (typeof businessName !== "string" || !businessName.trim())
    ) {
      return NextResponse.json(
        { message: "Vui lòng nhập tên doanh nghiệp." },
        { status: 400 },
      );
    }

    // 4. Kết nối database
    await connectDB();

    // 5. Không cho phép một User tạo nhiều hồ sơ Partner
    const existingPartner = await Partner.findOne({
      ownerUserId: userId,
    });

    if (existingPartner) {
      return NextResponse.json(
        { message: "Tài khoản này đã có hồ sơ đối tác." },
        { status: 409 },
      );
    }

    // 6. Tạo hồ sơ đối tác
    const partner = await Partner.create({
      ownerUserId: userId,
      partnerType,
      businessName: partnerType === "BUSINESS" ? businessName.trim() : "",
      representativeName: representativeName.trim(),
      phone: phone.trim(),
      country: country.trim(),
      city: city.trim(),
      address: address.trim(),
      onboardingStatus: "IN_PROGRESS",
      status: "PENDING",
    });

    return NextResponse.json(
      {
        message: "Tạo hồ sơ đối tác thành công.",
        partner: {
          id: partner._id.toString(),
          partnerType: partner.partnerType,
          onboardingStatus: partner.onboardingStatus,
          status: partner.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create partner error:", error);

    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi tạo hồ sơ đối tác." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
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

    const body = await request.json();

    const {
      partnerType,
      businessName,
      representativeName,
      phone,
      country,
      city,
      address,
    } = body;

    if (!["INDIVIDUAL", "BUSINESS"].includes(partnerType)) {
      return NextResponse.json(
        { message: "Loại đối tác không hợp lệ." },
        { status: 400 },
      );
    }

    const requiredFields = [representativeName, phone, country, city, address];

    if (
      !requiredFields.every(
        (value) => typeof value === "string" && value.trim().length > 0,
      )
    ) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin bắt buộc." },
        { status: 400 },
      );
    }

    if (
      partnerType === "BUSINESS" &&
      (typeof businessName !== "string" || !businessName.trim())
    ) {
      return NextResponse.json(
        { message: "Vui lòng nhập tên doanh nghiệp." },
        { status: 400 },
      );
    }

    await connectDB();

    const partner = await Partner.findOneAndUpdate(
      { ownerUserId: userId },
      {
        $set: {
          partnerType,
          businessName: partnerType === "BUSINESS" ? businessName.trim() : "",
          representativeName: representativeName.trim(),
          phone: phone.trim(),
          country: country.trim(),
          city: city.trim(),
          address: address.trim(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!partner) {
      return NextResponse.json(
        { message: "Chưa có hồ sơ đối tác để cập nhật." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Cập nhật hồ sơ đối tác thành công.",
      partner: {
        id: partner._id.toString(),
        partnerType: partner.partnerType,
        businessName: partner.businessName,
        representativeName: partner.representativeName,
        phone: partner.phone,
        country: partner.country,
        city: partner.city,
        address: partner.address,
        onboardingStatus: partner.onboardingStatus,
        status: partner.status,
      },
    });
  } catch (error) {
    console.error("Update partner error:", error);

    return NextResponse.json(
      { message: "Không thể cập nhật hồ sơ đối tác." },
      { status: 500 },
    );
  }
}
