import { handleRegisterSubmit, type RegisterFormResult } from "@/lib/services/auth";
import { useCallback, useState } from "react";

export interface UseRegisterReturn {
  registrationSuccess: boolean;
  error: string | null;
  isLoading: boolean;
  submitRegistration: (formData: FormData) => Promise<RegisterFormResult>;
  resetForm: () => void;
}

export const useRegister = (): UseRegisterReturn => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitRegistration = useCallback(async (formData: FormData): Promise<RegisterFormResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await handleRegisterSubmit(formData);

      if (result.success && result.registrationSuccess) {
        setRegistrationSuccess(true);
      } else if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error during registration";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setRegistrationSuccess(false);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    registrationSuccess,
    error,
    isLoading,
    submitRegistration,
    resetForm,
  };
};
