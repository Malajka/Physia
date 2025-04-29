import { useState } from "react";

interface PasswordFieldProps {
  id: string;
  name?: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export const PasswordField = (props: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [localValue, setLocalValue] = useState(props.value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    props.onChange?.(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const showError = touched && props.error;

  return (
    <div className="mb-4">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
        {props.label}{props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={props.id}
          name={props.name || props.id}
          type={showPassword ? "text" : "password"}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={props.placeholder}
          required={props.required}
          className={`w-full p-2 border rounded focus:ring-2 focus:outline-none ${
            showError 
              ? "border-red-300 focus:ring-red-200" 
              : "border-gray-300 focus:ring-blue-200"
          }`}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <span className="text-xs">Hide</span>
          ) : (
            <span className="text-xs">Show</span>
          )}
        </button>
      </div>
      {showError && (
        <p className="mt-1 text-sm text-red-600">{props.error}</p>
      )}
    </div>
  );
}; 