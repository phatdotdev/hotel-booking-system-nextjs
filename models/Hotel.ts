import { Schema, model, models } from "mongoose";

const HotelSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    starRating: { type: Number, min: 1, max: 5, default: 3 },
    address: {
      street: { type: String, required: true },
      ward: { type: String, default: "" },
      district: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Vietnam" },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    rules: {
      checkInTime: { type: String, default: "14:00" },
      checkOutTime: { type: String, default: "12:00" },
      cancellationPolicy: { type: String, default: "" },
    },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "SUSPENDED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true },
);

HotelSchema.index({ location: "2dsphere" });
HotelSchema.index({ status: 1, ratingAvg: -1 });

export const Hotel = models.Hotel || model("Hotel", HotelSchema);
