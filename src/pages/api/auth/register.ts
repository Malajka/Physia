import { jsonResponse } from "@/lib/utils/response";
import { registerSchema } from "@/lib/validators/auth.validator";
import type { AuthCredentialsDto } from "@/types";
import type { APIRoute } from "astro";
import { ZodError } from "zod";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let data: AuthCredentialsDto;
    try {
      data = registerSchema.parse(await request.json());
    } catch (error) {
      if (error instanceof ZodError) {
        return jsonResponse({ error: error.errors.map((e) => e.message).join(", ") }, 400);
      }
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }
    const { email, password } = data;

    const { data: registrationResult, error: signUpError } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login`,
      },
    });

    if (signUpError) {
      const errorMessageLower = signUpError.message.toLowerCase();
      const duplicateEmailPatterns = ["already registered", "duplicate", "unique constraint", "taken"];
      if (duplicateEmailPatterns.some((pattern) => errorMessageLower.includes(pattern))) {
        return jsonResponse(
          {
            error: "This email is already registered. Please log in instead.",
            code: "EMAIL_ALREADY_EXISTS",
          },
          409
        );
      }
      return jsonResponse({ error: signUpError.message }, 400);
    }

    return jsonResponse(
      {
        user: registrationResult.user,
        message: "Registration successful! Please check your email for confirmation.",
      },
      200
    );
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred";
    return jsonResponse({ error: message }, 500);
  }
};
