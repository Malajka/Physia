import { JSON_HEADERS } from "@/lib/utils/api";

export interface LogoutResult {
  success: boolean;
  error?: string;
}

/**
 * Handles user logout with API call and cleanup
 * @returns Promise<LogoutResult> - Result of the logout attempt
 */
export const logoutUser = async (): Promise<LogoutResult> => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: JSON_HEADERS,
    });

    if (!response.ok) {
      const json = await response.json();
      return {
        success: false,
        error: json.error || json.message || `Logout failed (status: ${response.status})`
      };
    }

    // Success - redirect to login page
    window.location.href = "/login";
    
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Logout error: ${message}`
    };
  }
}; 