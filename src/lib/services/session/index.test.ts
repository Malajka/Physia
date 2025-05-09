import type { SupabaseClient } from "@/db/supabase.client";
import * as trainingPlanService from "@/lib/services/training-plan";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSession } from "./index";

const userId = "user-1";
const command = {
  body_part_id: 1,
  tests: [{ muscle_test_id: 10, pain_intensity: 5 }],
};

describe("createSession", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns session detail (happy path)", async () => {
    const sessionData = {
      id: 1,
      body_part_id: 1,
      user_id: userId,
      disclaimer_accepted_at: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      training_plan: {},
      session_tests: [],
    };
    const muscleTestsData = [{ id: 10, body_part_id: 1, name: "Test", description: "desc", created_at: "2024-01-01T00:00:00Z" }];
    const exercisesData = [{ id: 100, muscle_test_id: 10, description: "desc", created_at: "2024-01-01T00:00:00Z", images: [] }];

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "body_parts") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 1, name: "Shoulder" }, error: null }),
          };
        }
        if (table === "muscle_tests") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            then: (cb: (arg: { data: typeof muscleTestsData; error: null }) => unknown) => cb({ data: muscleTestsData, error: null }),
          };
        }
        if (table === "sessions") {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: sessionData, error: null }),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
          };
        }
        if (table === "session_tests") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "exercises") {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            then: (cb: (arg: { data: typeof exercisesData; error: null }) => unknown) => cb({ data: exercisesData, error: null }),
          };
        }
        if (table === "generation_error_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    // Mock generateTrainingPlan
    vi.spyOn(trainingPlanService, "generateTrainingPlan").mockResolvedValue({
      trainingPlan: {
        exercises: [],
        description: "desc",
        title: "Plan",
        warnings: [],
      },
      error: null,
    });

    // Wywołanie funkcji
    const result = await createSession(supabase, userId, command);
    expect(result.session).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it("returns error if body part not found", async () => {
    const supabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
      insert: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    const result = await createSession(supabase, userId, command);
    expect(result.session).toBeNull();
    expect(result.error).toMatch(/not found/);
  });
});
