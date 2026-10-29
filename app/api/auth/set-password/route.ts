import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { connectDB } from "@/lib/data/mongoose";

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { message: "Email and new password are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 },
      );
    }

    await connectDB();

    const emailClean = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailClean }).select(
      "+passwordHash",
    );

    if (!user) {
      return NextResponse.json(
        { message: "User account not found." },
        { status: 404 },
      );
    }

    if (user.passwordHash) {
      return NextResponse.json(
        {
          message:
            "Password has already been set for this account. Please use 'Forgot Password' instead.",
        },
        { status: 400 },
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.passwordHash = hashedPassword;
    await user.save();

    return NextResponse.json(
      {
        message:
          "Password updated successfully. You can now log in using your password.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 },
    );
  }
}
