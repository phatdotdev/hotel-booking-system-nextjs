import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    // Personal Information
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters."],
      maxlength: [100, "Full name cannot exceed 100 characters."],
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [255, "Email cannot exceed 255 characters."],
    },

    passwordHash: {
      type: String,
      default: null,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Phone number cannot exceed 20 characters."],
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", ""],
      default: "",
    },

    googleId: {
      type: String,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    // Address Information
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

    // Account Information
    role: {
      type: String,
      enum: ["ADMIN", "HOTEL_OWNER", "STAFF", "CUSTOMER"],
      default: "CUSTOMER",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });

export const User = models.User || model("User", UserSchema);
