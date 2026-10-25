import { ComponentPropsWithoutRef, ReactNode } from "react";

export type BadgeVariant =
  | "brand"
  | "neutral"
  | "gray"
  | "danger"
  | "success"
  | "warning";

export type BadgeSize = "sm" | "md" | "lg";

type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: ReactNode;
  icon?: ReactNode;
  showDot?: boolean;
} & ComponentPropsWithoutRef<"span">;

const variantStyles: Record<BadgeVariant, string> = {
  brand: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

const dotStyles: Record<BadgeVariant, string> = {
  brand: "bg-blue-600 dark:bg-blue-400",
  neutral: "bg-slate-600 dark:bg-slate-400",
  gray: "bg-gray-500 dark:bg-gray-400",
  danger: "bg-red-600 dark:bg-red-400",
  success: "bg-emerald-600 dark:bg-emerald-400",
  warning: "bg-amber-600 dark:bg-amber-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5 rounded",
  md: "text-xs px-2.5 py-1 rounded-md",
  lg: "text-sm px-3 py-1.5 rounded-lg",
};

export default function Badge({
  variant = "brand",
  size = "sm",
  children,
  icon,
  showDot = false,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium leading-none w-fit ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`}
          aria-hidden="true"
        />
      )}

      {icon && <span className="inline-flex shrink-0">{icon}</span>}

      {children}
    </span>
  );
}
