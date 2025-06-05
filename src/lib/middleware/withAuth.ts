import { errorResponse } from "@/lib/utils/api";
import { ErrorCode } from "@/types";
import type { APIRoute } from "astro";

type APIRouteContext = Parameters<APIRoute>[0];
type AuthHandler = (context: APIRouteContext, userId: string) => ReturnType<APIRoute>;

export function withAuth(handler: AuthHandler): APIRoute {
  return async function (context) {
    const { locals } = context;
    const supabase = locals.supabase;

    if (!supabase) {
      return errorResponse(ErrorCode.SERVER_ERROR, "Server configuration error: Supabase client unavailable", 500);
    }

    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return errorResponse(ErrorCode.SERVER_ERROR, "Failed to retrieve session", 500);
    }

    const { session } = data;

    if (!session) {
      return errorResponse(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    }

    return handler(context, session.user.id);
  };
}
