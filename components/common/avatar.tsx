"use client";

import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
};

export default function Avatar({
  src,
  alt = "Avatar",
  size = 40,
  className = "",
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const showImage = Boolean(src) && !hasError;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-500 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <UserRound
          size={Math.round(size * 0.55)}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
