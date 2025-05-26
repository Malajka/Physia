import { AuthForm } from "@/components/auth/AuthForm";
import { PasswordField } from "@/components/auth/PasswordField";
import { register } from "@/lib/services/auth";
import { useCallback, useState } from "react";
import { z } from "zod";
import { InputField } from "../ui/InputField";
import { LinkButton } from "../ui/LinkButton";
// Validation schema for registration
const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    passwordConfirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

interface RegisterFormProps {
  initialError?: string | null;
}

export const RegisterForm = function RegisterForm({ initialError = null }: RegisterFormProps) {
  const [errors, setErrors] = useState<string[] | string | null>(initialError);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = useCallback(async (formData: FormData) => {
    try {
      const parsedData = registerSchema.parse({
        email: formData.get("email"),
        password: formData.get("password"),
        passwordConfirm: formData.get("passwordConfirm"),
      });

      const result = await register({
        email: parsedData.email,
        password: parsedData.password,
      });

      if (!result.success) {
        // Special handling for email already exists error
        if (typeof result.error === "string" && result.error.includes("already registered")) {
          throw new Error(
            `This email is already registered. Would you like to <a href="/login" class="text-blue-600 hover:underline">log in</a> instead?`
          );
        }
        throw new Error(result.error || "Registration failed");
      }

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
  }, []);

  if (registrationSuccess) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <p className="text-green-800 mb-4 text-xl">
            <strong>Thank you for registering!</strong>
          </p>
          <p className="text-green-700 mb-4 text-lg">
            Now you can start creating your own sessions and muscle tests!
          </p>
          <LinkButton href="/body-parts" variant="nav-primary" className="text-lg block w-full " data-testid="create-new-session-link">
                Create First Session
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthForm title="Create Account" onSubmit={handleSubmit} submitText="Register" errors={errors} submitTestId="register-submit">
        <InputField id="email" name="email" label="Email" type="email" placeholder="your@email.com" required data-testid="register-email" />
        <PasswordField id="password" name="password" label="Password" placeholder="Min. 8 characters" required data-testid="register-password" />
        <PasswordField id="passwordConfirm" name="passwordConfirm" label="Confirm Password" placeholder="Confirm your password" required data-testid="register-passwordConfirm" />
        <p className="text-sm text-gray-600 mt-2">Password must be at least 8 characters long.</p>
      </AuthForm>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <LinkButton href="/login" variant="text" className="text-gray-600 underline">
            Log in here
          </LinkButton>
        </p>
      </div>
    </>
  );
};
