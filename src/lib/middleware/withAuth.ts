import { errorResponse } from "@/lib/utils/api";
import { ErrorCode } from "@/types";
import type { APIRoute } from "astro";

type APIRouteContext = Parameters<APIRoute>[0];

type AuthHandler = (context: APIRouteContext, userId: string) => ReturnType<APIRoute>;

export function withAuth(handler: AuthHandler): APIRoute {
  return function (context) {
    const { locals } = context;

    const user = locals.user;

    if (!user) {
      return errorResponse(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    }

    return handler(context, user.id);
  };
}
