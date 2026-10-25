"use client";

import { Loader2 } from "lucide-react";
interface LoadingOverlayProps {
  isLoading?: boolean;
  text?: string;
  className?: string;
}

export default function LoadingOverlay({
  text = "Loading...",
  className = "",
}: LoadingOverlayProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[300px]
        bg-background/70 backdrop-blur-sm transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col items-center gap-3 p-4 rounded-xl">
        {/* Spinner Icon */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        {text && (
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
