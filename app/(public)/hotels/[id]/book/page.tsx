"use client";
import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { getUserAccountAction } from "@/actions/user";
import type { PublicHotel } from "@/types/customer";
import { calculatePricing, parseStay } from "@/lib/bookings";

function BookingForm({ id }: { id: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<PublicHotel | null>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAY_AT_HOTEL");
  const [availableMethods, setAvailableMethods] = useState({ vnpay: false, momo: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch(`/api/public/hotels/${id}`).then((response) => response.json()).then((result) => { if (result.success) setHotel(result.data); else setError(result.message); }).catch(() => setError("Không thể tải phòng."));
    getSession().then((session) => { if (session?.user) { setFullName(session.user.name ?? ""); setEmail(session.user.email ?? ""); } });
    getUserAccountAction().then((result) => { if (result.success && result.user) { setFullName(result.user.fullName); setEmail(result.user.email); setPhone(result.user.phone); } });
    fetch("/api/payments/methods").then((response) => response.json()).then(setAvailableMethods).catch(() => {});
  }, [id]);
  const room = hotel?.rooms.find((item) => item._id === params.get("roomTypeId"));
  const stay = parseStay(checkInDate, checkOutDate);
  const pricing = room && stay ? calculatePricing(room.basePrice, stay.totalNights) : null;
  const today = new Date().toISOString().slice(0, 10);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!room || !stay) { setError("Vui lòng chọn phòng và ngày hợp lệ."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hotelId: id, roomTypeId: room._id, checkInDate, checkOutDate, guestDetails: { fullName, email, phone, adults, children }, specialRequests, paymentMethod }) });
      const result = await response.json();
      if (response.status === 401) { router.push(`/login?callbackUrl=${encodeURIComponent(`/hotels/${id}/book?roomTypeId=${room._id}`)}`); return; }
      if (!response.ok) { if (result.data?.bookingCode) router.push("/account/bookings"); throw new Error(result.message); }
      if (result.data.paymentUrl) window.location.assign(result.data.paymentUrl);
      else router.push(`/booking/success?code=${encodeURIComponent(result.data.bookingCode)}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể đặt phòng."); setBusy(false); }
  }
  if (!hotel) return <p className="p-8">{error || "Đang tải phòng..."}</p>;
  if (!room) return <p className="p-8">Không tìm thấy loại phòng. <Link href={`/hotels/${id}`} className="text-primary">Chọn phòng khác</Link></p>;
  return <main className="mx-auto max-w-5xl px-4 py-8"><Link href={`/hotels/${id}`} className="text-primary">← {hotel.name}</Link><h1 className="mt-4 text-3xl font-bold">Đặt phòng {room.name}</h1>
    <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]"><div className="space-y-5 rounded-xl border p-6"><h2 className="text-xl font-semibold">Thông tin lưu trú</h2>
      <div className="grid gap-4 sm:grid-cols-2"><label>Nhận phòng<input required type="date" min={today} value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label>Trả phòng<input required type="date" min={checkInDate || today} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label>Người lớn<input required type="number" min="1" max={room.capacity.maxAdults} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="mt-1 w-full rounded border p-2" /></label><label>Trẻ em<input required type="number" min="0" max={room.capacity.maxChildren} value={children} onChange={(e) => setChildren(Number(e.target.value))} className="mt-1 w-full rounded border p-2" /></label></div>
      <h2 className="text-xl font-semibold">Thông tin khách</h2><label className="block">Họ tên<input required maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="block">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="block">Số điện thoại<input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="block">Ghi chú<textarea maxLength={1000} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
      <h2 className="text-xl font-semibold">Thanh toán</h2><label className="block"><input type="radio" checked={paymentMethod === "PAY_AT_HOTEL"} onChange={() => setPaymentMethod("PAY_AT_HOTEL")} /> Thanh toán tại khách sạn</label><label className="block"><input type="radio" disabled={!availableMethods.vnpay} checked={paymentMethod === "VNPAY"} onChange={() => setPaymentMethod("VNPAY")} /> VNPAY {!availableMethods.vnpay && "(chưa cấu hình)"}</label><label className="block"><input type="radio" disabled={!availableMethods.momo} checked={paymentMethod === "MOMO"} onChange={() => setPaymentMethod("MOMO")} /> MoMo {!availableMethods.momo && "(chưa cấu hình)"}</label>
    </div><aside className="h-fit rounded-xl border p-6"><h2 className="font-semibold">{hotel.name}</h2><p>{room.name}</p><p className="mt-4">{room.basePrice.toLocaleString("vi-VN")} ₫ × {stay?.totalNights ?? 0} đêm</p><p>Tiền phòng: {pricing?.subtotal.toLocaleString("vi-VN") ?? 0} ₫</p><p>Thuế và phí (10%): {pricing?.taxAndFees.toLocaleString("vi-VN") ?? 0} ₫</p><p className="mt-4 border-t pt-4 text-xl font-bold">Tổng: {pricing?.totalAmount.toLocaleString("vi-VN") ?? 0} ₫</p>{error && <p role="alert" className="mt-3 text-red-600">{error}</p>}<button disabled={busy || !pricing} className="mt-4 w-full rounded bg-primary px-4 py-3 text-primary-foreground disabled:opacity-50">{busy ? "Đang đặt..." : "Xác nhận đặt phòng"}</button></aside></form>
  </main>;
}
function BookContent({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <BookingForm id={id} />; }
export default function BookPage({ params }: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p>Đang tải...</p>}><BookContent params={params} /></Suspense>; }
