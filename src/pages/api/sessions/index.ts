import { withAuth } from "@/lib/middleware/withAuth";
import { createSession } from "@/lib/services/session";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { parseAndValidate } from "@/lib/utils/request";
import { CreateSessionSchema } from "@/lib/validators/session.validator";
import type { CreateSessionCommandDto } from "@/types";
import { ErrorCode } from "@/types";
import type { APIRoute } from "astro";



export const POST: APIRoute = withAuth(async ({ request, locals }, userId) => {
  try {
    // Parse and validate request payload
    const command = await parseAndValidate<CreateSessionCommandDto>(request, CreateSessionSchema);
    // Call service layer
    const { session: createdSession, error } = await createSession(locals.supabase, userId, command);
    if (error) {
      if (error === "disclaimer_required") {
        return errorResponse(ErrorCode.DISCLAIMER_REQUIRED, "User must accept the medical disclaimer before creating a session", 403);
      }
      if (error.includes("not found")) {
        return errorResponse(ErrorCode.RESOURCE_NOT_FOUND, error, 404);
      }
      return errorResponse(ErrorCode.SERVER_ERROR, "An error occurred while creating the session", 500);
    }
    return successResponse(createdSession, 201);
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    return errorResponse(ErrorCode.SERVER_ERROR, "Unexpected error", 500);
  }
});
