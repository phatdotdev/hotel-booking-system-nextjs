"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Users, ArrowRight } from "lucide-react";

import { HotelMapItem } from "@/types/hotel";

interface HotelCardOnMapProps {
  hotel: HotelMapItem;
}

export default function HotelCardOnMap({ hotel }: HotelCardOnMapProps) {
  return (
    <div className="w-[280px] overflow-hidden rounded-xl bg-background">
      {/* Hotel Image */}
      {hotel.thumbnail && (
        <div className="relative h-[140px] w-full">
          <Image
            src={hotel.thumbnail}
            alt={hotel.name}
            fill
            className="object-cover"
            sizes="280px"
          />
        </div>
      )}

      {/* Hotel Information */}
      <div className="flex flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-base font-semibold">{hotel.name}</h3>

        <div className="flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

          <span className="line-clamp-2">
            {hotel.address}, {hotel.city}
          </span>
        </div>

        {hotel.rating !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

            <span className="font-medium">{hotel.rating.toFixed(1)}</span>

            {hotel.reviewCount !== undefined && (
              <span className="text-xs text-muted-foreground">
                ({hotel.reviewCount} đánh giá)
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <span className="text-xs text-muted-foreground">Giá mỗi đêm</span>

            <p className="text-base font-bold text-primary">
              {hotel.pricePerNight.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          <Link
            href={`/hotels/${hotel._id}`}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Chi tiết
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
