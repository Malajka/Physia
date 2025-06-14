import type { AuthFormSubmitResult } from "@/hooks/useAuthForm";
import { JSON_HEADERS } from "@/lib/utils/api";
import type { AuthCredentialsDto } from "@/types";
/**
 * Generic function for authentication requests (login/register)
 */
async function authRequest(endpoint: string, data: AuthCredentialsDto, defaultErrorMessage: string): Promise<AuthFormSubmitResult> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const json = await response.json();
      let errorMessage = json.error || json.message || defaultErrorMessage;

      // Add error code for special handling in forms
      if (json.code) {
        errorMessage = `${errorMessage}|${json.code}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true, error: "" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: msg };
  }
}

/**
 * Calls the login API endpoint and returns success status and error message if any.
 */
export async function login(data: AuthCredentialsDto): Promise<AuthFormSubmitResult> {
  return authRequest("/api/auth/login", data, "Login failed");
}

/**
 * Calls the registration API endpoint and returns success status and error message if any.
 */
export async function register(data: AuthCredentialsDto): Promise<AuthFormSubmitResult> {
  return authRequest("/api/auth/register", data, "Registration failed");
}

// Re-export higher-level auth functions for convenience
// These provide additional features like form validation and redirects
export { handleLoginSubmit } from "./loginForm";
export { logoutUser } from "./logout";
export { handleRegisterSubmit, type RegisterFormResult } from "./registerForm";
