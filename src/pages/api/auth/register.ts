import { jsonResponse } from "@/lib/utils/response";
import type { RegisterCommandDto } from "@/types";
import type { APIRoute } from "astro";
import { z, ZodError, type ZodType } from "zod";

export const prerender = false;

// Runtime validation schema matching the external DTO
export const registerSchema: ZodType<RegisterCommandDto> = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let data: RegisterCommandDto;
    try {
      data = registerSchema.parse(await request.json());
    } catch (error) {
      if (error instanceof ZodError) {
        return jsonResponse({ error: error.errors.map((e) => e.message).join(", ") }, 400);
      }
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }
    const { email, password } = data;

    // Attempt to sign up with Supabase
    const { data: registrationResult, error: signUpError } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login`,
      },
    });

    // Handle signup errors
    if (signUpError) {
      // Conflict: email already registered or unique constraint violation
      const errorMessageLower = signUpError.message.toLowerCase();
      const duplicateEmailPatterns = ["already registered", "duplicate", "unique constraint", "taken"];
      if (duplicateEmailPatterns.some((pattern) => errorMessageLower.includes(pattern))) {
        return jsonResponse({ error: "This email is already registered. Please log in instead." }, 409);
      }
      return jsonResponse({ error: signUpError.message }, 400);
    }

    // Success - return user data
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
