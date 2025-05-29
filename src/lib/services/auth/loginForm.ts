import type { AuthFormSubmitResult } from '@/hooks/useAuthForm';
import { login } from '@/lib/services/auth';
import { loginSchema } from '@/lib/validators/auth.validator';

/**
 * Handles login form submission with validation and authentication
 * @param formData - Form data containing email and password
 * @returns Promise<AuthFormSubmitResult> - Result of the login attempt
 */
export const handleLoginSubmit = async (formData: FormData): Promise<AuthFormSubmitResult> => {
  // Extract credentials from form data
  const credentials = {
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  };

  // Validate credentials using shared schema
  const parseResult = loginSchema.safeParse(credentials);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: parseResult.error.errors.map((e) => e.message).join(", ") 
    };
  }

  // Attempt authentication
  const result = await login(parseResult.data);
  
  // Handle successful login with redirect
  if (result.success) {
    window.location.href = "/sessions";
  }
  
  return result;
}; 