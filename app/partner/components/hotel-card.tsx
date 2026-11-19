"use client";

import { Hotel } from "@/types/hotel";
import HotelStatusBadge from "./hotel-status-badge";

import { Building2, MapPin, Star, ArrowRight, Pencil, Eye } from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const router = useRouter();

  const managementUrl = `/partner/hotels/${hotel._id}`;

  return (
    <div className="group overflow-hidden rounded-xl border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      {/* Hotel Image */}
      <div className="relative h-52 w-full bg-muted">
        {hotel.thumbnail ? (
          <Image
            src={hotel.thumbnail}
            alt={hotel.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}

        <div className="absolute right-3 top-3">
          <HotelStatusBadge status={hotel.status} />
        </div>
      </div>

      {/* Hotel Information */}
      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-lg font-semibold">{hotel.name}</h3>

            <div className="flex shrink-0 items-center gap-1 text-sm font-medium">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {hotel.starRating}
            </div>
          </div>

          <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

            <span className="line-clamp-2">
              {hotel.address}, {hotel.city}, {hotel.country}
            </span>
          </div>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {hotel.description || "Chưa có mô tả khách sạn."}
        </p>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-xs text-muted-foreground">
            {hotel.propertyType}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`${managementUrl}/edit`)}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </button>

            <button
              type="button"
              onClick={() => router.push(managementUrl)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:opacity-90"
            >
              <Eye className="h-4 w-4" />
              Quản lý
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
