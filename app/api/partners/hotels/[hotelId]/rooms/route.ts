import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { authorizeHotel } from "@/lib/auth/authorize-hotel";
import { Room } from "@/models/Room";
import { RoomType } from "@/models/RoomType";

type RouteContext = {
  params: Promise<{
    hotelId: string;
  }>;
};

// GET: Get rooms
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { hotelId } = await context.params;

    const auth = await authorizeHotel(hotelId);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") || 1));

    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") || 10)),
    );

    const status = searchParams.get("status");
    const roomTypeId = searchParams.get("roomTypeId");

    const filter: Record<string, unknown> = {
      hotelId: auth.hotelId,
    };

    if (
      status &&
      ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "INACTIVE"].includes(status)
    ) {
      filter.status = status;
    }

    if (roomTypeId) {
      if (!mongoose.isValidObjectId(roomTypeId)) {
        return NextResponse.json(
          { message: "Invalid roomTypeId." },
          { status: 400 },
        );
      }

      filter.roomTypeId = roomTypeId;
    }

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .populate("roomTypeId")
        .sort({ roomNumber: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Room.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET ROOMS ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 },
    );
  }
}

// POST: Create room
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { hotelId } = await context.params;

    const auth = await authorizeHotel(hotelId);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const body = await request.json();

    const {
      roomTypeId,
      roomNumber,
      name,
      description,
      maxAdults,
      maxChildren,
      maxOccupancy,
      area,
      areaUnit,
      beds,
      amenities,
      basePrice,
      currency,
    } = body;

    if (
      !roomTypeId ||
      !roomNumber ||
      maxAdults == null ||
      maxChildren == null ||
      maxOccupancy == null ||
      basePrice == null
    ) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 },
      );
    }

    if (
      !mongoose.isValidObjectId(roomTypeId) ||
      typeof roomNumber !== "string" ||
      !roomNumber.trim()
    ) {
      return NextResponse.json(
        { message: "Invalid room data." },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(maxAdults) ||
      !Number.isInteger(maxChildren) ||
      !Number.isInteger(maxOccupancy) ||
      maxAdults < 1 ||
      maxChildren < 0 ||
      maxOccupancy < maxAdults ||
      maxOccupancy < maxAdults + maxChildren
    ) {
      return NextResponse.json(
        { message: "Invalid room capacity." },
        { status: 400 },
      );
    }

    if (
      typeof basePrice !== "number" ||
      !Number.isFinite(basePrice) ||
      basePrice < 0
    ) {
      return NextResponse.json(
        { message: "Invalid base price." },
        { status: 400 },
      );
    }

    // Verify RoomType belongs to this hotel.
    const roomType = await RoomType.findOne({
      _id: roomTypeId,
      hotelId: auth.hotelId,
    });

    if (!roomType) {
      return NextResponse.json(
        { message: "Room type does not belong to this hotel." },
        { status: 400 },
      );
    }

    const room = await Room.create({
      hotelId: auth.hotelId,
      roomTypeId,
      roomNumber: roomNumber.trim(),
      name,
      description,
      maxAdults,
      maxChildren,
      maxOccupancy,
      area,
      areaUnit,
      beds,
      amenities,
      basePrice,
      currency,
      createdBy: auth.userId,
    });

    return NextResponse.json(
      {
        message: "Room created successfully.",
        data: room,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof mongoose.Error ||
      (error as { code?: number }).code === 11000
    ) {
      if ((error as { code?: number }).code === 11000) {
        return NextResponse.json(
          { message: "Room number already exists in this hotel." },
          { status: 409 },
        );
      }
    }

    console.error("CREATE ROOM ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 },
    );
  }
}
