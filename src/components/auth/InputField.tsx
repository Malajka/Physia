import { useState } from "react";

interface InputFieldProps {
  id: string;
  name?: string;
  label: string;
  type?: "text" | "email" | "number";
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export const InputField = ({
  id,
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  value = "",
  onChange,
  error
}: InputFieldProps) => {
  const [touched, setTouched] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = touched && error;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={`w-full p-2 border rounded focus:ring-2 focus:outline-none ${
          showError 
            ? "border-red-300 focus:ring-red-200" 
            : "border-gray-300 focus:ring-blue-200"
        }`}
      />
      {showError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 