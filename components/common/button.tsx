import { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonProps = {
  children?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
} & ComponentPropsWithoutRef<"button">;

export default function Button({
  children,
  leftIcon,
  rightIcon,
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded ${className}`}
      {...props}
    >
      {leftIcon && (
        <span className="me-1.5 -ms-0.5 inline-flex items-center">
          {leftIcon}
        </span>
      )}

      {children}

      {rightIcon && (
        <span className="ms-1.5 -me-0.5 inline-flex items-center">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
