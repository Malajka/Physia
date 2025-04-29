import type { APIRoute } from "astro";
import { z } from "zod";
// import { DEFAULT_USER_ID } from "../../../db/supabase.client"; // no longer used
import { createSession } from "../../../lib/services/session.service";

// Define error codes for API responses
export enum ErrorCode {
  VALIDATION_FAILED = "validation_failed",
  DISCLAIMER_REQUIRED = "disclaimer_required",
  RESOURCE_NOT_FOUND = "resource_not_found",
  SERVER_ERROR = "server_error",
}

// Prevent static pre-rendering as this is a dynamic API endpoint
export const prerender = false;

// Define Zod schema for input validation
const CreateSessionSchema = z.object({
  body_part_id: z.number().int().positive(),
  tests: z
    .array(
      z.object({
        muscle_test_id: z.number().int().positive(),
        pain_intensity: z.number().int().min(0).max(10),
      })
    )
    .nonempty()
    .max(15, "Maximum 15 tests allowed per session"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: { code: ErrorCode.VALIDATION_FAILED, message: "Authentication required" } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = session.user.id;

  // Parse and validate the request body
  let requestData;
  try {
    requestData = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          code: ErrorCode.VALIDATION_FAILED,
          message: "Invalid JSON in request body",
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

  // Validate against Zod schema
  const validationResult = CreateSessionSchema.safeParse(requestData);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        error: {
          code: ErrorCode.VALIDATION_FAILED,
          message: "Request validation failed",
          details: validationResult.error.format(),
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

  const command = validationResult.data;

  // Call the service layer to create the session for the authenticated user
  const { session: createdSession, error } = await createSession(supabase, userId, command);

  // Handle potential errors
  if (error) {
    if (error === "disclaimer_required") {
      return new Response(
        JSON.stringify({
          error: {
            code: ErrorCode.DISCLAIMER_REQUIRED,
            message: "User must accept the medical disclaimer before creating a session",
          },
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (error.includes("not found")) {
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
          message: "An error occurred while creating the session",
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

  // Return the created session
  return new Response(JSON.stringify(createdSession), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
