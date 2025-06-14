import type { Json, Tables } from "./db/database.types";

export interface DisclaimersContentDto {
  text: string;
}

export interface AcceptDisclaimerResponseDto {
  accepted_at: string;
}

export interface BodyPartDto {
  id: Tables<"body_parts">["id"];
  name: Tables<"body_parts">["name"];

  created_at: Tables<"body_parts">["created_at"];
}

export interface MuscleTestDto {
  id: Tables<"muscle_tests">["id"];

  body_part_id: Tables<"muscle_tests">["body_part_id"];
  name: Tables<"muscle_tests">["name"];
  description: Tables<"muscle_tests">["description"];

  created_at: Tables<"muscle_tests">["created_at"];

  exercises?: {
    id: number;
    exercise_images: ExerciseImageDto[];
  }[];
}

export interface ExerciseImageDto {
  id: Tables<"exercise_images">["id"];

  exercise_id: Tables<"exercise_images">["exercise_id"];

  file_path: Tables<"exercise_images">["file_path"];

  metadata: Tables<"exercise_images">["metadata"];

  created_at: Tables<"exercise_images">["created_at"];
}

export interface ExerciseDto {
  id: Tables<"exercises">["id"];

  muscle_test_id: Tables<"exercises">["muscle_test_id"];
  description: Tables<"exercises">["description"];

  created_at: Tables<"exercises">["created_at"];

  images: ExerciseImageDto[];
}

export interface SessionListQueryDto {
  page?: number;

  limit?: number;

  body_part_id?: number;

  start_date?: string;

  end_date?: string;
}

export interface SessionSummaryDto {
  id: Tables<"sessions">["id"];
  body_part_id: Tables<"sessions">["body_part_id"];
  user_id: Tables<"sessions">["user_id"];

  disclaimer_accepted_at: Tables<"sessions">["disclaimer_accepted_at"];

  created_at: Tables<"sessions">["created_at"];
}

export interface SessionDetailDto {
  id: Tables<"sessions">["id"];
  body_part_id: Tables<"sessions">["body_part_id"];
  user_id: Tables<"sessions">["user_id"];
  disclaimer_accepted_at: Tables<"sessions">["disclaimer_accepted_at"];
  created_at: Tables<"sessions">["created_at"];

  training_plan: Json;

  session_tests: SessionTestDto[];

  feedback_rating: FeedbackRatingDto | null;
}

export interface SessionTestDto {
  id: Tables<"session_tests">["id"];
  session_id: Tables<"session_tests">["session_id"];
  muscle_test_id: Tables<"session_tests">["muscle_test_id"];
  pain_intensity: Tables<"session_tests">["pain_intensity"];
}

export interface FeedbackRatingDto {
  rating: Tables<"feedback_ratings">["rating"];

  rated_at: Tables<"feedback_ratings">["rated_at"];
}

export interface CreateSessionCommandDto {
  body_part_id: number;

  tests: {
    muscle_test_id: number;
    pain_intensity: number;
  }[];
}

export interface SubmitFeedbackCommandDto {
  rating: 0 | 1;
}

export interface AuthCredentialsDto {
  email: string;

  password: string;
}

export enum ErrorCode {
  VALIDATION_FAILED = "validation_failed",
  DISCLAIMER_REQUIRED = "disclaimer_required",
  RESOURCE_NOT_FOUND = "resource_not_found",
  SERVER_ERROR = "server_error",
  AUTHENTICATION_REQUIRED = "authentication_required",
}

export interface DataResponse<T> {
  data: T;
}

export interface DataArrayResponse<T> {
  data: T[];
}

export interface ErrorResponse {
  error: string;
}

export interface ServiceResultDto<T> {
  data?: T;

  error?: string;
}
