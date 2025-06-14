import { JSON_HEADERS } from "@/lib/utils/api";

export interface LogoutResult {
  success: boolean;
  error?: string;
}

export const logoutUser = async (): Promise<LogoutResult> => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: JSON_HEADERS,
    });

    if (!response.ok) {
      const json = await response.json();
      return {
        success: false,
        error: json.error || json.message || `Logout failed (status: ${response.status})`,
      };
    }

    window.location.href = "/login";

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Logout error: ${message}`,
    };
  }
};
