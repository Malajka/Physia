import type { SupabaseClient } from "@/db/supabase.client";
import { describe, expect, it, vi } from "vitest";
import { getExercisesForMuscleTests, getMuscleTestsForBodyPart } from "./helpers";

describe("getMuscleTestsForBodyPart", () => {
  it("calls supabase.from with correct params and returns result", async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ data: [{ id: 1, name: "Test", description: "desc" }], error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({ select: mockSelect, eq: mockEq }),
    } as unknown as SupabaseClient;

    const result = await getMuscleTestsForBodyPart(mockSupabase, 42);
    expect(mockSupabase.from).toHaveBeenCalledWith("muscle_tests");
    expect(mockSelect).toHaveBeenCalledWith("id, name, description");
    expect(mockEq).toHaveBeenCalledWith("body_part_id", 42);
    expect(result).toEqual({ data: [{ id: 1, name: "Test", description: "desc" }], error: null });
  });
});

describe("getExercisesForMuscleTests", () => {
  it("calls supabase.from with correct params and returns result", async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockIn = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 1, description: "desc", muscle_test_id: 2, created_at: "2024-01-01", exercise_images: [] }], error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({ select: mockSelect, in: mockIn }),
    } as unknown as SupabaseClient;

    const ids = [2, 3];
    const result = await getExercisesForMuscleTests(mockSupabase, ids);
    expect(mockSupabase.from).toHaveBeenCalledWith("exercises");
    expect(mockSelect).toHaveBeenCalledWith(`
      id,
      description,
      muscle_test_id,
      created_at,
      exercise_images (
        id,
        exercise_id,
        file_path,
        metadata,
        created_at
      )
    `);
    expect(mockIn).toHaveBeenCalledWith("muscle_test_id", ids);
    expect(result).toEqual({ data: [{ id: 1, description: "desc", muscle_test_id: 2, created_at: "2024-01-01", exercise_images: [] }], error: null });
  });
});
