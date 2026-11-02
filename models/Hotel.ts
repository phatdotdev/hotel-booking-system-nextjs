import { Schema, model, models } from "mongoose";

const HotelSchema = new Schema(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },

    // 1. THÔNG TIN CƠ BẢN
    name: {
      type: String,
      required: [true, "Hotel name is required."],
      trim: true,
      maxlength: [200, "Hotel name cannot exceed 200 characters."],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Description cannot exceed 5000 characters."],
    },
    propertyType: {
      // Khách sạn, Resort, Homestay, Villa...
      type: String,
      enum: ["HOTEL", "RESORT", "VILLA", "HOMESTAY", "APARTMENT"],
      default: "HOTEL",
    },
    starRating: {
      // Hạng sao (1-5)
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    // 2. LIÊN HỆ & KẾT NỐI
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      // Link website gốc của khách sạn (nếu có)
      type: String,
      trim: true,
    },

    // 3. VỊ TRÍ & BẢN ĐỒ (Geospatial)
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    zipCode: { type: String, trim: true },

    // Tọa độ chuẩn GeoJSON để tích hợp với Leaflet map
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [Kinh độ (Longitude), Vĩ độ (Latitude)] - Lưu ý thứ tự này của MongoDB
        required: true,
        default: [0, 0],
      },
    },

    // 4. MEDIA (Hình ảnh & Video)
    thumbnail: {
      // Ảnh đại diện chính
      type: String,
      default: "",
    },
    gallery: {
      // Danh sách ảnh chi tiết (Lưu URL)
      type: [String],
      default: [],
    },
    videos: {
      // Danh sách link video (Youtube, hoặc link MP4)
      type: [String],
      default: [],
    },
    documents: {
      // Các giấy tờ (GPKD, PCCC...) - Lưu URL file PDF
      type: [String],
      default: [],
    },

    // 5. TIỆN ÍCH & CHÍNH SÁCH
    amenities: {
      // Mảng các tiện ích: ["WIFI", "POOL", "GYM", "SPA", "PARKING"]
      type: [String],
      default: [],
    },
    checkInTime: {
      // Giờ nhận phòng (VD: "14:00")
      type: String,
      default: "14:00",
    },
    checkOutTime: {
      // Giờ trả phòng (VD: "12:00")
      type: String,
      default: "12:00",
    },

    // 6. TRẠNG THÁI
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "ACTIVE", "REJECTED", "SUSPENDED"],
      default: "DRAFT",
      required: true,
    },
  },
  { timestamps: true },
);

// Tạo index 2dsphere cho trường location để hỗ trợ tìm kiếm theo bán kính địa lý
HotelSchema.index({ location: "2dsphere" });

export const Hotel = models.Hotel || model("Hotel", HotelSchema);
