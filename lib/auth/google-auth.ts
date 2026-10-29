import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { findOrCreateGoogleUser } from "@/lib/auth/google-user";
import { createSession } from "./session";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      try {
        const googleProfile = profile as {
          sub: string;
          name?: string | null;
          email?: string | null;
          picture?: string | null;
          email_verified?: boolean;
        };

        // 1. Kiểm tra email Google
        if (!googleProfile.email || googleProfile.email_verified !== true) {
          return false;
        }

        // 2. Tìm user cũ hoặc tạo user mới
        const user = await findOrCreateGoogleUser(googleProfile);

        if (!user || !user.isActive) {
          return false;
        }

        // 3. Tạo custom session giống email/password
        await createSession({
          userId: user._id.toString(),
          fullName: user.fullName,
          role: user.role,
        });

        // 4. Cho phép đăng nhập
        return true;
      } catch (error) {
        console.error("Google sign-in error:", error);
        return false;
      }
    },
  },
};
