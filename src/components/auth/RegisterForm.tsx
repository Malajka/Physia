import { useState } from "react";
import { z } from "zod";
import { AuthForm } from "./AuthForm";
import { InputField } from "./InputField";
import { PasswordField } from "./PasswordField";

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  passwordConfirm: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

interface RegisterFormProps {
  initialError?: string | null;
}

export const RegisterForm = ({ initialError = null }: RegisterFormProps) => {
  const [errors, setErrors] = useState<string[] | string | null>(initialError);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Handler for form submission
  const handleSubmit = async (formData: FormData) => {
    try {
      const parsedData = registerSchema.parse({
        email: formData.get("email"),
        password: formData.get("password"),
        passwordConfirm: formData.get("passwordConfirm"),
      });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parsedData.email,
          password: parsedData.password,
        }),
      });

      // Read the response error data
      const responseData = await response.json();
      
      if (!response.ok) {
        // Special handling for email already exists error
        if (response.status === 409) {
          throw new Error(`This email is already registered. Would you like to <a href="/login" class="text-blue-600 hover:underline">log in</a> instead?`);
        }
        throw new Error(responseData.error || "Registration failed");
      }

      // Show success message
      setRegistrationSuccess(true);
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

  if (registrationSuccess) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <p className="text-green-800 mb-4">
            <strong>Thank you for registering!</strong>
          </p>
          <p className="text-green-700 mb-4">
            A confirmation email has been sent to your email address. Please check your inbox 
            and click the verification link to activate your account.
          </p>
          <p className="text-green-700 mb-2">
            If you don't see the email, please check your spam folder.
          </p>
        </div>
        <a href="/login" className="text-blue-600 hover:underline">
          Go to login page
        </a>
      </div>
    );
  }

  return (
    <AuthForm title="Create Account" onSubmit={handleSubmit} submitText="Register" errors={errors}>
      <InputField
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="your@email.com"
        required
      />

      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Min. 8 characters"
        required
      />

      <PasswordField
        id="passwordConfirm"
        name="passwordConfirm"
        label="Confirm Password"
        placeholder="Confirm your password"
        required
      />

      <p className="text-sm text-gray-600 mt-2">
        Password must be at least 8 characters long.
      </p>
    </AuthForm>
  );
}; 