"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type BookingStatus = { bookingCode: string; status: string; paymentStatus: string; paymentMethod: string };

function Result() {
  const params = useSearchParams();
  const code = params.get("code");
  const [booking, setBooking] = useState<BookingStatus | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!code) return;
    let stopped = false;
    async function refresh() {
      try {
        const response = await fetch("/api/bookings", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        if (!stopped) { setBooking(result.data.find((item: BookingStatus) => item.bookingCode === code) ?? null); setError(""); }
      } catch (reason) { if (!stopped) setError(reason instanceof Error ? reason.message : "Không thể kiểm tra đơn đặt phòng."); }
    }
    void refresh();
    const timer = setInterval(refresh, 5000);
    return () => { stopped = true; clearInterval(timer); };
  }, [code]);
  const title = !code || params.has("payment") ? "Không xác minh được thanh toán" : booking?.status === "CANCELLED" ? "Thanh toán chưa thành công" : booking?.status === "CONFIRMED" ? "Đặt phòng thành công" : "Đang xác nhận thanh toán";
  return <main className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-3xl font-bold">{title}</h1>
    {code && <p className="mt-4">Mã đặt phòng: <strong>{code}</strong></p>}
    {booking?.status === "PENDING" && <p className="mt-3">Đang chờ cổng thanh toán gửi xác nhận. Trang sẽ tự cập nhật.</p>}
    {booking?.status === "CONFIRMED" && <p className="mt-3">{booking.paymentMethod === "PAY_AT_HOTEL" ? "Thanh toán tại khách sạn khi nhận phòng." : "Thanh toán đã được xác nhận."} Email xác nhận đã được yêu cầu gửi tới địa chỉ bạn cung cấp.</p>}
    {booking?.status === "CANCELLED" && <p className="mt-3">Đơn đã bị hủy do thanh toán không thành công.</p>}
    {error && <p role="alert" className="mt-3 text-red-600">{error}</p>}
    <Link href="/account/bookings" className="mt-6 inline-block rounded bg-primary px-5 py-3 text-primary-foreground">Xem đơn đặt phòng</Link>
  </main>;
}
export default function SuccessPage() { return <Suspense fallback={<p className="p-8">Đang tải...</p>}><Result /></Suspense>; }
