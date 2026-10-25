"use client";

import { registerAction } from "@/actions/auth";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import InputField from "../common/input-field";
import Button from "../common/button";
import Badge from "../common/badge";

export default function RegisterForm() {
  const router = useRouter();
  const [isPendingTransition, startTransition] = useTransition();

  const [state, formAction, isPendingAction] = useActionState(
    registerAction,
    null,
  );

  const isSubmitting = isPendingAction || isPendingTransition;

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-6 sm:p-8 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-900 space-y-4"
    >
      {/* Header */}
      <div className="text-center space-y-1 mb-6">
        <h2 className="inline-flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <UserPlus className="w-6 h-6 text-blue-600" />
          Sign Up
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create an account to get started
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <InputField
          label="Full Name"
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          required
        />

        <InputField
          label="Email"
          id="email"
          name="email"
          type="email"
          placeholder="user@example.com"
          required
        />

        <InputField
          label="Phone"
          id="phone"
          name="phone"
          type="tel"
          placeholder="0987654321"
        />

        <InputField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      {/* Message Error */}
      {state && !state.success && (
        <Badge
          variant="danger"
          className="w-full justify-center py-2 text-center"
        >
          {state.message}
        </Badge>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer mt-4 py-2.5 font-semibold"
      >
        {isSubmitting ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
