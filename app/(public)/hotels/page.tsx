"use client";
import { HotelMapItem } from "@/types/hotel";
import dynamic from "next/dynamic";
const HotelMap = dynamic(() => import("./components/hotel-map"), {
  ssr: false,
  loading: () => <p>Đang tải bản đồ...</p>,
});
export default function HotelsPage() {
  const mockHotels: HotelMapItem[] = [
    {
      _id: "654a1b2c3d4e5f6g7h8i9j01",
      name: "Victoria Cần Thơ Resort",
      location: {
        type: "Point",
        coordinates: [105.7876, 10.0336], // [Longitude, Latitude]
      },
      address: "Phường Cái Khế, Quận Ninh Kiều",
      city: "Cần Thơ",
      thumbnail:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      pricePerNight: 2500000,
      rating: 4.8,
      reviewCount: 1240,
      description:
        "Khu nghỉ dưỡng 4 sao mang đậm nét kiến trúc Đông Dương, nằm e ấp bên bờ sông Hậu thơ mộng.",
    },
    {
      _id: "654a1b2c3d4e5f6g7h8i9j02",
      name: "Mường Thanh Luxury Cần Thơ",
      location: {
        type: "Point",
        coordinates: [105.7831, 10.0412],
      },
      address: "Khu E1, Cồn Cái Khế, Quận Ninh Kiều",
      city: "Cần Thơ",
      thumbnail:
        "https://images.unsplash.com/photo-1551882547-ff40eb0d1e9d?auto=format&fit=crop&w=800&q=80",
      pricePerNight: 1200000,
      rating: 4.5,
      reviewCount: 3850,
      description:
        "Khách sạn 5 sao cao cấp với tầm nhìn toàn cảnh thành phố và cầu Cần Thơ từ trên cao.",
    },
    {
      _id: "654a1b2c3d4e5f6g7h8i9j03",
      name: "Azerai Cần Thơ",
      location: {
        type: "Point",
        coordinates: [105.7955, 10.0353],
      },
      address: "Cồn Ấu, Phường Hưng Phú, Quận Cái Răng",
      city: "Cần Thơ",
      thumbnail:
        "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&w=800&q=80",
      pricePerNight: 5500000,
      rating: 4.9,
      reviewCount: 512,
      description:
        "Khu nghỉ dưỡng sinh thái biệt lập trên cồn Ấu, mang đến trải nghiệm riêng tư và hòa mình với thiên nhiên.",
    },
    {
      _id: "654a1b2c3d4e5f6g7h8i9j04",
      name: "TTC Hotel - Premium Cần Thơ",
      location: {
        type: "Point",
        coordinates: [105.785, 10.033],
      },
      address: "2 Hai Bà Trưng, Phường Tân An, Quận Ninh Kiều",
      city: "Cần Thơ",
      thumbnail:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
      pricePerNight: 950000,
      rating: 4.3,
      reviewCount: 2105,
      description:
        "Khách sạn tọa lạc ngay bến Ninh Kiều sầm uất, thuận tiện cho việc tham quan chợ nổi và các điểm du lịch.",
    },
  ];

  return (
    <main className="relative z-0 h-[calc(100vh-70px)]">
      <HotelMap hotels={mockHotels} />
    </main>
  );
}
