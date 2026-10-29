"use client";

import { LoaderCircle } from "lucide-react";

type LoadingOverlayProps = {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
};

export default function LoadingOverlay({
  isLoading,
  message = "Đang xử lý...",
  fullScreen = false,
  className = "",
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={[
        "z-50 flex items-center justify-center",
        "bg-white/70 backdrop-blur-[2px]",
        fullScreen ? "fixed inset-0" : "absolute inset-0",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-7 py-6 shadow-lg">
        <LoaderCircle
          size={38}
          strokeWidth={2.5}
          className="animate-spin text-blue-600"
          aria-hidden="true"
        />

        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}
