import { InputField } from "@/components/ui/InputField";
import React, { useCallback, useState } from "react";

interface PasswordFieldProps {
  id: string;
  name?: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  forceShowError?: boolean;
  "data-testid"?: string;
}

export const PasswordField = React.memo(function PasswordField(props: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="relative">
      <InputField {...props} type={showPassword ? "text" : "password"} forceShowError={props.forceShowError} data-testid={props["data-testid"]} />
      <button
        type="button"
        tabIndex={-1}
        onClick={togglePasswordVisibility}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    </div>
  );
});

PasswordField.displayName = "PasswordField";
