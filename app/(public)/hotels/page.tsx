"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { HotelMapItem } from "@/types/hotel";

const HotelMap = dynamic(() => import("./components/hotel-map"), { ssr: false, loading: () => <p>Đang tải bản đồ...</p> });

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelMapItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");
  const [activeHotelId, setActiveHotelId] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/public/hotels?${params.toString()}&limit=20`, { signal: controller.signal })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.message); return result; })
      .then((result) => { setHotels(result.data); setPagination(result.pagination); setError(""); })
      .catch((reason) => { if (reason.name !== "AbortError") setError(reason.message ?? "Không thể tải khách sạn."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [params]);
  function changePage(page: number) { const next = new URLSearchParams(params); next.set("page", String(page)); router.push(`/hotels?${next}`); }
  const mapped = hotels.filter((hotel) => hotel.location?.coordinates?.length === 2 && hotel.location.coordinates.every(Number.isFinite) && hotel.location.coordinates.some((n) => n !== 0));
  return <main className="mx-auto max-w-7xl px-4 py-8">
    <h1 className="text-3xl font-bold">Tìm khách sạn</h1>
    <form action="/hotels" className="mt-6 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input name="search" aria-label="Tên hoặc thành phố" defaultValue={params.get("search") ?? ""} placeholder="Tên hoặc thành phố" className="rounded-md border p-2" />
      <input name="minPrice" aria-label="Giá từ" type="number" min="0" defaultValue={params.get("minPrice") ?? ""} placeholder="Giá từ" className="rounded-md border p-2" />
      <input name="maxPrice" aria-label="Giá đến" type="number" min="0" defaultValue={params.get("maxPrice") ?? ""} placeholder="Giá đến" className="rounded-md border p-2" />
      <select name="starRating" aria-label="Hạng sao" defaultValue={params.get("starRating") ?? ""} className="rounded-md border p-2"><option value="">Mọi hạng sao</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} sao</option>)}</select>
      <select name="propertyType" aria-label="Loại chỗ nghỉ" defaultValue={params.get("propertyType") ?? ""} className="rounded-md border p-2"><option value="">Mọi loại chỗ nghỉ</option>{["HOTEL","RESORT","VILLA","HOMESTAY","APARTMENT"].map((type) => <option key={type}>{type}</option>)}</select>
      <input name="amenities" aria-label="Tiện ích" defaultValue={params.get("amenities") ?? ""} placeholder="Tiện ích: WIFI,POOL" className="rounded-md border p-2" />
      <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Lọc khách sạn</button>
    </form>
    <div className="mt-6 flex items-center justify-between"><p>{loading ? "Đang tìm..." : `${hotels.length} khách sạn`}</p><div className="flex gap-2"><button onClick={() => setView("list")} aria-pressed={view === "list"} className="rounded border px-3 py-1">Danh sách</button><button onClick={() => setView("grid")} aria-pressed={view === "grid"} className="rounded border px-3 py-1">Lưới</button></div></div>
    {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
    <div className="mt-4 grid gap-6 lg:grid-cols-2">
      <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
        {!loading && hotels.length === 0 && <p>Không tìm thấy khách sạn phù hợp.</p>}
        {hotels.map((hotel) => <article key={hotel._id} ref={(node) => { refs.current[hotel._id] = node; }} onMouseEnter={() => setActiveHotelId(hotel._id)} className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {hotel.thumbnail && <img src={hotel.thumbnail} alt={hotel.name} className="h-44 w-full object-cover" />}
          <div className="p-4"><h2 className="text-xl font-semibold">{hotel.name}</h2><p className="text-sm text-muted-foreground">{hotel.address}, {hotel.city}</p><p className="mt-2">{hotel.starRating} ★ {hotel.rating ? `· ${hotel.rating.toFixed(1)}/5 (${hotel.reviewCount})` : ""}</p><p className="mt-2 font-semibold">Từ {hotel.pricePerNight.toLocaleString("vi-VN")} ₫/đêm</p><Link href={`/hotels/${hotel._id}`} className="mt-3 inline-block rounded bg-primary px-4 py-2 text-primary-foreground">Xem phòng</Link></div>
        </article>)}
        {pagination.totalPages > 1 && <div className="flex gap-3"><button disabled={pagination.page <= 1} onClick={() => changePage(pagination.page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Trước</button><span className="py-2">{pagination.page}/{pagination.totalPages}</span><button disabled={pagination.page >= pagination.totalPages} onClick={() => changePage(pagination.page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Sau</button></div>}
      </div>
      <div className="lg:sticky lg:top-28 lg:h-[600px]"><HotelMap hotels={mapped} activeHotelId={activeHotelId} height={600} onSelectHotel={(hotel) => { setActiveHotelId(hotel._id); refs.current[hotel._id]?.scrollIntoView({ behavior: "smooth", block: "center" }); }} /></div>
    </div>
  </main>;
}

export default function HotelsPage() { return <Suspense fallback={<p className="p-8">Đang tải...</p>}><Results /></Suspense>; }
