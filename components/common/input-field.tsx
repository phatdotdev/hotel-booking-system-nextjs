import { ComponentPropsWithoutRef } from "react";

type InputFieldProps = {
  label?: string;
  error?: string;
} & ComponentPropsWithoutRef<"input">;

export default function InputField({
  label,
  id,
  type = "text",
  className = "",
  error,
  disabled,
  ...props
}: InputFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          block h-10 w-full rounded-lg border
          bg-background px-3 text-sm text-foreground
          shadow-sm
          placeholder:text-muted-foreground
          transition-all duration-200

          ${
            error
              ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
              : "border-border hover:border-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
          }

          focus:outline-none

          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:bg-muted

          ${className}
        `}
        {...props}
      />

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
