import { cn } from "@/lib/utils";
import React, { useCallback, useState, type ChangeEvent } from "react";
import { ErrorAlert } from "./ErrorAlert";

export interface InputFieldProps {
  id: string;
  name?: string;
  label: string;
  type?: "text" | "email" | "number" | "password";
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  "data-testid"?: string;
  forceShowError?: boolean;
}

function InputFieldComponent({
  id,
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  value = "",
  onChange,
  error,
  forceShowError = false,
  ...props
}: InputFieldProps) {
  const [touched, setTouched] = useState(false);
  const errorId = `${id}-error`;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const showError = (touched || forceShowError) && !!error;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        defaultValue={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-invalid={showError}
        aria-describedby={showError ? errorId : undefined}
        className={cn(
          "w-full p-2 border rounded focus:ring-2 focus:outline-none",
          showError ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
        )}
        {...props}
      />
      {showError && <ErrorAlert errors={error} />}
    </div>
  );
}

/** Memoized InputField for performance optimization */
export const InputField = React.memo(InputFieldComponent);
InputField.displayName = "InputField";
