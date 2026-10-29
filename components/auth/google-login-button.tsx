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
      className="
        group
        flex w-full items-center justify-center gap-3
        rounded-lg
        border border-gray-300
        bg-white
        px-4 py-2.5
        text-sm font-semibold
        text-gray-700
        shadow-sm
        transition-all duration-200

        hover:bg-gray-50
        hover:border-gray-400
        hover:shadow-md

        active:scale-[0.98]

        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2

        dark:border-gray-700
        dark:bg-gray-900
        dark:text-gray-200
        dark:hover:bg-gray-800
        dark:hover:border-gray-600
      "
    >
      {/* Google Logo */}
      <svg
        className="h-5 w-5 shrink-0"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
          transform="translate(0 4)"
        />

        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.14-3.09-.4-4.55H24v9.02h12.91c-.58 2.96-2.26 5.48-4.76 7.18l7.27 5.64c4.24-3.91 7.56-9.68 7.56-17.29Z"
        />

        <path
          fill="#FBBC05"
          d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
        />

        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.94-2.13 15.92-5.78l-7.27-5.64c-2.02 1.35-4.6 2.15-8.65 2.15-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
        />
      </svg>

      <span>Continue with Google</span>
    </button>
  );
}
