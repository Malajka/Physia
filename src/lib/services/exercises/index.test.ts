import type { SupabaseClient } from "@/db/supabase.client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getExercisesForMuscleTests, getMuscleTestsForBodyPart } from "./helpers";
import { getExercisesForSession } from "./index";

vi.mock("./helpers", () => ({
  getMuscleTestsForBodyPart: vi.fn(),
  getExercisesForMuscleTests: vi.fn(),
}));

describe("getExercisesForSession", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns exercises for valid session (happy path)", async () => {
    // Mock supabase client
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { body_part_id: 1 }, error: null }),
    } as unknown as SupabaseClient;

    // Mock helpers
    const muscleTests = [{ id: 10, name: "Test", description: "desc", body_part_id: 1, created_at: "2024-01-01T00:00:00Z" }];
    const exercisesData = [
      {
        id: 1,
        muscle_test_id: 10,
        description: "desc",
        created_at: "2024-01-01T00:00:00Z",
        exercise_images: [{ id: 1, exercise_id: 1, file_path: "img.png", metadata: null, created_at: "2024-01-01T00:00:00Z" }],
      },
    ];

    (getMuscleTestsForBodyPart as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: muscleTests,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });
    (getExercisesForMuscleTests as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: exercisesData,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    const result = await getExercisesForSession(supabase, "user-1", 123);
    expect(result.exercises.length).toBe(1);
    expect(result.exercises[0].id).toBe(1);
    expect(result.error).toBeUndefined();
  });

  it("handles session not found", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "Session not found" } }),
    } as unknown as SupabaseClient;

    const result = await getExercisesForSession(supabase, "user-1", 123);
    expect(result.exercises).toEqual([]);
    expect(result.error).toBe("Session not found or access denied");
  });

  it("handles missing muscle tests", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { body_part_id: 1 }, error: null }),
    } as unknown as SupabaseClient;

    (getMuscleTestsForBodyPart as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    const result = await getExercisesForSession(supabase, "user-1", 123);
    expect(result.exercises).toEqual([]);
    expect(result.error).toBe("No muscle tests found for the selected body part");
  });

  it("handles muscle tests error", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { body_part_id: 1 }, error: null }),
    } as unknown as SupabaseClient;

    (getMuscleTestsForBodyPart as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: "Database error",
      count: null,
      status: 500,
      statusText: "Error",
    });

    const result = await getExercisesForSession(supabase, "user-1", 123);
    expect(result.exercises).toEqual([]);
    expect(result.error).toBe("No muscle tests found for the selected body part");
  });

  it("handles missing exercises", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { body_part_id: 1 }, error: null }),
    } as unknown as SupabaseClient;

    const muscleTests = [{ id: 10, name: "Test", description: "desc", body_part_id: 1, created_at: "2024-01-01T00:00:00Z" }];

    (getMuscleTestsForBodyPart as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: muscleTests,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });
    (getExercisesForMuscleTests as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });

    const result = await getExercisesForSession(supabase, "user-1", 123);
    expect(result.exercises).toEqual([]);
    expect(result.error).toBe("No exercises found for the selected muscle tests");
  });

  it("handles exercises error", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { body_part_id: 1 }, error: null }),
    } as unknown as SupabaseClient;

    const muscleTests = [{ id: 10, name: "Test", description: "desc", body_part_id: 1, created_at: "2024-01-01T00:00:00Z" }];

    (getMuscleTestsForBodyPart as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: muscleTests,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });
    (getExercisesForMuscleTests as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: "Database error",
      count: null,
      status: 500,
      statusText: "Error",
    });

    const result = await getExercisesForSession(supabase, "user-1", 123);
    expect(result.exercises).toEqual([]);
    expect(result.error).toBe("No exercises found for the selected muscle tests");
  });

  it("handles unexpected errors", async () => {
    const supabase = {
      from: vi.fn(() => {
        throw new Error("Unexpected database error");
      }),
    } as unknown as SupabaseClient;

    const result = await getExercisesForSession(supabase, "user-1", 123);
    expect(result.exercises).toEqual([]);
    expect(result.error).toBe("Unexpected database error");
  });

  it("handles non-Error exceptions", async () => {
    const supabase = {
      from: vi.fn(() => {
        throw "String error";
      }),
    } as unknown as SupabaseClient;

    const result = await getExercisesForSession(supabase, "user-1", 123);
    expect(result.exercises).toEqual([]);
    expect(result.error).toBe("Unknown error occurred");
  });
});
