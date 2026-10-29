"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import InputField from "@/components/common/input-field";
import Button from "@/components/common/button";
import Badge from "@/components/common/badge";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please provide a valid email address.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to set password.");
        setLoading(false);
        return;
      }

      setSuccess("Password set successfully! Redirecting to login...");
      setLoading(false);

      // Tự động chuyển hướng về trang đăng nhập sau 2 giây
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-6 sm:p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm bg-white dark:bg-gray-900 space-y-4"
    >
      {/* Header */}
      <div className="text-center space-y-1 mb-6">
        <h2 className="inline-flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Lock className="w-6 h-6 text-blue-600" />
          Set Your Password
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a password to sign in using your email next time
        </p>
      </div>

      {/* Inputs */}
      <InputField
        label="Email Address"
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        required
      />

      <InputField
        label="New Password"
        id="newPassword"
        name="newPassword"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="At least 6 characters"
        required
      />

      <InputField
        label="Confirm New Password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your password"
        required
      />

      {/* Alerts */}
      {error && (
        <div className="mt-4">
          <Badge
            variant="danger"
            className="block w-full py-1.5 px-3 text-center text-sm font-medium"
          >
            {error}
          </Badge>
        </div>
      )}

      {success && (
        <div className="mt-4">
          <Badge
            variant="success"
            className="block w-full py-1.5 px-3 text-center text-sm font-medium bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
          >
            <div className="inline-flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {success}
            </div>
          </Badge>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !!success}
        className="w-full cursor-pointer mt-4 py-2.5 font-semibold disabled:opacity-50"
      >
        {loading ? "Updating password..." : "Set Password"}
      </Button>

      {/* Back link */}
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="h-[60vh] flex items-center justify-center p-4">
      <Suspense
        fallback={<div className="text-sm text-gray-500">Loading form...</div>}
      >
        <SetPasswordForm />
      </Suspense>
    </div>
  );
}
