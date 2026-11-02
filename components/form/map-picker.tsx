"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPickerProps {
  value: {
    lat: number;
    lng: number;
  } | null;

  onChange: (value: { lat: number; lng: number }) => void;

  label?: string;
  placeholder?: string;
  height?: number;
}

// Đồng bộ vị trí từ component cha xuống bản đồ
function MapController({
  value,
}: {
  value: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!value) return;

    const currentCenter = map.getCenter();

    const distance = currentCenter.distanceTo(L.latLng(value.lat, value.lng));

    // Chỉ di chuyển bản đồ khi vị trí thay đổi đáng kể
    if (distance > 10) {
      map.flyTo([value.lat, value.lng], map.getZoom(), {
        duration: 0.5,
      });
    }
  }, [value, map]);

  return null;
}

// Bắt sự kiện click trên bản đồ
function MapEvents({
  onChange,
}: {
  onChange: (value: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function MapPicker({
  value,
  onChange,
  label = "Chọn vị trí",
  placeholder = "Click vào bản đồ để chọn vị trí",
  height = 350,
}: MapPickerProps) {
  // Tọa độ mặc định: Cần Thơ
  const defaultPosition: [number, number] = [10.0452, 105.7469];

  const position: [number, number] = value
    ? [value.lat, value.lng]
    : defaultPosition;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Label input */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{label}</label>

        <p className="text-xs text-muted-foreground">{placeholder}</p>
      </div>

      {/* Map */}
      <div
        className="relative w-full overflow-hidden rounded-xl border"
        style={{ height }}
      >
        <MapContainer center={position} zoom={14} className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
          />

          <MapController value={value} />

          <MapEvents onChange={onChange} />

          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const position = e.target.getLatLng();

                  onChange({
                    lat: position.lat,
                    lng: position.lng,
                  });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Input value */}
      <div className="rounded-lg border bg-background px-3 py-2 text-sm">
        {value ? (
          <div className="flex flex-col gap-1">
            <span className="font-medium">Vị trí đã chọn</span>

            <span className="text-muted-foreground">
              Latitude: {value.lat.toFixed(6)}
            </span>

            <span className="text-muted-foreground">
              Longitude: {value.lng.toFixed(6)}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">Chưa chọn vị trí</span>
        )}
      </div>
    </div>
  );
}
