import type { AuthFormSubmitResult } from "@/hooks/useAuthForm";
import { registerWithConfirmSchema } from "@/lib/validators/auth.validator";
import { register } from "./index";

export interface RegisterFormResult extends AuthFormSubmitResult {
  registrationSuccess?: boolean;
}

export const handleRegisterSubmit = async (formData: FormData): Promise<RegisterFormResult> => {
  const formValues = {
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    passwordConfirm: formData.get("passwordConfirm")?.toString() ?? "",
  };

  const parseResult = registerWithConfirmSchema.safeParse(formValues);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const result = await register({
      email: parseResult.data.email,
      password: parseResult.data.password,
    });

    if (!result.success) {
      if (typeof result.error === "string" && result.error.includes("|EMAIL_ALREADY_EXISTS")) {
        return {
          success: false,
          error: `This email is already registered. Would you like to <a href="/login" class="text-blue-600 hover:underline">log in</a> instead?`,
        };
      }
      return {
        success: false,
        error: typeof result.error === "string" ? result.error.split("|")[0] : "Registration failed",
      };
    }

    return {
      success: true,
      registrationSuccess: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      error: message,
    };
  }
};
