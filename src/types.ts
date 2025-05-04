// Import JSON type and table row types from Supabase database definitions
import type { Json, Tables } from "./db/database.types";

// 1. Disclaimers
/**
 * DTO for retrieving the current medical disclaimer text.
 */
export interface DisclaimersContentDto {
  /** Text of the medical disclaimer */
  text: string;
}

/**
 * Response DTO for acknowledging disclaimer acceptance.
 */
export interface AcceptDisclaimerResponseDto {
  /** Timestamp when the disclaimer was accepted */
  accepted_at: string;
}

// 2. Body Parts
/**
 * DTO representing a body part available for testing.
 * Maps to 'body_parts' table row with snake_case field names.
 */
export interface BodyPartDto {
  id: Tables<"body_parts">["id"];
  name: Tables<"body_parts">["name"];
  /** When this body part record was created */
  created_at: Tables<"body_parts">["created_at"];
}

// 3. Muscle Tests
/**
 * DTO representing a muscle test for a given body part.
 * Maps to 'muscle_tests' table row with snake_case field names.
 */
export interface MuscleTestDto {
  id: Tables<"muscle_tests">["id"];
  /** Foreign key to the body part */
  body_part_id: Tables<"muscle_tests">["body_part_id"];
  name: Tables<"muscle_tests">["name"];
  description: Tables<"muscle_tests">["description"];
  /** When this muscle test record was created */
  created_at: Tables<"muscle_tests">["created_at"];
}

// 4. Exercises and Images
/**
 * DTO for exercise image metadata.
 * Maps to 'exercise_images' table row with snake_case field names.
 */
export interface ExerciseImageDto {
  id: Tables<"exercise_images">["id"];
  /** Foreign key to the exercise */
  exercise_id: Tables<"exercise_images">["exercise_id"];
  /** File path or URL to the image */
  file_path: Tables<"exercise_images">["file_path"];
  /** Optional JSON metadata (e.g., dimensions) */
  metadata: Tables<"exercise_images">["metadata"];
  /** When this image record was created */
  created_at: Tables<"exercise_images">["created_at"];
}

/**
 * DTO representing an exercise with its associated images.
 * Maps to 'exercises' table row and embeds an array of ExerciseImageDto.
 */
export interface ExerciseDto {
  id: Tables<"exercises">["id"];
  /** Foreign key to the muscle test */
  muscle_test_id: Tables<"exercises">["muscle_test_id"];
  description: Tables<"exercises">["description"];
  /** When this exercise record was created */
  created_at: Tables<"exercises">["created_at"];
  /** Associated images detailing how to perform the exercise */
  images: ExerciseImageDto[];
}

// 5. Sessions
/**
 * Query parameters for listing sessions with optional pagination and filters.
 */
export interface SessionListQueryDto {
  /** Page number (defaults to 1) */
  page?: number;
  /** Items per page (defaults to 20) */
  limit?: number;
  /** Optional filter by body part */
  body_part_id?: number;
  /** ISO date string for start of date range */
  start_date?: string;
  /** ISO date string for end of date range */
  end_date?: string;
}

/**
 * DTO representing a summary view of a session (for listing pages).
 * Maps to 'sessions' table row, omitting large fields like training_plan.
 */
export interface SessionSummaryDto {
  id: Tables<"sessions">["id"];
  body_part_id: Tables<"sessions">["body_part_id"];
  user_id: Tables<"sessions">["user_id"];
  /** When disclaimer was accepted for this session */
  disclaimer_accepted_at: Tables<"sessions">["disclaimer_accepted_at"];
  /** When this session record was created */
  created_at: Tables<"sessions">["created_at"];
}

/**
 * Detailed DTO for a single session, including the generated training plan,
 * related session tests, and feedback rating.
 */
export interface SessionDetailDto {
  id: Tables<"sessions">["id"];
  body_part_id: Tables<"sessions">["body_part_id"];
  user_id: Tables<"sessions">["user_id"];
  disclaimer_accepted_at: Tables<"sessions">["disclaimer_accepted_at"];
  created_at: Tables<"sessions">["created_at"];
  /** Structured training plan as returned by the LLM (free-form JSON) */
  training_plan: Json;
  /** Tests selected for this session, with reported pain intensities */
  session_tests: SessionTestDto[];
  /** Feedback rating for this session, or null if not submitted */
  feedback_rating: FeedbackRatingDto | null;
}

/**
 * DTO representing a single session test entry.
 * Maps to 'session_tests' table row with snake_case field names.
 */
export interface SessionTestDto {
  id: Tables<"session_tests">["id"];
  session_id: Tables<"session_tests">["session_id"];
  muscle_test_id: Tables<"session_tests">["muscle_test_id"];
  pain_intensity: Tables<"session_tests">["pain_intensity"];
}

// 6. Feedback Ratings
/**
 * DTO for feedback rating on a session.
 * Maps to 'feedback_ratings' table row, exposing only rating and timestamp.
 */
export interface FeedbackRatingDto {
  /** Rating value (0 or 1), or null if not submitted */
  rating: Tables<"feedback_ratings">["rating"];
  /** When the rating was submitted, or null if not yet rated */
  rated_at: Tables<"feedback_ratings">["rated_at"];
}

// 7. Command Models (requests that change state)
/**
 * Command model for creating a new session.
 * Corresponds to POST /api/sessions request body.
 */
export interface CreateSessionCommandDto {
  /** Body part to test */
  body_part_id: number;
  /** List of selected muscle tests with corresponding pain intensities */
  tests: {
    muscle_test_id: number;
    pain_intensity: number;
  }[];
}

/**
 * Command model for submitting or updating session feedback.
 * Corresponds to POST /api/sessions/:sessionId/feedback request body.
 */
export interface SubmitFeedbackCommandDto {
  /** Rating value (0 or 1) */
  rating: 0 | 1;
}

/**
 * Command model for login requests.
 * Corresponds to POST /api/auth/login request body.
 */
export interface LoginCommandDto {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Command model for registration requests.
 * Corresponds to POST /api/auth/register request body.
 */
export interface RegisterCommandDto {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Shared error codes for API responses.
 */
export enum ErrorCode {
  VALIDATION_FAILED = "validation_failed",
  DISCLAIMER_REQUIRED = "disclaimer_required",
  RESOURCE_NOT_FOUND = "resource_not_found",
  SERVER_ERROR = "server_error",
  AUTHENTICATION_REQUIRED = "authentication_required",
}

/**
 * Generic API response wrapper for a single data payload
 */
export interface DataResponse<T> {
  data: T;
}

/**
 * Generic API response wrapper for an array of data payloads
 */
export interface DataArrayResponse<T> {
  data: T[];
}

// 8. Service Result
/**
 * Generic wrapper for service-layer results, carrying either data or an error message.
 */
export interface ServiceResultDto<T> {
  /** The payload returned on success */
  data?: T;
  /** The error message if the operation failed */
  error?: string;
}
