import axiosClient from "@/lib/api/axios-client";
import { ENDPOINTS } from "@/lib/api/endpoints";
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
};
