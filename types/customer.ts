export interface PublicRoom {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  capacity: { maxAdults: number; maxChildren: number };
  bedType: string;
  amenities: string[];
  totalRooms: number;
}
export interface PublicHotel {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  thumbnail: string;
  gallery: string[];
  amenities: string[];
  starRating: number;
  location: { coordinates: [number, number] };
  rooms: PublicRoom[];
  rating: number | null;
  reviewCount: number;
  reviews: { _id: string; author: string; rating: number; comment: string; createdAt: string }[];
}
