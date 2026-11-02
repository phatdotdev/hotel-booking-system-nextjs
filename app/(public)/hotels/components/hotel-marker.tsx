"use client";

import { Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet"; // Import thêm thư viện leaflet gốc

import { HotelMapItem } from "@/types/hotel";
import HotelCardOnMap from "./hotel-card-on-map";

// Khắc phục lỗi vỡ ảnh icon mặc định của Leaflet trong Next.js
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41], // Điểm neo của icon so với tọa độ
  popupAnchor: [1, -34], // Vị trí hiện Popup
  tooltipAnchor: [16, -28], // Vị trí hiện Tooltip
  shadowSize: [41, 41],
});

interface HotelMarkerProps {
  hotel: HotelMapItem;
  onSelect?: (hotel: HotelMapItem) => void;
}

export default function HotelMarker({ hotel, onSelect }: HotelMarkerProps) {
  const [lng, lat] = hotel.location.coordinates;

  return (
    <Marker
      position={[lat, lng]}
      icon={defaultIcon} // Truyền icon đã cấu hình vào đây
      eventHandlers={{
        click: () => onSelect?.(hotel),
      }}
    >
      <Tooltip permanent direction="top" offset={[-15, -25]} opacity={1}>
        <span className="font-medium text-xs">{hotel.name}</span>
      </Tooltip>

      <Popup closeButton autoPan maxWidth={320}>
        <HotelCardOnMap hotel={hotel} />
      </Popup>
    </Marker>
  );
}
