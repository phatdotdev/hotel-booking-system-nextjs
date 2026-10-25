"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface Hotel {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface Location {
  lat: number;
  lng: number;
}

interface HotelMapProps {
  hotels: Hotel[];
  selectedHotel?: Hotel | null;
  userLocation?: Location | null;
}

export default function HotelMap({
  hotels,
  selectedHotel,
  userLocation,
}: HotelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeRef = useRef<any>(null);

  // 1. Khởi tạo bản đồ
  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");

      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      // Sửa lỗi hiển thị icon mặc định của Leaflet trong Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current).setView(
        [10.7769, 106.7009], // Tọa độ mặc định (TP.HCM)
        13,
      );

      L.tileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
    };

    initMap();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Render danh sách Marker khách sạn
  useEffect(() => {
    const renderHotels = async () => {
      const L = await import("leaflet");
      const map = mapRef.current;

      if (!map) return;

      // Xóa markers cũ
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Thêm markers mới
      hotels.forEach((hotel) => {
        const marker = L.marker([hotel.lat, hotel.lng])
          .addTo(map)
          .bindPopup(`<strong>${hotel.name}</strong>`);

        markersRef.current.push(marker);
      });
    };

    renderHotels();
  }, [hotels]);

  // 3. Zoom / Focus vào khách sạn được chọn
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedHotel) return;

    map.flyTo([selectedHotel.lat, selectedHotel.lng], 16, {
      duration: 1,
    });
  }, [selectedHotel]);

  // 4. Tìm và vẽ đường đi (OSRM Route)
  useEffect(() => {
    const drawRoute = async () => {
      const L = await import("leaflet");
      const map = mapRef.current;

      if (!map || !userLocation || !selectedHotel) return;

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${userLocation.lng},${userLocation.lat};` +
          `${selectedHotel.lng},${selectedHotel.lat}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.routes?.length) return;

        const coordinates = data.routes[0].geometry.coordinates;

        const latLngs = coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
        );

        if (routeRef.current) {
          routeRef.current.remove();
        }

        routeRef.current = L.polyline(latLngs, {
          color: "#2563eb",
          weight: 5,
          opacity: 0.8,
        }).addTo(map);

        map.fitBounds(routeRef.current.getBounds(), {
          padding: [50, 50],
        });
      } catch (error) {
        console.error("Lỗi tìm đường OSRM:", error);
      }
    };

    drawRoute();
  }, [userLocation, selectedHotel]);

  return (
    <div
      ref={containerRef}
      style={{ zIndex: -1 }}
      className="relative z-0 isolate h-full w-full min-h-[400px]"
    />
  );
}
