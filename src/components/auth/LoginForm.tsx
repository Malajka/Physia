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
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  initialError?: string | null;
}

export const LoginForm = React.memo(function LoginForm({ initialError = null }: LoginFormProps) {
  const [errors, setErrors] = useState<string[] | string | null>(initialError);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = useCallback(async (formData: FormData): Promise<AuthFormSubmitResult> => {
    const values = {
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
    };
    const parseResult = loginSchema.safeParse(values);
    if (!parseResult.success) {
      const errs = parseResult.error.errors.map((e) => e.message);
      setErrors([...errs]);
      // Set field errors immediately
      const fieldErrs: { email?: string; password?: string } = {};
      for (const err of parseResult.error.errors) {
        if (err.path[0] === "email") fieldErrs.email = err.message;
        if (err.path[0] === "password") fieldErrs.password = err.message;
      }
      setFieldErrors(fieldErrs);
      return { success: false, error: errs.join(", ") };
    }
    setFieldErrors({});
    // Use auth service for login
    const result = await login(parseResult.data);
    if (!result.success) {
      setErrors(result.error ?? null);
      return result;
    }
    window.location.href = "/sessions";
    return result;
  }, []);

  // Reset field errors when input changes
  const handleEmailChange = useCallback(() => {
    setFieldErrors((prev) => ({ ...prev, email: undefined }));
  }, []);
  const handlePasswordChange = useCallback(() => {
    setFieldErrors((prev) => ({ ...prev, password: undefined }));
  }, []);

  useEffect(() => {
    // ... existing code ...
  }, [errors]);

  return (
    <AuthForm title="Log In" onSubmit={handleSubmit} submitText="Log In" errors={errors} submitTestId="login-submit">
      <InputField
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="your@email.com"
        required
        data-testid="email"
        error={fieldErrors.email}
        onChange={handleEmailChange}
        forceShowError={!!fieldErrors.email}
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Your password"
        required
        data-testid="password"
        error={fieldErrors.password}
        onChange={handlePasswordChange}
        forceShowError={!!fieldErrors.password}
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
