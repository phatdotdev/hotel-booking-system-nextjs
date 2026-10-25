import { Schema, model, models } from "mongoose";

const BookingSchema = new Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
    assignedRoomId: { type: Schema.Types.ObjectId, ref: "Room", default: null },
    checkInDate: { type: Date, required: true, index: true },
    checkOutDate: { type: Date, required: true, index: true },
    guestDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    pricing: {
      pricePerNight: { type: Number, required: true },
      totalNights: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxAndFees: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "REFUNDED"],
      default: "UNPAID",
    },
    paymentMethod: {
      type: String,
      enum: ["CREDIT_CARD", "MOMO", "PAY_AT_HOTEL", "VNPAY"],
      default: "PAY_AT_HOTEL",
    },
  },
  { timestamps: true },
);

BookingSchema.index({
  hotelId: 1,
  roomTypeId: 1,
  checkInDate: 1,
  checkOutDate: 1,
});

export const Booking = models.Booking || model("Booking", BookingSchema);
