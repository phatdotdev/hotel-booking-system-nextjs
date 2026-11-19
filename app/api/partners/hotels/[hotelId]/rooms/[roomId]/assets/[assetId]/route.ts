import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { authorizeHotel } from "@/lib/auth/authorize-hotel";
import { RoomAsset } from "@/models/Room-Asset";
import { Room } from "@/models/Room";

type RouteContext = {
  params: Promise<{
    hotelId: string;
    roomId: string;
    assetId: string;
  }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { hotelId, roomId, assetId } = await context.params;

    const auth = await authorizeHotel(hotelId);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    if (
      !mongoose.isValidObjectId(roomId) ||
      !mongoose.isValidObjectId(assetId)
    ) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const room = await Room.exists({
      _id: roomId,
      hotelId: auth.hotelId,
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found." }, { status: 404 });
    }

    const asset = await RoomAsset.findOne({
      _id: assetId,
      hotelId: auth.hotelId,
      roomId,
    });

    if (!asset) {
      return NextResponse.json(
        { message: "Asset not found." },
        { status: 404 },
      );
    }

    // TODO:
    // Delete file from Cloudinary using asset.publicId.
    // Only remove MongoDB metadata after successful deletion
    // or after a reliable deletion job has been scheduled.

    await asset.deleteOne();

    return NextResponse.json({
      message: "Asset deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ASSET ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 },
    );
  }
}
