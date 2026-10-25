import { ComponentPropsWithoutRef } from "react";

type InputFieldProps = {
  label?: string;
} & ComponentPropsWithoutRef<"input">;

export default function InputField({
  label,
  id,
  type = "text",
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <div>
      {label && id && (
        <label
          htmlFor={id}
          className="block mb-2 text-sm font-medium text-heading"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2 shadow-xs placeholder:text-body ${className}`}
        {...props}
      />
    </div>
  );
}
