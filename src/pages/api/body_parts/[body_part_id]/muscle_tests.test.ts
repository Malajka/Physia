import type { MuscleTestDto } from "@/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./muscle_tests";

interface SupabaseFrom {
  select: (columns: string) => SupabaseEq;
}
interface SupabaseEq {
  eq: (column: string, value: number) => Promise<{ data: MuscleTestDto[] | null; error: { message: string } | null }>;
}
interface SupabaseAuth {
  getSession: () => Promise<{ data: { session: { user: { id: string } } | null }; error: { message: string } | null }>;
}
interface Supabase {
  from: (table: string) => SupabaseFrom;
  auth: SupabaseAuth;
}
interface Locals {
  supabase: Supabase;
}

type GetArgs = Parameters<typeof GET>[0];

function createMockSupabase({ data, error }: { data?: MuscleTestDto[] | null; error?: { message: string } | null }) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-id" } } }, error: null }),
    },
  } as unknown as Supabase;
}

describe("GET /api/body_parts/[body_part_id]/muscle_tests", () => {
  let locals: Locals;

  beforeEach(() => {
    locals = { supabase: createMockSupabase({ data: [], error: null }) };
  });

  it("returns 200 and data for valid body_part_id", async () => {
    const muscleTests: MuscleTestDto[] = [{ id: 1, body_part_id: 2, name: "Test", description: "desc", created_at: "2024-01-01" }];
    locals.supabase = createMockSupabase({ data: muscleTests, error: null });
    const params = { body_part_id: "2" };
    const response = await GET({ locals, params } as unknown as GetArgs);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(muscleTests);
  });

  it("returns 400 on invalid body_part_id", async () => {
    const params = { body_part_id: "not-a-number" };
    const response = await GET({ locals, params } as unknown as GetArgs);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid body_part_id");
  });

  it("returns 502 on Supabase error", async () => {
    locals.supabase = createMockSupabase({ data: null, error: { message: "db error" } });
    const params = { body_part_id: "2" };
    const response = await GET({ locals, params } as unknown as GetArgs);
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("Failed to fetch muscle tests");
    expect(body.details).toBe("db error");
  });

  it("returns 500 on unexpected error", async () => {
    // Simulate throw in supabase.from().select().eq()
    locals.supabase = {
      ...locals.supabase,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error("unexpected")), // throws
        }),
      }),
      auth: locals.supabase.auth,
    } as unknown as Supabase;
    const params = { body_part_id: "2" };
    const response = await GET({ locals, params } as unknown as GetArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
  });

  it("returns 401 if not authenticated", async () => {
    // Simulate no session
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    const params = { body_part_id: "2" };
    const response = await GET({ locals, params } as unknown as GetArgs);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("authentication_required");
  });

  it("returns 500 if session error", async () => {
    // Simulate error in getSession
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: { message: "session error" } });
    const params = { body_part_id: "2" };
    const response = await GET({ locals, params } as unknown as GetArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("server_error");
  });
});
