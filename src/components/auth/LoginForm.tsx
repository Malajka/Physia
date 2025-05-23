import { AuthForm } from "@/components/auth/AuthForm";
import { PasswordField } from "@/components/auth/PasswordField";
import { InputField } from "@/components/ui/InputField";
import { LinkButton } from "@/components/ui/LinkButton";
import type { AuthFormSubmitResult } from "@/lib/hooks/useAuthForm";
import { login } from "@/lib/services/auth";
import React, { useCallback } from "react";
import { z } from "zod";

// Validation schema for login
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  initialError?: string | null;
}

export const LoginForm = React.memo(function LoginForm({ initialError = null }: LoginFormProps) {
  const handleSubmit = useCallback(async (formData: FormData): Promise<AuthFormSubmitResult> => {
    const values = {
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
    };
    const parseResult = loginSchema.safeParse(values);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors.map((e) => e.message).join(", ") };
    }
    // Use auth service for login
    const result = await login(parseResult.data);
    if (!result.success) {
      return result;
    }
    window.location.href = "/sessions";
    return result;
  }, []);

  return (
    <AuthForm title="Log In" onSubmit={handleSubmit} submitText="Log In" submitTestId="login-submit" errors={initialError}>
      <InputField
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="your@email.com"
        required
        data-testid="email"
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Your password"
        required
        data-testid="password"
      />
      <div className="flex justify-end mt-2 mb-4">
        <LinkButton variant="text" href="/forgot-password" className="text-sm">
          Forgot password?
        </LinkButton>
      </div>
    </AuthForm>
  );
});

LoginForm.displayName = "LoginForm";
