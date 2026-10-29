"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const sizeStyles = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const svgSizes = {
  xs: "w-6 h-6 left-0",
  sm: "w-8 h-8 left-0",
  md: "w-10 h-10 left-0",
  lg: "w-12 h-12 left-0",
};

const imageSizes = {
  xs: "24px",
  sm: "32px",
  md: "40px",
  lg: "48px",
};

export default function Avatar({
  src,
  alt = "User avatar",
  size = "md",
  className = "",
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showFallback = !src || hasError;

  return (
    <div
      className={`bg-gray-100 relative overflow-hidden rounded-full shrink-0 bg-neutral-secondary-medium ${sizeStyles[size]} ${className}`}
    >
      {showFallback ? (
        <svg
          className={`absolute text-body-subtle ${svgSizes[size]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={imageSizes[size]}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
