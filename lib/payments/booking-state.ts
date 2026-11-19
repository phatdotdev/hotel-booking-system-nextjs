import { Booking } from "@/models/Booking";
import { BookingNight } from "@/models/BookingNight";
import { Hotel } from "@/models/Hotel";
import { RoomType } from "@/models/RoomType";
import { sendBookingConfirmation } from "@/lib/email/mailer";

export async function confirmPayment(bookingId: string, transactionId: string) {
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, status: "PENDING", paymentStatus: "UNPAID" },
    { $set: { status: "CONFIRMED", paymentStatus: "PAID", paymentTransactionId: transactionId } },
    { new: true },
  );
  if (!booking) return false;
  try {
    const [hotel, room] = await Promise.all([Hotel.findById(booking.hotelId).select("name"), RoomType.findById(booking.roomTypeId).select("name")]);
    await sendBookingConfirmation({ email: booking.guestDetails.email, name: booking.guestDetails.fullName, code: booking.bookingCode, hotel: hotel?.name ?? "Hotel GO", room: room?.name ?? "Phòng", checkIn: booking.checkInDate.toISOString().slice(0, 10), checkOut: booking.checkOutDate.toISOString().slice(0, 10), total: booking.pricing.totalAmount });
    await Booking.updateOne({ _id: booking._id }, { $set: { emailSentAt: new Date() } });
  } catch (error) { console.error("Paid booking confirmation email failed:", error); }
  return true;
}

export async function rejectPayment(bookingId: string) {
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, status: "PENDING", paymentStatus: "UNPAID" },
    { $set: { status: "CANCELLED" } },
    { new: true },
  );
  if (!booking) return false;
  await BookingNight.deleteMany({ bookingId: booking._id });
  return true;
}
