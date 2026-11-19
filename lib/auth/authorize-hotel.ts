import mongoose from "mongoose";

import { connectDB } from "@/lib/data/mongoose";
import getAuthenticatedUserId from "./get-authenticated-user-id";
import { Partner } from "@/models/Partner";
import { Hotel } from "@/models/Hotel";

export async function authorizeHotel(hotelId: string) {
  await connectDB();

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false as const,
      status: 401,
      message: "Unauthorized.",
    };
  }

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(hotelId)) {
    return {
      success: false as const,
      status: 400,
      message: "Invalid ID.",
    };
  }

  const partner = await Partner.findOne({
    ownerUserId: userId,
  }).lean();

  if (!partner) {
    return {
      success: false as const,
      status: 403,
      message: "Partner profile not found.",
    };
  }

  if (partner.status !== "ACTIVE") {
    return {
      success: false as const,
      status: 403,
      message: "Partner account is not active.",
    };
  }

  const hotel = await Hotel.findOne({
    _id: hotelId,
    partnerId: partner._id,
  }).lean();

  if (!hotel) {
    return {
      success: false as const,
      status: 404,
      message: "Hotel not found.",
    };
  }

  return {
    success: true as const,
    userId,
    partnerId: partner._id.toString(),
    hotelId: hotel._id.toString(),
    hotel,
  };
}
