"use server";

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/data/mongoose";
import { User } from "@/models/User";
import EmailVerification from "@/models/EmailVerification";
import { createSession, deleteSession } from "@/lib/auth/session";
import { createHash, randomInt } from "crypto";
import { sendVerificationEmail } from "@/lib/email/mailer";

// REGISTER

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateOTP() {
  return randomInt(100000, 1000000).toString();
}

function hashOTP(email: string, code: string) {
  return createHash("sha256").update(`${email}:${code}`).digest("hex");
}

export interface SendVerificationState {
  success: boolean;
  message: string;
}

export async function sendVerificationAction(
  prevState: SendVerificationState | null,
  formData: FormData,
): Promise<SendVerificationState> {
  try {
    await connectToDatabase();

    const email = normalizeEmail(String(formData.get("email") || ""));

    if (!email) {
      return {
        success: false,
        message: "Please enter your email!",
      };
    }

    // Kiểm tra email đã đăng ký
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        success: false,
        message: "This email has already been used!",
      };
    }

    // Tạo OTP
    const code = generateOTP();

    const codeHash = hashOTP(email, code);

    // OTP hết hạn sau 5 phút
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Lưu OTP vào MongoDB
    await EmailVerification.findOneAndUpdate(
      { email },
      {
        $set: {
          codeHash,
          expiresAt,
          attempts: 0,
          verifiedAt: null,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    // Gửi email
    await sendVerificationEmail(email, code);

    return {
      success: true,
      message: "Verification code sent successfully!",
    };
  } catch (error) {
    console.error("Send verification error:", error);

    return {
      success: false,
      message: "Unable to send verification code!",
    };
  }
}

export interface VerifyEmailState {
  success: boolean;
  message: string;
}

export async function verifyEmailAction(
  prevState: VerifyEmailState | null,
  formData: FormData,
): Promise<VerifyEmailState> {
  try {
    await connectToDatabase();

    const email = normalizeEmail(String(formData.get("email") || ""));

    const code = String(formData.get("code") || "").trim();

    if (!email || !code) {
      return {
        success: false,
        message: "Please enter email and verification code!",
      };
    }

    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: "Invalid verification code!",
      };
    }

    const verification = await EmailVerification.findOne({ email });

    if (!verification) {
      return {
        success: false,
        message: "Verification code not found!",
      };
    }

    // Kiểm tra hết hạn
    if (verification.expiresAt <= new Date()) {
      await EmailVerification.deleteOne({ email });

      return {
        success: false,
        message: "Verification code has expired!",
      };
    }

    // Giới hạn số lần nhập sai
    if (verification.attempts >= 5) {
      await EmailVerification.deleteOne({ email });

      return {
        success: false,
        message: "Too many attempts. Request a new code!",
      };
    }

    const inputHash = hashOTP(email, code);

    // So sánh OTP
    if (inputHash !== verification.codeHash) {
      await EmailVerification.updateOne(
        {
          _id: verification._id,
          attempts: verification.attempts,
        },
        {
          $inc: {
            attempts: 1,
          },
        },
      );

      return {
        success: false,
        message: "Incorrect verification code!",
      };
    }

    // Đánh dấu email đã xác minh
    await EmailVerification.updateOne(
      {
        _id: verification._id,
        codeHash: inputHash,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          verifiedAt: new Date(),
        },
      },
    );

    return {
      success: true,
      message: "Email verified successfully!",
    };
  } catch (error) {
    console.error("Verify email error:", error);

    return {
      success: false,
      message: "Unable to verify email!",
    };
  }
}

export interface RegisterState {
  success: boolean;
  message: string;

  fields?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export async function registerAction(
  prevState: RegisterState | null,
  formData: FormData,
): Promise<RegisterState> {
  try {
    await connectToDatabase();

    const fullName = String(formData.get("fullName") || "").trim();

    const email = normalizeEmail(String(formData.get("email") || ""));

    const password = String(formData.get("password") || "");

    const phone = String(formData.get("phone") || "").trim();

    const fields = {
      fullName,
      email,
      phone,
    };

    // Validate data
    if (!fullName || !email || !password) {
      return {
        success: false,
        message: "Please fill in all required fields!",
        fields,
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Password must contain at least 6 characters!",
        fields,
      };
    }

    // Check email verification
    const verification = await EmailVerification.findOne({
      email,
    });

    if (
      !verification ||
      !verification.verifiedAt ||
      verification.expiresAt <= new Date()
    ) {
      return {
        success: false,
        message: "Please verify your email first!",
        fields,
      };
    }

    // Check duplicate email
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return {
        success: false,
        message: "This email has already been used!",
        fields,
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      fullName,
      email,
      passwordHash,
      phone,
      role: "CUSTOMER",
    });

    // Remove verification record
    await EmailVerification.deleteOne({
      email,
    });

    // Create session
    await createSession({
      userId: newUser._id.toString(),
      role: newUser.role,
      fullName: newUser.fullName,
    });

    return {
      success: true,
      message: "Registration successful.",
    };
  } catch (error) {
    console.error("Register error:", error);

    return {
      success: false,
      message: "An error occurred during registration!",
    };
  }
}

// LOGIN ACTION
export interface LoginState {
  success: boolean;
  message: string;
}

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  try {
    await connectToDatabase();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        message: "Please enter your email and password",
      };
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });
    if (!user) {
      return { success: false, message: "Incorrect email or password" };
    }

    if (!user.passwordHash) {
      return {
        success: false,
        message: "Please sign in using Google.",
      };
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      return { success: false, message: "Incorrect email or password!" };
    }

    await createSession({
      userId: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
    });

    return { success: true, message: "Login successful" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "A system error occurred during login!",
    };
  }
}

export async function logoutAction() {
  await deleteSession();
  return { success: true, message: "Logged out" };
}
