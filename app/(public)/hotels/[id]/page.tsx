"use client";
import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { PublicHotel } from "@/types/customer";
import type { HotelMapItem } from "@/types/hotel";
const HotelMap = dynamic(() => import("../components/hotel-map"), { ssr: false });

function HotelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [hotel, setHotel] = useState<PublicHotel | null>(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/public/hotels/${id}`).then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.message); return result.data; }).then(setHotel).catch((reason) => setError(reason.message));
  }, [id]);
  if (error) return <p role="alert" className="p-8">{error}</p>;
  if (!hotel) return <p className="p-8">Đang tải khách sạn...</p>;
  const images = [...new Set([hotel.thumbnail, ...hotel.gallery].filter(Boolean))];
  const hasLocation = hotel.location?.coordinates?.length === 2 && hotel.location.coordinates.every(Number.isFinite) && hotel.location.coordinates.some((n) => n !== 0);
  const mapHotel: HotelMapItem = { _id: hotel._id, name: hotel.name, address: hotel.address, city: hotel.city, location: { type: "Point", coordinates: hotel.location.coordinates }, pricePerNight: hotel.rooms[0]?.basePrice ?? 0 };
  return <main className="mx-auto max-w-7xl px-4 py-8">
    <Link href="/hotels" className="text-primary">← Tất cả khách sạn</Link>
    <h1 className="mt-4 text-3xl font-bold">{hotel.name}</h1><p className="mt-2">{hotel.starRating} ★ · {hotel.address}, {hotel.city}, {hotel.country}</p>
    <div className="mt-6 grid gap-2 sm:grid-cols-3">{images.map((src, index) => <button key={src} onClick={() => setSelectedImage(src)} className={index === 0 ? "sm:col-span-2 sm:row-span-2" : ""}><img src={src} alt={`${hotel.name} - ảnh ${index + 1}`} className="h-56 w-full rounded-lg object-cover sm:h-full" /></button>)}</div>
    {selectedImage && <div role="dialog" aria-modal="true" aria-label="Ảnh khách sạn" onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6"><button onClick={() => setSelectedImage(null)} className="absolute right-6 top-6 text-2xl text-white">Đóng ×</button><img src={selectedImage} alt={hotel.name} className="max-h-full max-w-full object-contain" /></div>}
    <div className="mt-10 grid gap-10 lg:grid-cols-2"><section><h2 className="text-2xl font-semibold">Về khách sạn</h2><p className="mt-3 whitespace-pre-line text-muted-foreground">{hotel.description}</p><h3 className="mt-6 text-xl font-semibold">Tiện ích</h3><div className="mt-3 flex flex-wrap gap-2">{hotel.amenities.map((item) => <span key={item} className="rounded-full border px-3 py-1">{item}</span>)}</div></section>{hasLocation && <section><h2 className="mb-3 text-2xl font-semibold">Vị trí</h2><HotelMap hotels={[mapHotel]} height={320} /></section>}</div>
    <section className="mt-12"><h2 className="text-2xl font-semibold">Chọn loại phòng</h2><div className="mt-4 space-y-4">{hotel.rooms.map((room) => <article key={room._id} className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[200px_1fr_auto]">{room.images[0] ? <img src={room.images[0]} alt={room.name} className="h-40 w-full rounded-lg object-cover" /> : <div className="h-40 rounded-lg bg-muted" />}<div><h3 className="text-xl font-semibold">{room.name}</h3><p className="text-sm text-muted-foreground">{room.description}</p><p className="mt-2">Tối đa {room.capacity.maxAdults} người lớn, {room.capacity.maxChildren} trẻ em · {room.bedType}</p><p className="mt-2 text-sm">{room.amenities.join(" · ")}</p></div><div className="sm:text-right"><p className="font-bold text-primary">{room.basePrice.toLocaleString("vi-VN")} ₫/đêm</p><Link href={`/hotels/${id}/book?roomTypeId=${room._id}`} className="mt-3 inline-block rounded bg-primary px-4 py-2 text-primary-foreground">Đặt ngay</Link></div></article>)}{hotel.rooms.length === 0 && <p>Khách sạn chưa có phòng đang mở bán.</p>}</div></section>
    <section className="mt-12"><h2 className="text-2xl font-semibold">Đánh giá {hotel.rating !== null && `· ${hotel.rating.toFixed(1)}/5`} ({hotel.reviewCount})</h2><div className="mt-4 space-y-4">{hotel.reviews.map((review) => <article key={review._id} className="rounded-xl border p-4"><p className="font-semibold">{review.author} · {review.rating} ★</p><p className="mt-2">{review.comment}</p></article>)}{hotel.reviews.length === 0 && <p>Chưa có đánh giá.</p>}</div></section>
  </main>;
}

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p className="p-8">Đang tải khách sạn...</p>}><HotelDetail params={params} /></Suspense>; }
