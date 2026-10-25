import { Schema, model, models } from "mongoose";

const RoomTypeSchema = new Schema(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    capacity: {
      maxAdults: { type: Number, required: true, min: 1 },
      maxChildren: { type: Number, default: 0, min: 0 },
    },
    basePrice: { type: Number, required: true, min: 0 },
    sizeSqMeters: { type: Number, default: 0 },
    bedType: { type: String, default: "" },
    amenities: [{ type: String }],
    images: [{ type: String }],
    totalRooms: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

RoomTypeSchema.index({ hotelId: 1, basePrice: 1 });

export const RoomType = models.RoomType || model("RoomType", RoomTypeSchema);
