import { Schema, model, models } from "mongoose";

const RoomSchema = new Schema(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
      index: true,
    },
    roomNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE"],
      default: "AVAILABLE",
    },
    isClean: { type: Boolean, default: true },
  },
  { timestamps: true },
);

RoomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

export const Room = models.Room || model("Room", RoomSchema);
