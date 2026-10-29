"use client";

import {
  registerAction,
  sendVerificationAction,
  verifyEmailAction,
} from "@/actions/auth";
import { Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import InputField from "../common/input-field";
import Button from "../common/button";
import Badge from "../common/badge";

export default function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [sendState, sendAction, isSending] = useActionState(
    sendVerificationAction,
    null,
  );

  const [verifyState, verifyAction, isVerifying] = useActionState(
    verifyEmailAction,
    null,
  );

  const [registerState, registerActionState, isRegistering] = useActionState(
    registerAction,
    null,
  );

  const [isPendingTransition, startTransition] = useTransition();

  const isSubmitting =
    isPendingTransition || isSending || isVerifying || isRegistering;

  // Send OTP success
  useEffect(() => {
    if (sendState?.success) {
      setStep(2);
    }
  }, [sendState]);

  // Verify OTP success
  useEffect(() => {
    if (verifyState?.success) {
      setVerifiedEmail(email);
      setStep(3);
    }
  }, [verifyState, email]);

  // Register success
  useEffect(() => {
    if (registerState?.success) {
      router.push("/");
      router.refresh();
    }
  }, [registerState, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(() => {
      // STEP 1
      if (step === 1) {
        const inputEmail = String(formData.get("email") || "")
          .trim()
          .toLowerCase();

        setEmail(inputEmail);

        formData.set("email", inputEmail);

        sendAction(formData);

        return;
      }

      // STEP 2
      if (step === 2) {
        formData.set("email", email);

        verifyAction(formData);

        return;
      }

      // STEP 3
      if (step === 3) {
        formData.set("email", verifiedEmail);

        registerActionState(formData);
      }
    });
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const currentError =
    step === 1 ? sendState : step === 2 ? verifyState : registerState;

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-md mx-auto p-6 sm:p-8
        border border-gray-200 dark:border-gray-800
        rounded-xl shadow-sm
        bg-white dark:bg-gray-900
        space-y-4
      "
    >
      {/* Header */}
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h2
          className="
            inline-flex items-center justify-center gap-2
            text-2xl font-bold
            text-gray-900 dark:text-white
          "
        >
          {step === 1 && <Mail className="w-6 h-6 text-blue-600" />}

          {step === 2 && <ShieldCheck className="w-6 h-6 text-blue-600" />}

          {step === 3 && <UserPlus className="w-6 h-6 text-blue-600" />}

          {step === 1
            ? "Verify Email"
            : step === 2
              ? "Email Verification"
              : "Create Account"}
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {step === 1 && "Enter your email to receive a verification code"}

          {step === 2 && `Enter the verification code sent to ${email}`}

          {step === 3 && "Complete your account information"}
        </p>

        {/* Progress */}
        <div className="flex gap-2 pt-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`
                h-1 flex-1 rounded-full
                ${item <= step ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}
              `}
            />
          ))}
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="user@example.com"
            required
          />
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <input type="hidden" name="email" value={email} />

          <InputField
            label="Verification Code"
            id="code"
            name="code"
            type="text"
            placeholder="Enter 6-digit code"
            required
          />

          <p className="text-xs text-gray-500">
            Please check your inbox and enter the verification code.
          </p>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <input type="hidden" name="email" value={verifiedEmail} />

          <InputField
            label="Full Name"
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
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
            placeholder="At least 6 characters"
            required
          />

          <p className="text-xs text-green-600">
            Email verified: {verifiedEmail}
          </p>
        </div>
      )}

      {/* Error */}
      {currentError && !currentError.success && (
        <Badge
          variant="danger"
          className="
            w-full justify-center
            py-2 text-center
          "
        >
          {currentError.message}
        </Badge>
      )}

      {/* Success message */}
      {step === 2 && sendState?.success && (
        <Badge
          variant="success"
          className="
            w-full justify-center
            py-2 text-center
          "
        >
          Verification code sent successfully!
        </Badge>
      )}

      {/* Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full cursor-pointer
            py-2.5 font-semibold
          "
        >
          {isSubmitting
            ? "Please wait..."
            : step === 1
              ? "Send Verification Code"
              : step === 2
                ? "Verify Email"
                : "Create Account"}
        </Button>

        {step > 1 && (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleBack}
            className="w-full"
          >
            Back
          </Button>
        )}
      </div>
    </form>
  );
}
