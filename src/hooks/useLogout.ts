import { logoutUser } from "@/lib/services/auth";
import { useCallback, useState } from "react";

export interface UseLogoutReturn {
  isLoggingOut: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

export const useLogout = (): UseLogoutReturn => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      const result = await logoutUser();

      if (!result.success && result.error) {
        setError(result.error);
        window.alert(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error during logout";
      setError(errorMessage);
      window.alert(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  return {
    isLoggingOut,
    error,
    logout,
  };
};
