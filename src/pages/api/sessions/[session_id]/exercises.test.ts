import { getExercisesForSession } from "@/lib/services/exercises";
import { jsonResponse } from "@/lib/utils/response";
import type { ExerciseDto } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { APIContext } from "astro";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./exercises";

vi.mock("@/lib/middleware/withAuth", () => ({
  withAuth: vi.fn((handler) => (context: APIContext) => handler(context, "user-123")),
}));

vi.mock("@/lib/services/exercises");
const mockedGetExercises = vi.mocked(getExercisesForSession);

vi.mock("@/lib/utils/response");
const mockedJsonResponse = vi.mocked(jsonResponse);

const createMockContext = (params: Record<string, string | undefined>): APIContext =>
  ({
    params,
    locals: {
      supabase: {} as SupabaseClient,
      user: null,
    },
  }) as unknown as APIContext;

describe("GET /api/sessions/[session_id]/exercises", () => {
  const mockUserId = "user-123";
  const mockExercises: ExerciseDto[] = [
    {
      id: 1,
      muscle_test_id: 42,
      description: "Test exercise",
      created_at: "2024-01-01T00:00:00Z",
      images: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with exercises for a valid request", async () => {
    mockedGetExercises.mockResolvedValue({ exercises: mockExercises, error: undefined });
    const context = createMockContext({ session_id: "42" });

    await GET(context);

    expect(mockedGetExercises).toHaveBeenCalledWith(context.locals.supabase, mockUserId, 42);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ data: mockExercises }, 200);
  });

  it("should return 400 for an invalid session_id", async () => {
    const context = createMockContext({ session_id: "invalid" });
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid session_id" }), 400);
    expect(mockedGetExercises).not.toHaveBeenCalled();
  });

  it("should return 404 if getExercisesForSession reports a 'not found' error", async () => {
    mockedGetExercises.mockResolvedValue({ exercises: [], error: "Session not found" });
    const context = createMockContext({ session_id: "42" });
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Session not found" }, 404);
  });

  it("should return 500 if getExercisesForSession returns a generic error", async () => {
    mockedGetExercises.mockResolvedValue({ exercises: [], error: "Database connection failed" });
    const context = createMockContext({ session_id: "42" });
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Database connection failed" }, 500);
  });

  it("should return 500 on unexpected exceptions", async () => {
    const unexpectedError = new Error("Something broke");
    mockedGetExercises.mockRejectedValue(unexpectedError);
    const context = createMockContext({ session_id: "42" });
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Internal server error", details: "Something broke" }, 500);
  });
});
