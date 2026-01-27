import { useState, type FormEvent } from "react";

export interface AuthFormSubmitResult {
  success: boolean;
  error?: string;
}

export function useAuthForm(onSubmit: (formData: FormData) => Promise<AuthFormSubmitResult>, initialErrors: string | null = null) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string | null>(initialErrors);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await onSubmit(formData);

      if (!result.success) {
        setErrors(result.error ?? null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrors(error.message);
      } else {
        setErrors("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, errors, handleSubmit };
}
