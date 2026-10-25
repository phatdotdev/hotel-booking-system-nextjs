"use client";

import { signIn } from "next-auth/react";

export default function GoogleLoginButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signIn("google", {
          callbackUrl: "/dashboard",
        })
      }
    >
      Sign in with Google
    </button>
  );
}
