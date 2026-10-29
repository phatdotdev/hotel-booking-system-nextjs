"use client";
import { LogIn, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "./google-login-button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import InputField from "@/components/common/input-field";
import Badge from "../../register/components/badge";
import Button from "../../register/components/button";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "NO_PASSWORD":
        return "This account was created via Google. Please set up a password first.";
      case "ACCOUNT_DISABLED":
      case "UserDisabled":
        return "Your account has been disabled. Please contact support.";
      case "OAuthAccountNotLinked":
        return "This email is linked with another login method.";
      case "CredentialsSignin":
        return "Invalid email or password.";
      default:
        return errorCode || "Invalid email or password.";
    }
  };

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });
      if (!result || result.error) {
        if (result?.error === "NO_PASSWORD") {
          router.push(`/set-password?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(getErrorMessage(result?.error || ""));
        setLoading(false);
        return;
      }
      window.location.assign(result.url ?? "/dashboard");
    } catch (error) {}
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-6 sm:p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm bg-white dark:bg-gray-900 space-y-4"
    >
      {/* Header */}
      <div className="text-center space-y-1 mb-6">
        <h2 className="inline-flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Shield className="w-6 h-6 text-blue-600" />
          Sign In
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Please enter your details
        </p>
      </div>

      {/* Inputs */}

      <InputField
        label="Email"
        id="email"
        name="email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        required
      />

      <InputField
        label="Password"
        id="password"
        name="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      {error && (
        <div className="mt-4">
          <Badge
            variant="danger"
            children={error}
            className="block w-full h-6"
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full cursor-pointer mt-4 py-2.5 font-semibold"
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>

      <GoogleLoginButton />
    </form>
  );
}
