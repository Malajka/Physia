import { jsonResponse } from "@/lib/utils/response";
import type { LoginCommandDto } from "@/types";
import type { APIRoute } from "astro";
import { z, ZodError, type ZodType } from "zod";

export const prerender = false;

// Runtime validation schema matching the external DTO
export const loginSchema: ZodType<LoginCommandDto> = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let data: LoginCommandDto;
    try {
      data = loginSchema.parse(await request.json());
    } catch (error) {
      if (error instanceof ZodError) {
        return jsonResponse({ error: error.errors.map((e) => e.message).join(", ") }, 400);
      }
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }
    const { email, password } = data;

    // Attempt to sign in with Supabase
    const { data: authData, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return jsonResponse({ error: "Invalid login credentials" }, 401);
    }
    // Success - return session data
    return jsonResponse({ user: authData.user, session: authData.session }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred";
    return jsonResponse({ error: message }, 500);
  }
};
