"use server";

import { createHash, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

import { User } from "@/models/User";
import { connectDB } from "@/lib/data/mongoose";
import EmailVerification from "@/models/EmailVerification";
import { sendVerificationEmail } from "@/lib/email/mailer";

type ActionState = {
  success: boolean;
  message: string;
} | null;

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const VERIFIED_TTL_MS = 15 * 60 * 1000;

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function isValidEmail(email: string) {
  return email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ======================================================
// STEP 1: SEND OTP
// ======================================================

export async function sendVerificationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = normalizeEmail(formData.get("email"));

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  try {
    await connectDB();

    const existingUser = await User.findOne({ email }).select("_id").lean();

    if (existingUser) {
      return {
        success: false,
        message: "Unable to register with this email address.",
      };
    }

    const existingVerification = await EmailVerification.findOne({ email });

    if (
      existingVerification?.updatedAt &&
      Date.now() - new Date(existingVerification.updatedAt).getTime() <
        RESEND_COOLDOWN_MS
    ) {
      return {
        success: false,
        message: "Please wait 60 seconds before requesting another code.",
      };
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

    const otpHash = hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await EmailVerification.findOneAndUpdate(
      { email },
      {
        $set: {
          email: email,
          otpHash,
          expiresAt,
          attempts: 0,
          verifiedAt: null,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    try {
      await sendVerificationEmail(email, code);
    } catch (error) {
      // Chỉ xóa OTP vừa tạo, không xóa OTP mới hơn.
      await EmailVerification.deleteOne({ email, otpHash });

      console.error("Failed to send verification email:", error);

      return {
        success: false,
        message: "Unable to send verification email. Please try again later.",
      };
    }

    return {
      success: true,
      message: "Verification code sent successfully.",
    };
  } catch (error) {
    console.error("sendVerificationAction error:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}

// ======================================================
// STEP 2: VERIFY OTP
// ======================================================

export async function verifyCodeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = normalizeEmail(formData.get("email"));
  const code = String(formData.get("code") ?? "").trim();

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Invalid email address.",
    };
  }

  if (!/^\d{6}$/.test(code)) {
    return {
      success: false,
      message: "Please enter a valid 6-digit verification code.",
    };
  }

  try {
    await connectDB();

    const verification = await EmailVerification.findOne({ email });

    if (!verification) {
      return {
        success: false,
        message:
          "Verification code is invalid or expired. Please request a new code.",
      };
    }

    if (verification.verifiedAt) {
      return {
        success: true,
        message: "Email has already been verified.",
      };
    }

    if (verification.expiresAt.getTime() <= Date.now()) {
      return {
        success: false,
        message: "Verification code has expired. Please request a new code.",
      };
    }

    if (verification.attempts >= MAX_OTP_ATTEMPTS) {
      return {
        success: false,
        message: "Too many incorrect attempts. Please request a new code.",
      };
    }

    const otpHash = hashCode(code);

    if (otpHash !== verification.otpHash) {
      await EmailVerification.updateOne(
        {
          _id: verification._id,
          verifiedAt: null,
          expiresAt: { $gt: new Date() },
          attempts: { $lt: MAX_OTP_ATTEMPTS },
        },
        {
          $inc: { attempts: 1 },
        },
      );

      return {
        success: false,
        message: "Incorrect verification code.",
      };
    }

    // Cập nhật có điều kiện để không xác minh một OTP đã hết hạn
    // hoặc đã bị thay thế bởi một mã mới.
    const verified = await EmailVerification.findOneAndUpdate(
      {
        _id: verification._id,
        otpHash,
        verifiedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: MAX_OTP_ATTEMPTS },
      },
      {
        $set: {
          verifiedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );

    if (!verified) {
      return {
        success: false,
        message: "Verification code is invalid or expired. Please try again.",
      };
    }

    return {
      success: true,
      message: "Email verified successfully.",
    };
  } catch (error) {
    console.error("verifyCodeAction error:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}

// ======================================================
// STEP 3: REGISTER USER
// ======================================================

export async function registerUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = normalizeEmail(formData.get("email"));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Invalid email address.",
    };
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return {
      success: false,
      message: "Full name must be between 2 and 100 characters.",
    };
  }

  if (phone.length > 20) {
    return {
      success: false,
      message: "Phone number cannot exceed 20 characters.",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must contain at least 6 characters.",
    };
  }

  if (password.length > 72) {
    return {
      success: false,
      message: "Password is too long.",
    };
  }

  try {
    await connectDB();

    // Không được tin email từ hidden input.
    // Kiểm tra lại trạng thái xác minh trong database.
    const verification = await EmailVerification.findOne({
      email,
      verifiedAt: {
        $gte: new Date(Date.now() - VERIFIED_TTL_MS),
      },
    }).lean();

    if (!verification) {
      return {
        success: false,
        message: "Please verify your email before creating an account.",
      };
    }

    const existingUser = await User.findOne({ email }).select("_id").lean();

    if (existingUser) {
      return {
        success: false,
        message: "Unable to create an account with this email address.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      authProvider: "LOCAL",
      role: "CUSTOMER",
      isActive: true,
    });

    // Xóa trạng thái xác minh sau khi tạo tài khoản thành công.
    await EmailVerification.deleteOne({
      _id: verification._id,
      verifiedAt: verification.verifiedAt,
    });

    return {
      success: true,
      message: "Account created successfully.",
    };
  } catch (error) {
    // Xử lý trường hợp hai request cùng đăng ký một email.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        success: false,
        message: "Unable to create an account with this email address.",
      };
    }

    console.error("registerUserAction error:", error);

    return {
      success: false,
      message: "Unable to create your account. Please try again later.",
    };
  }
}
