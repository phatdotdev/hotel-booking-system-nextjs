import { Schema, model, models } from "mongoose";

const PartnerSchema = new Schema(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    partnerType: {
      type: String,
      enum: ["INDIVIDUAL", "BUSINESS"],
      default: "INDIVIDUAL",
      required: true,
    },

    businessName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Business name cannot exceed 200 characters."],
    },

    representativeName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "Representative name cannot exceed 100 characters."],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Phone number cannot exceed 20 characters."],
    },

    // Địa chỉ kinh doanh của đối tác
    country: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "Country cannot exceed 100 characters."],
    },

    city: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "City cannot exceed 100 characters."],
    },

    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: [255, "Address cannot exceed 255 characters."],
    },

    // Trạng thái hoàn thành hồ sơ
    onboardingStatus: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
      required: true,
    },

    // Trạng thái hoạt động của đối tác
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED"],
      default: "PENDING",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Partner = models.Partner || model("Partner", PartnerSchema);
