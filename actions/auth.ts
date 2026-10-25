"use server";

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { createSession, deleteSession } from "@/lib/session";

// REGISTER
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

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;

    // Validate data
    if (!fullName || !email || !password) {
      return {
        success: false,
        message: "Please fill in all required fields!",
        fields: { fullName, email, phone },
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Password must contain at least 6 characters!",
      };
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { success: false, message: "This email has already been used!" };
    }

    // Encrypt password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create New User
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || "",
      role: "CUSTOMER",
    });

    await createSession({
      userId: newUser._id.toString(),
      role: newUser.role,
      fullName: newUser.fullName,
    });

    return { success: true, message: "Registration successful." };
  } catch (error: any) {
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
