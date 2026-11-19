"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface MapControllerProps {
  positions: [number, number][];
  activePosition?: [number, number];
}

export default function MapController({ positions, activePosition }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (activePosition) map.flyTo([activePosition[1], activePosition[0]], Math.max(map.getZoom(), 13));
  }, [activePosition, map]);

  useEffect(() => {
    if (positions.length === 0) return;

    if (positions.length === 1) {
      map.flyTo(positions[0], 14, {
        duration: 0.5,
      });

      return;
    }

    const bounds = L.latLngBounds(positions);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 14,
      animate: true,
    });
  }, [positions, map]);

  return null;
}
