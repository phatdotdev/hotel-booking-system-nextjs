import { Schema, model, models } from "mongoose";

const HotelSchema = new Schema(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },

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

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Phone number cannot exceed 20 characters."],
    },

    country: {
      type: String,
      trim: true,
      required: [true, "Country is required."],
      maxlength: [100, "Country cannot exceed 100 characters."],
    },

    city: {
      type: String,
      trim: true,
      required: [true, "City is required."],
      maxlength: [100, "City cannot exceed 100 characters."],
    },

    address: {
      type: String,
      trim: true,
      required: [true, "Hotel address is required."],
      maxlength: [255, "Address cannot exceed 255 characters."],
    },

    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "ACTIVE", "REJECTED"],
      default: "DRAFT",
      required: true,
    },
  },
  { timestamps: true },
);

export const Hotel = models.Hotel || model("Hotel", HotelSchema);
