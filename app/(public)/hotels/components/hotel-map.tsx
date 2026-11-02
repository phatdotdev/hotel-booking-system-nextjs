"use client";

import { MapContainer, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { HotelMapItem } from "@/types/hotel";

import HotelMarker from "./hotel-marker";
import MapController from "./map-controller";

interface HotelMapProps {
  hotels: HotelMapItem[];

  onSelectHotel?: (hotel: HotelMapItem) => void;

  height?: number;
}

export default function HotelMap({
  hotels,
  onSelectHotel,
  height = 500,
}: HotelMapProps) {
  const positions: [number, number][] = hotels.map((hotel) => {
    const [lng, lat] = hotel.location.coordinates;

    return [lat, lng];
  });

  // Default position: Can Tho
  const defaultCenter: [number, number] = [10.0452, 105.7469];

  return (
    <div
      className="w-full overflow-hidden rounded-xl border"
      style={{ height }}
    >
      <MapContainer center={defaultCenter} zoom={12} className="h-full w-full">
        {/* MapTiler */}
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={`https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
        />

        {/* Auto fit map */}
        <MapController positions={positions} />

        {/* Hotels */}
        {hotels.map((hotel) => (
          <HotelMarker key={hotel._id} hotel={hotel} onSelect={onSelectHotel} />
        ))}
      </MapContainer>

      {hotels.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-lg bg-background px-4 py-2 text-sm shadow">
            Không tìm thấy khách sạn nào.
          </p>
        </div>
      )}
    </div>
  );
}
