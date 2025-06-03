import { useCallback, useState, type FormEvent } from "react";

export interface AuthFormSubmitResult {
  success: boolean;
  error?: string;
}

/**
 * useAuthForm handles form submission, loading state, and error management.
 * @param onSubmit - async function to process FormData and return a result.
 * @param initialErrors - optional initial errors to display.
 */
export function useAuthForm(onSubmit: (formData: FormData) => Promise<AuthFormSubmitResult>, initialErrors: string[] | string | null = null) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[] | string | null>(initialErrors);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
    },
    [onSubmit]
  );

  return { loading, errors, handleSubmit };
}
