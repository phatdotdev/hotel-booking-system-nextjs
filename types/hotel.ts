export interface HotelMapItem {
  _id: string;
  name: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  address: string;
  city: string;

  thumbnail?: string;

  pricePerNight: number;
  rating?: number;
  reviewCount?: number;

  description?: string;
}
