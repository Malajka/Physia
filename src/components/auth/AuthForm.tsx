import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAuthForm, type AuthFormSubmitResult } from "@/lib/hooks/useAuthForm";
import React from "react";

interface AuthFormProps {
  title: string;
  onSubmit: (formData: FormData) => Promise<AuthFormSubmitResult | undefined>;
  children: React.ReactNode;
  submitText: string;
  errors?: string[] | string | null;
}

export const AuthForm = React.memo(function AuthForm({ title, onSubmit, children, submitText, errors: initialErrors = null }: AuthFormProps) {
  const { loading, errors, handleSubmit } = useAuthForm(onSubmit, initialErrors);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>

      {errors && <ErrorAlert errors={errors} />}

      <form onSubmit={handleSubmit}>
        {children}
        <div className="mt-6">
          <SubmitButton loading={loading}>{submitText}</SubmitButton>
        </div>
      </form>
    </div>
  );
});

AuthForm.displayName = "AuthForm";
