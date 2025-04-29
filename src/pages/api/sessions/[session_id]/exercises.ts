import type { APIRoute } from "astro";
// import { DEFAULT_USER_ID } from "../../../../db/supabase.client"; // no longer used
import { getExercisesForSession } from "../../../../lib/services/exerciseService";

// Definiuję kody błędów bezpośrednio w pliku, żeby uniknąć problemu z importem
enum ErrorCode {
  AUTHENTICATION_REQUIRED = "authentication_required",
  VALIDATION_FAILED = "validation_failed",
  RESOURCE_NOT_FOUND = "resource_not_found",
  SERVER_ERROR = "server_error",
}

export const prerender = false; // Dynamic API endpoint

export const POST: APIRoute = async ({ params, locals }) => {
  const supabase = locals.supabase;
  // Get authenticated user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: { code: ErrorCode.AUTHENTICATION_REQUIRED, message: "Authentication required" } }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const userId = session.user.id;

  // 2. Validate session_id parameter
  const { session_id } = params;

  if (!session_id || isNaN(Number(session_id))) {
    return new Response(
      JSON.stringify({
        error: {
          code: ErrorCode.VALIDATION_FAILED,
          message: "Invalid session ID format",
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // 3. Retrieve exercises for the session
  try {
    const sessionId = Number(session_id);
    const { exercises, error } = await getExercisesForSession(supabase, userId, sessionId);

    if (error) {
      // Different error handling based on the type of error
      if (error.includes("Session not found")) {
        return new Response(
          JSON.stringify({
            error: {
              code: ErrorCode.RESOURCE_NOT_FOUND,
              message: "Session not found or access denied",
            },
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (error.includes("No muscle tests found") || error.includes("No exercises found")) {
        return new Response(
          JSON.stringify({
            error: {
              code: ErrorCode.RESOURCE_NOT_FOUND,
              message: error,
            },
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Default to server error for other types of errors
      return new Response(
        JSON.stringify({
          error: {
            code: ErrorCode.SERVER_ERROR,
            message: "An error occurred while retrieving exercises",
            details: { reason: error },
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 4. Return the exercises
    return new Response(JSON.stringify(exercises), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in exercises endpoint:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: "An unexpected error occurred",
          details: { reason: error instanceof Error ? error.message : String(error) },
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
