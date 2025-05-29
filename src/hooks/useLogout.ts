import { logoutUser } from "@/lib/services/auth";
import { useCallback, useState } from "react";

export interface UseLogoutReturn {
  isLoggingOut: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

/**
 * Custom hook for managing logout state and process
 * @returns Object with logout state and logout function
 */
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
      // If success, redirect happens in service
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