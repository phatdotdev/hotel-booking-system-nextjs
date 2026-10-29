"use client";

import { Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import {
  sendVerificationAction,
  verifyCodeAction,
  registerUserAction,
} from "@/actions/auth";
import Badge from "./badge";
import InputField from "@/components/common/input-field";
import Button from "./button";

export default function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // STEP 1: Send verification code
  const [sendState, sendAction, isSending] = useActionState(
    sendVerificationAction,
    null,
  );

  // STEP 2: Verify code
  const [verifyState, verifyAction, isVerifying] = useActionState(
    verifyCodeAction,
    null,
  );

  // STEP 3: Register account
  const [registerState, registerAction, isRegistering] = useActionState(
    registerUserAction,
    null,
  );

  const [isPending, startTransition] = useTransition();

  const isSubmitting = isPending || isSending || isVerifying || isRegistering;

  // Handle result of sending OTP
  useEffect(() => {
    if (!sendState) return;

    if (sendState.success) {
      setErrorMessage("");
      setStep(2);
    } else {
      setErrorMessage(sendState.message);
    }
  }, [sendState]);

  // Handle result of verifying OTP
  useEffect(() => {
    if (!verifyState) return;

    if (verifyState.success) {
      setVerifiedEmail(email);
      setErrorMessage("");
      setStep(3);
    } else {
      setErrorMessage(verifyState.message);
    }
  }, [verifyState, email]);

  // Handle result of registering account
  useEffect(() => {
    if (!registerState) return;

    if (registerState.success) {
      router.push("/login");
      router.refresh();
    } else {
      setErrorMessage(registerState.message);
    }
  }, [registerState, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    if (step === 1) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        setErrorMessage("Please enter your email address.");
        return;
      }

      formData.set("email", normalizedEmail);
      setEmail(normalizedEmail);

      startTransition(() => {
        sendAction(formData);
      });

      return;
    }

    if (step === 2) {
      // Always send the email together with the OTP.
      formData.set("email", email);

      startTransition(() => {
        verifyAction(formData);
      });

      return;
    }

    if (step === 3) {
      // Use the email confirmed by the verification step.
      formData.set("email", verifiedEmail);

      startTransition(() => {
        registerAction(formData);
      });
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;

    setErrorMessage("");

    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

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

      {/* STEP 1: Email */}
      {step === 1 && (
        <div className="space-y-4">
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="user@example.com"
            required
          />
        </div>
      )}

      {/* STEP 2: OTP */}
      {step === 2 && (
        <div className="space-y-4">
          <input type="hidden" name="email" value={email} />

          <InputField
            label="Verification Code"
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit code"
            required
          />

          <p className="text-xs text-gray-500">
            Please check your inbox and enter the verification code.
          </p>
        </div>
      )}

      {/* STEP 3: Account information */}
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
          />

          <p className="text-xs text-green-600">
            Email verified: {verifiedEmail}
          </p>
        </div>
      )}

      {/* Success notification */}
      {step === 2 && sendState?.success && (
        <Badge
          variant="success"
          className="w-full justify-center py-2 text-center"
        >
          {sendState.message}
        </Badge>
      )}

      {step === 3 && verifyState?.success && (
        <Badge
          variant="success"
          className="w-full justify-center py-2 text-center"
        >
          {verifyState.message}
        </Badge>
      )}

      {/* Error notification */}
      {errorMessage && (
        <Badge
          variant="danger"
          className="w-full justify-center py-2 text-center"
        >
          {errorMessage}
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
