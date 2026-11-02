import { ApiResponse } from "./api-response";

// 1. Enum / Union Types
export type PartnerType = "INDIVIDUAL" | "BUSINESS";
export type OnboardingStatus = "IN_PROGRESS" | "COMPLETED";
export type PartnerStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

// 2. Interface chi tiết trường response (Phản hồi từ Admin/Hệ thống)
export interface PartnerAdminResponse {
  message: string;
  respondedAt: string | null;
  respondedBy: string | null; // ID của Admin hoặc Object User nếu có populate
}

// 3. Interface chính của Hồ sơ Partner (Khớp với Mongoose Schema)
export interface PartnerProfile {
  _id: string;
  ownerUserId: string;
  partnerType: PartnerType;
  businessName: string;
  representativeName: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  onboardingStatus: OnboardingStatus;
  status: PartnerStatus;
  response?: PartnerAdminResponse; // Trường response mới thêm
  createdAt: string;
  updatedAt: string;
}

// 4. Interface chuẩn cho API Response trả về từ Server

// Type cụ thể trả về khi gọi API lấy Profile Partner
export type PartnerProfileApiResponse = ApiResponse<PartnerProfile>;
