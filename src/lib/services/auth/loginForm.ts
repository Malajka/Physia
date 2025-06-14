import type { AuthFormSubmitResult } from "@/hooks/useAuthForm";
import { loginSchema } from "@/lib/validators/auth.validator";
import { login } from "./index";

export const handleLoginSubmit = async (formData: FormData): Promise<AuthFormSubmitResult> => {
  const credentials = {
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  };

  const parseResult = loginSchema.safeParse(credentials);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors.map((e) => e.message).join(", "),
    };
  }

  const result = await login(parseResult.data);

  if (result.success) {
    window.location.href = "/sessions";
  }

  return result;
};
