import type { AuthFormSubmitResult } from '@/hooks/useAuthForm';
import { register } from '@/lib/services/auth';
import { registerWithConfirmSchema } from '@/lib/validators/auth.validator';

export interface RegisterFormResult extends AuthFormSubmitResult {
  registrationSuccess?: boolean;
}

/**
 * Handles registration form submission with validation and authentication
 * @param formData - Form data containing email, password, and passwordConfirm
 * @returns Promise<RegisterFormResult> - Result of the registration attempt
 */
export const handleRegisterSubmit = async (formData: FormData): Promise<RegisterFormResult> => {
  // Extract credentials from form data
  const formValues = {
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    passwordConfirm: formData.get("passwordConfirm")?.toString() ?? "",
  };

  // Validate form data including password confirmation
  const parseResult = registerWithConfirmSchema.safeParse(formValues);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: parseResult.error.errors.map((e) => e.message).join(", ") 
    };
  }

  try {
    // Attempt registration with only email and password
    const result = await register({
      email: parseResult.data.email,
      password: parseResult.data.password,
    });

    if (!result.success) {
      // Special handling for email already exists error
      if (typeof result.error === "string" && result.error.includes("already registered")) {
        return {
          success: false,
          error: `This email is already registered. Would you like to <a href="/login" class="text-blue-600 hover:underline">log in</a> instead?`
        };
      }
      return {
        success: false,
        error: result.error || "Registration failed"
      };
    }

    // Registration successful
    return { 
      success: true, 
      registrationSuccess: true 
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      error: message
    };
  }
}; 