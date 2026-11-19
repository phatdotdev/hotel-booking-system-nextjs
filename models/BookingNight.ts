import { Schema, model, models } from "mongoose";

// A unique slot for each room type and calendar night prevents concurrent overbooking.
const BookingNightSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  roomTypeId: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
  night: { type: String, required: true },
  slot: { type: Number, required: true },
});
BookingNightSchema.index({ roomTypeId: 1, night: 1, slot: 1 }, { unique: true });
export const BookingNight = models.BookingNight || model("BookingNight", BookingNightSchema);
