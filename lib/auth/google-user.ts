import { User } from "@/models/User";
import { connectToDatabase } from "../data/mongoose";

type GoogleProfile = {
  sub: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  email_verified?: boolean;
};

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  await connectToDatabase();

  // 1. Kiểm tra email Google
  if (!profile.email || profile.email_verified !== true) {
    throw new Error("Google email is not verified");
  }

  const email = profile.email.toLowerCase();
  const googleId = profile.sub;

  // 2. Tìm tài khoản đã liên kết Google
  const googleUser = await User.findOne({
    googleId,
  });

  if (googleUser) {
    // Google ID đã liên kết với tài khoản
    return googleUser;
  }

  // 3. Tìm tài khoản đã đăng ký bằng email/password
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    // Nếu email đã có tài khoản nhưng Google ID
    // đang thuộc tài khoản khác thì không cho liên kết
    if (existingUser.googleId && existingUser.googleId !== googleId) {
      throw new Error("This email is already linked to another Google account");
    }

    // Liên kết Google vào tài khoản email/password cũ
    existingUser.googleId = googleId;

    // Cập nhật ảnh nếu tài khoản chưa có ảnh
    if (!existingUser.image && profile.picture) {
      existingUser.image = profile.picture;
    }

    await existingUser.save();

    // Trả về tài khoản cũ
    return existingUser;
  }

  // 4. Chưa có tài khoản thì tạo tài khoản mới
  const newUser = await User.create({
    fullName: profile.name || email.split("@")[0],

    email,

    googleId,

    image: profile.picture || "",

    role: "CUSTOMER",

    emailVerified: true,
  });

  return newUser;
}
