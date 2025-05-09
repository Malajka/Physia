import { AuthForm } from "@/components/auth/AuthForm";
import { PasswordField } from "@/components/auth/PasswordField";
import { InputField } from "@/components/ui/InputField";
import { LinkButton } from "@/components/ui/LinkButton";
import type { AuthFormSubmitResult } from "@/lib/hooks/useAuthForm";
import { login } from "@/lib/services/auth";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  initialError?: string | null;
}

export const LoginForm = React.memo(function LoginForm({ initialError = null }: LoginFormProps) {
  const [errors, setErrors] = useState<string[] | string | null>(initialError);

  const handleSubmit = useCallback(async (formData: FormData): Promise<AuthFormSubmitResult> => {
    console.log("handleSubmit called");
    const values = {
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
    };
    const parseResult = loginSchema.safeParse(values);
    console.log("parseResult:", parseResult);
    if (!parseResult.success) {
      const errs = parseResult.error.errors.map((e) => e.message);
      setErrors([...errs]);
      return { success: false, error: errs.join(", ") };
    }
    // Use auth service for login
    const result = await login(parseResult.data);
    if (!result.success) {
      // Ensure error is string or null
      setErrors(result.error ?? null);
      return result;
    }
    // Redirect on success
    window.location.href = "/sessions";
    return result;
  }, []);

  useEffect(() => {
    console.log("LoginForm errors state:", errors);
  }, [errors]);

  return (
    <AuthForm title="Log In" onSubmit={handleSubmit} submitText="Log In" errors={errors}>
      <InputField id="email" name="email" label="Email" type="email" placeholder="your@email.com" required data-test-id="email" />

      <PasswordField id="password" name="password" label="Password" placeholder="Your password" required data-test-id="password" />

      <div className="flex justify-end mt-2 mb-4">
        <LinkButton variant="text" href="/forgot-password" className="text-sm">
          Forgot password?
        </LinkButton>
      </div>
    </AuthForm>
  );
});

LoginForm.displayName = "LoginForm";
