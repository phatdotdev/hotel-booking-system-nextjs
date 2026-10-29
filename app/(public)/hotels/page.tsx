"use client";

import dynamic from "next/dynamic";

const HotelMap = dynamic(() => import("@/components/features/hotel-map"), {
  ssr: false,
  loading: () => (
    <div className="z-0 flex h-full items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function HotelsPage() {
  return (
    <main className="relative z-0 h-[calc(100vh-70px)]">
      <HotelMap
        hotels={[
          {
            id: "1",
            name: "Hotel A",
            lat: 13.338414,
            lng: 52.507932,
          },
          {
            id: "2",
            name: "Hotel B",
            lat: 13.341,
            lng: 52.511,
          },
        ]}
      />
    </main>
  );
}
