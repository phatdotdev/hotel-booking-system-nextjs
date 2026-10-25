import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    images: [{ type: String }],
    ownerReply: {
      comment: { type: String, default: "" },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true },
);

export const Review = models.Review || model("Review", ReviewSchema);
