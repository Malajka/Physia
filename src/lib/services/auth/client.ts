import type { AuthFormSubmitResult } from "@/lib/hooks/useAuthForm";
import { JSON_HEADERS } from "@/lib/utils/api";

export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Client-side login function that calls the API and returns a normalized result.
 */
export async function login(data: AuthCredentials): Promise<AuthFormSubmitResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
      return { success: false, error: json.error || "Login failed" };
    }
    return { success: true, error: "" };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

/**
 * Client-side register function that calls the API and returns a normalized result.
 */
export async function register(data: AuthCredentials): Promise<AuthFormSubmitResult> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
      return { success: false, error: json.error || "Registration failed" };
    }
    return { success: true, error: "" };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}
