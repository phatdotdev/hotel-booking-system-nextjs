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
  starRating?: number;
  propertyType?: PropertyType;
  amenities?: string[];
}

export type HotelStatus =
  | "DRAFT"
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED";

export type PropertyType =
  | "HOTEL"
  | "RESORT"
  | "VILLA"
  | "HOMESTAY"
  | "APARTMENT";

export interface Hotel {
  _id: string;
  partnerId: string;

  name: string;
  description: string;

  propertyType: PropertyType;
  starRating: number;

  phone: string;
  email: string;
  website: string;

  country: string;
  city: string;
  address: string;
  zipCode?: string;

  thumbnail: string;
  gallery: string[];
  videos: string[];

  amenities: string[];

  checkInTime: string;
  checkOutTime: string;

  status: HotelStatus;

  createdAt: string;
  updatedAt: string;
}

export interface HotelListResponse {
  success: boolean;
  data: Hotel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
