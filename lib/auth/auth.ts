import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { User } from "@/models/User";
import { connectDB } from "../data/mongoose";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Email and Password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();

        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({ email }).select("+passwordHash");

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        if (!user.passwordHash) {
          throw new Error("NO_PASSWORD");
        }

        if (!user.isActive) {
          throw new Error("ACCOUNT_DISABLED");
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        // Không trả passwordHash về NextAuth.
        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          image: user.avatar ?? null,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return profile?.email_verified === true;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "credentials") {
        token.userId = user.id;
        token.role = user.role;
      }

      if (account?.provider === "google" && user.email) {
        await connectDB();

        const email = user.email.toLowerCase();
        const googleId = account.providerAccountId;

        let dbUser = await User.findOne({ googleId });

        if (!dbUser) {
          dbUser = await User.findOne({ email });

          if (dbUser) {
            if (dbUser.googleId && dbUser.googleId !== googleId) {
              throw new Error("Google account is already linked");
            }

            dbUser.googleId = googleId;

            if (!dbUser.avatar && user.image) {
              dbUser.avatar = user.image;
            }

            await dbUser.save();
          } else {
            dbUser = await User.create({
              fullName: user.name || email.split("@")[0],
              email,
              googleId,
              avatar: user.image ?? null,
              role: "CUSTOMER",
              isActive: true,
              passwordHash: null,
            });
          }
        }

        if (!dbUser.isActive) {
          throw new Error("Account is disabled");
        }

        token.userId = dbUser._id.toString();
        token.role = dbUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      console.log(`Session, token is ${token}`);
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }

      session.userId = token.userId as string;

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
