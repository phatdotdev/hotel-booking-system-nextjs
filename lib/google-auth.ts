import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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

  secret:
    process.env.NEXTAUTH_SECRET ||
    "default_super_secret_key_change_me_in_production",

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

        console.log(googleProfile);

        return true;
      } catch (error) {
        console.error("Google sign-in error:", error);

        return false;
      }
    },
  },
};
