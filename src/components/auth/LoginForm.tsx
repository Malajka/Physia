import { useState } from "react";
import { z } from "zod";
import { AuthForm } from "./AuthForm";
import { InputField } from "./InputField";
import { PasswordField } from "./PasswordField";

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  initialError?: string | null;
}

export const LoginForm = ({ initialError = null }: LoginFormProps) => {
  const [errors, setErrors] = useState<string[] | string | null>(initialError);

  // Handler for form submission
  const handleSubmit = async (formData: FormData) => {
    try {
      const parsedData = loginSchema.parse({
        email: formData.get("email"),
        password: formData.get("password"),
      });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      // Redirect to sessions page on success
      window.location.href = "/sessions";
      return { success: true, error: "" };
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(err.errors.map((e) => e.message));
        return { success: false, error: err.errors.map((e) => e.message).join(", ") };
      }
      if (err instanceof Error) {
        setErrors(err.message);
        return { success: false, error: err.message };
      }
      setErrors("An unexpected error occurred");
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  return (
    <AuthForm title="Log In" onSubmit={handleSubmit} submitText="Log In" errors={errors}>
      <InputField id="email" name="email" label="Email" type="email" placeholder="your@email.com" required />

      <PasswordField id="password" name="password" label="Password" placeholder="Your password" required />

      <div className="flex justify-end mt-2 mb-4">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
          Forgot password?
        </a>
      </div>
    </AuthForm>
  );
};
