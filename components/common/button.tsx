import { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "cn";

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
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        // Layout
        "inline-flex h-9 shrink-0 items-center justify-center",
        "gap-1.5 rounded-lg px-3",

        // Typography
        "text-sm font-medium leading-none whitespace-nowrap",

        // Colors
        "border border-transparent bg-brand text-white",
        "hover:bg-brand-strong",

        // Focus
        "outline-none transition-colors",
        "focus-visible:ring-3 focus-visible:ring-brand-medium",

        // Disabled
        "disabled:pointer-events-none",
        "disabled:cursor-not-allowed disabled:opacity-50",

        className,
      )}
      {...props}
    >
      {leftIcon && (
        <span className="inline-flex shrink-0 items-center">{leftIcon}</span>
      )}

      {children}

      {rightIcon && (
        <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
      )}
    </button>
  );
}
