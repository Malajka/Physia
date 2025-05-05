import { errorResponse } from "@/lib/utils/api";
import { ErrorCode } from "@/types";
import type { APIRoute } from "astro";

// I'm adding these aliases for clearer parameter names
type APIRouteContext = Parameters<APIRoute>[0];
type AuthHandler = (context: APIRouteContext, userId: string) => ReturnType<APIRoute>;

/**
 * Wraps an Astro API route handler, enforcing Supabase authentication.
 * On success, calls the wrapped handler with (context, userId).
 * On failure, returns HTTP 401 Unauthorized.
 */
export function withAuth(handler: AuthHandler): APIRoute {
  return async function (context) {
    const { locals } = context;
    const supabase = locals.supabase;
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return errorResponse(ErrorCode.SERVER_ERROR, "Failed to retrieve session", 500);
    }
    const { session } = data;

    if (!session) {
      return errorResponse(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    }

    return handler(context, session.user.id);
  };
}
