import { jsonResponse } from "@/lib/utils/response";
import { loginSchema } from "@/lib/validators/auth.validator";
import type { AuthCredentialsDto } from "@/types";
import type { APIRoute } from "astro";
import { ZodError } from "zod";

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    let data: AuthCredentialsDto;
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
    // Success - set authentication cookies for SSR
    cookies.set("sb-access-token", authData.session.access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: authData.session.expires_in,
    });
    cookies.set("sb-refresh-token", authData.session.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    // Success - return session data
    return jsonResponse({ user: authData.user, session: authData.session }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred";
    return jsonResponse({ error: message }, 500);
  }
};
