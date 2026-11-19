import { randomBytes } from "node:crypto";
import { isValidObjectId } from "mongoose";
import getAuthenticatedUserId from "@/lib/auth/get-authenticated-user-id";
import { calculatePricing, parseStay } from "@/lib/bookings";
import { connectDB } from "@/lib/data/mongoose";
import { sendBookingConfirmation } from "@/lib/email/mailer";
import { Booking } from "@/models/Booking";
import { BookingNight } from "@/models/BookingNight";
import { Hotel } from "@/models/Hotel";
import { RoomType } from "@/models/RoomType";
import { canUsePayment, createMomoPayment, createVnpayUrl, newPaymentRequestId } from "@/lib/payments/gateways";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  await connectDB();
  const bookings = await Booking.find({ userId }).sort({ createdAt: -1 }).populate("hotelId", "name thumbnail city").populate("roomTypeId", "name").lean();
  const data = bookings.map((booking) => ({ ...booking, hotel: booking.hotelId, room: booking.roomTypeId }));
  return Response.json({ success: true, data });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ message: "Vui lòng đăng nhập để đặt phòng." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const { hotelId, roomTypeId, checkInDate, checkOutDate, guestDetails, paymentMethod, specialRequests } = body;
  const guest = guestDetails as { fullName?: string; email?: string; phone?: string; adults?: number; children?: number } | undefined;
  const stay = parseStay(String(checkInDate ?? ""), String(checkOutDate ?? ""));
  if (!isValidObjectId(hotelId) || !isValidObjectId(roomTypeId) || !stay || !guest || !guest.fullName?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email ?? "") || !guest.phone?.trim() || !Number.isInteger(guest.adults) || (guest.adults ?? 0) < 1 || !Number.isInteger(guest.children ?? 0) || !["PAY_AT_HOTEL", "VNPAY", "MOMO"].includes(String(paymentMethod)) || String(specialRequests ?? "").length > 1000) {
    return Response.json({ message: "Thông tin đặt phòng không hợp lệ." }, { status: 400 });
  }
  if (paymentMethod !== "PAY_AT_HOTEL" && !canUsePayment(paymentMethod as "VNPAY" | "MOMO")) return Response.json({ message: "Cổng thanh toán này chưa được cấu hình." }, { status: 503 });
  try {
    await connectDB();
    await BookingNight.init();
    const [hotel, room] = await Promise.all([Hotel.findOne({ _id: hotelId, status: "ACTIVE" }), RoomType.findOne({ _id: roomTypeId, hotelId, isActive: true })]);
    if (!hotel || !room) return Response.json({ message: "Khách sạn hoặc phòng không còn mở bán." }, { status: 404 });
    if (guest.adults! > room.capacity.maxAdults || (guest.children ?? 0) > room.capacity.maxChildren) return Response.json({ message: "Số khách vượt quá sức chứa phòng." }, { status: 400 });
    const pricing = calculatePricing(room.basePrice, stay.totalNights);
    if (!Number.isSafeInteger(room.basePrice) || !Number.isSafeInteger(pricing.totalAmount) || (paymentMethod !== "PAY_AT_HOTEL" && pricing.totalAmount < 1000) || (paymentMethod === "MOMO" && pricing.totalAmount > 50_000_000)) return Response.json({ message: "Giá phòng không phù hợp với cổng thanh toán." }, { status: 400 });
    // Bookings made before nightly slots were introduced still occupy inventory.
    const legacyCandidates = await Booking.find({ roomTypeId, status: { $in: ["PENDING", "CONFIRMED", "CHECKED_IN"] }, checkInDate: { $lt: stay.checkOut }, checkOutDate: { $gt: stay.checkIn } }).select("_id checkInDate checkOutDate").lean();
    const slottedIds = new Set((await BookingNight.distinct("bookingId", { roomTypeId, night: { $in: stay.nights } })).map(String));
    const legacy = legacyCandidates.filter((item) => !slottedIds.has(String(item._id)));
    const legacyCapacity = Math.max(0, ...stay.nights.map((night) => legacy.filter((item) => item.checkInDate.toISOString().slice(0, 10) <= night && item.checkOutDate.toISOString().slice(0, 10) > night).length));
    for (let slot = 0; slot < room.totalRooms - legacyCapacity; slot++) {
      const code = `BK-${randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;
      const booking = new Booking({ bookingCode: code, userId, hotelId, roomTypeId, checkInDate: stay.checkIn, checkOutDate: stay.checkOut, guestDetails: { fullName: guest.fullName.trim(), email: guest.email!.trim().toLowerCase(), phone: guest.phone.trim() }, specialRequests: String(specialRequests ?? ""), pricing, paymentMethod, paymentRequestId: paymentMethod === "MOMO" ? newPaymentRequestId() : null, status: "PENDING" });
      await booking.save();
      try {
        await BookingNight.insertMany(stay.nights.map((night) => ({ bookingId: booking._id, roomTypeId, night, slot })), { ordered: true });
        if (paymentMethod === "PAY_AT_HOTEL") {
          booking.status = "CONFIRMED";
          await booking.save();
          try {
            await sendBookingConfirmation({ email: guest.email!, name: guest.fullName!, code, hotel: hotel.name, room: room.name, checkIn: String(checkInDate), checkOut: String(checkOutDate), total: pricing.totalAmount });
            booking.emailSentAt = new Date();
            await booking.save();
          } catch (emailError) { console.error("Booking email failed:", emailError); }
          return Response.json({ success: true, data: { bookingCode: code, emailSent: !!booking.emailSentAt } }, { status: 201 });
        }
        // Keep the reservation pending until a signed gateway notification confirms payment.
        try {
          const paymentUrl = paymentMethod === "VNPAY"
            ? createVnpayUrl({ code, amount: pricing.totalAmount, ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1" })
            : await createMomoPayment({ code, amount: pricing.totalAmount, requestId: booking.paymentRequestId });
          booking.paymentUrl = paymentUrl;
          await booking.save();
          return Response.json({ success: true, data: { bookingCode: code, paymentUrl } }, { status: 201 });
        } catch (gatewayError) {
          console.error("Payment initiation failed:", gatewayError);
          return Response.json({ message: "Đơn đã được giữ chỗ nhưng chưa mở được cổng thanh toán. Hãy thử lại trong Đơn đặt phòng.", data: { bookingCode: code } }, { status: 502 });
        }
      } catch (error) {
        await BookingNight.deleteMany({ bookingId: booking._id });
        await Booking.deleteOne({ _id: booking._id });
        if ((error as { code?: number }).code !== 11000) throw error;
      }
    }
    return Response.json({ message: "Phòng đã hết trong khoảng thời gian này." }, { status: 409 });
  } catch (error) {
    console.error("Create booking:", error);
    return Response.json({ message: "Không thể tạo đặt phòng." }, { status: 500 });
  }
}
