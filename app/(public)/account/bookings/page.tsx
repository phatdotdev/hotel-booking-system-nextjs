"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BookingItem = { _id: string; bookingCode: string; status: string; paymentMethod: string; paymentStatus: string; checkInDate: string; checkOutDate: string; pricing: { totalAmount: number }; hotel?: { _id: string; name: string; city: string }; room?: { name: string } };
export default function BookingsPage() {
  const router = useRouter();
  const [today, setToday] = useState(0);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const refresh = useCallback(async () => {
    try { const response = await fetch("/api/bookings"); if (response.status === 401) { router.push("/login?callbackUrl=/account/bookings"); return; } const result = await response.json(); if (!response.ok) throw new Error(result.message); setToday(Date.now()); setBookings(result.data); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể tải đơn."); } finally { setLoading(false); }
  }, [router]);
  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);
  async function cancel(id: string) { if (!window.confirm("Bạn muốn hủy đặt phòng này?")) return; const response = await fetch(`/api/bookings/${id}`, { method: "PATCH" }); const result = await response.json(); if (!response.ok) setError(result.message); else refresh(); }
  async function review(id: string) { const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: id, rating, comment }) }); const result = await response.json(); if (!response.ok) setError(result.message); else { setEditing(null); setComment(""); refresh(); } }
  async function retryPayment(id: string) { const response = await fetch(`/api/bookings/${id}/payment`, { method: "POST" }); const result = await response.json(); if (!response.ok) setError(result.message); else window.location.assign(result.paymentUrl); }
  const shown = bookings.filter((booking) => tab === "cancelled" ? booking.status === "CANCELLED" : tab === "completed" ? booking.status === "CHECKED_OUT" : booking.status !== "CANCELLED" && booking.status !== "CHECKED_OUT");
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="text-3xl font-bold">Kỳ nghỉ của tôi</h1><div className="mt-6 flex gap-2">{([ ["upcoming", "Sắp tới"], ["completed", "Đã hoàn thành"], ["cancelled", "Đã hủy"] ] as const).map(([key,label]) => <button key={key} onClick={() => setTab(key)} aria-pressed={tab === key} className={`rounded px-4 py-2 ${tab === key ? "bg-primary text-primary-foreground" : "border"}`}>{label}</button>)}</div>
    {loading && <p className="mt-6">Đang tải...</p>}{error && <p role="alert" className="mt-6 text-red-600">{error}</p>}
    <div className="mt-6 space-y-4">{!loading && shown.length === 0 && <p>Chưa có đơn đặt phòng.</p>}{shown.map((booking) => <article key={booking._id} className="rounded-xl border p-5"><div className="flex flex-wrap justify-between gap-2"><div><strong>{booking.hotel?.name ?? "Khách sạn"}</strong><p className="text-sm text-muted-foreground">{booking.room?.name ?? "Phòng"} · {booking.hotel?.city}</p></div><span className="rounded-full border px-3 py-1 text-sm">{booking.status}</span></div><p className="mt-3">Mã: <strong>{booking.bookingCode}</strong></p><p>{new Date(booking.checkInDate).toLocaleDateString("vi-VN")} – {new Date(booking.checkOutDate).toLocaleDateString("vi-VN")}</p><p className="font-semibold">{booking.pricing.totalAmount.toLocaleString("vi-VN")} ₫</p><p>Thanh toán: {booking.paymentMethod} · {booking.paymentStatus}</p><div className="mt-3 flex gap-3">{booking.hotel?._id && <Link href={`/hotels/${booking.hotel._id}`} className="text-primary">Xem khách sạn</Link>}{booking.status === "PENDING" && booking.paymentStatus === "UNPAID" && booking.paymentMethod !== "PAY_AT_HOTEL" && <button onClick={() => retryPayment(booking._id)} className="text-primary">Thanh toán ngay</button>}{booking.status === "CONFIRMED" && booking.paymentMethod === "PAY_AT_HOTEL" && booking.paymentStatus === "UNPAID" && new Date(booking.checkInDate).getTime() > today + 86400000 && <button onClick={() => cancel(booking._id)} className="text-red-600">Hủy đặt phòng</button>}{booking.status === "CHECKED_OUT" && <button onClick={() => setEditing(booking._id)} className="text-primary">Viết đánh giá</button>}</div>{editing === booking._id && <div className="mt-4 space-y-3 border-t pt-4"><label>Điểm <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="ml-2 rounded border p-2">{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} sao</option>)}</select></label><textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} placeholder="Chia sẻ trải nghiệm" className="block w-full rounded border p-2" /><button onClick={() => review(booking._id)} className="rounded bg-primary px-4 py-2 text-primary-foreground">Gửi đánh giá</button></div>}</article>)}</div>
  </main>;
}
