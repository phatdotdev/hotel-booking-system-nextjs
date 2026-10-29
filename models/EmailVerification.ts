import mongoose, { Schema, models, model } from "mongoose";

const EmailVerificationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

EmailVerificationSchema.index({ email: 1 }, { unique: true });

const EmailVerification =
  models.EmailVerification ||
  model("EmailVerification", EmailVerificationSchema);

export default EmailVerification;
