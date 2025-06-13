// lib/middleware/withAuth.ts

import { errorResponse } from "@/lib/utils/api";
import { ErrorCode } from "@/types";
import type { APIRoute } from "astro";

type APIRouteContext = Parameters<APIRoute>[0];
// The handler now receives the entire authenticated user object, not just the ID.
// This is more flexible if you need other user details in the future.
type AuthHandler = (context: APIRouteContext, userId: string) => ReturnType<APIRoute>;

export function withAuth(handler: AuthHandler): APIRoute {
  // This function no longer needs to be async.
  return function (context) {
    const { locals } = context;

    // Retrieve the user object that was already authenticated by the main middleware.
    const user = locals.user;

    // If the main middleware did not find an authenticated user, locals.user will be null.
    if (!user) {
      // The user is not authenticated. Return a 401 Unauthorized error.
      return errorResponse(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    }

    // The user is authenticated. Proceed to the actual API handler,
    // passing the context and the verified user's ID.
    return handler(context, user.id);
  };
}
