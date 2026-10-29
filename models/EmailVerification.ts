import mongoose, { Schema, models, model } from "mongoose";

export interface IEmailVerification {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  verifiedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otpHash: {
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
  model<IEmailVerification>("EmailVerification", EmailVerificationSchema);

export default EmailVerification;
