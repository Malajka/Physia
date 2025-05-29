import type { AuthFormSubmitResult } from "@/hooks/useAuthForm";
import type { AuthCredentialsDto } from "@/types";

/**
 * Calls the login API endpoint and returns success status and error message if any.
 */
export async function login(data: AuthCredentialsDto): Promise<AuthFormSubmitResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
      return { success: false, error: json.error || "Login failed" };
    }
    return { success: true, error: "" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: msg };
  }
}

/**
 * Calls the registration API endpoint and returns success status and error message if any.
 */
export async function register(data: AuthCredentialsDto): Promise<AuthFormSubmitResult> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
      return { success: false, error: json.error || json.message || "Registration failed" };
    }
    return { success: true, error: "" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: msg };
  }
}
