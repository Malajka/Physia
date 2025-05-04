import { errorResponse } from "@/lib/utils/api";
import { ErrorCode } from "@/types";
import type { APIRoute } from "astro";

/**
 * Wraps an Astro API route handler, enforcing Supabase authentication.
 * On success, calls the wrapped handler with (context, userId).
 * On failure, returns HTTP 401 Unauthorized.
 */
export function withAuth(handler: (context: Parameters<APIRoute>[0], userId: string) => ReturnType<APIRoute>): APIRoute {
  return async function (context) {
    const { locals } = context;
    const supabase = locals.supabase;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return errorResponse(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    }

    return handler(context, session.user.id);
  };
}
