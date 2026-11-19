import axiosClient from "@/lib/api/axios-client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Hotel, HotelListResponse } from "@/types/hotel";
import { PartnerProfile } from "@/types/partner";

export interface PartnerFormPayload {
  businessName?: string;
  representativeName: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  partnerType: "INDIVIDUAL" | "BUSINESS";
}

export const PartnerService = {
  getProfile: (): Promise<PartnerProfile> => {
    return axiosClient.get(ENDPOINTS.PARTNER.PROFILE);
  },

  createPartner: (data: PartnerFormPayload) => {
    return axiosClient.post(ENDPOINTS.PARTNER.PROFILE, data);
  },

  async getHotels(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<HotelListResponse> {
    const response = await axiosClient.get("/api/partners/hotels", {
      params,
    });

    return response as unknown as HotelListResponse;
  },

  async getHotelById(hotelId: string): Promise<Hotel> {
    const response = await axiosClient.get(`/api/hotels/${hotelId}`);

    return response.data;
  },
};
