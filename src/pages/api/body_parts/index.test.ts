import type { BodyPartDto } from "@/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock astro:middleware before importing GET
vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn: any) => fn
}));

import { GET } from "./index";

interface SupabaseFrom {
  select: (columns: string) => SupabaseOrder;
}
interface SupabaseOrder {
  order: (column: string) => Promise<{ data: BodyPartDto[] | null; error: { message: string } | null }>;
}
interface Supabase {
  from: (table: string) => SupabaseFrom;
}
interface Locals {
  supabase: Supabase;
}

type GetArgs = Parameters<typeof GET>[0];

function createMockSupabase({ data, error }: { data?: BodyPartDto[] | null; error?: { message: string } | null }) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
  } as unknown as Supabase;
}

describe("GET /api/body_parts", () => {
  let locals: Locals;

  beforeEach(() => {
    locals = { supabase: createMockSupabase({ data: [], error: null }) };
  });

  it("returns 200 and data for valid request", async () => {
    const bodyParts: BodyPartDto[] = [{ id: 1, name: "Shoulder", created_at: "2024-01-01" }];
    locals.supabase = createMockSupabase({ data: bodyParts, error: null });
    const response = await GET({ locals } as unknown as GetArgs);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(bodyParts);
  });

  it("returns 502 on Supabase error", async () => {
    locals.supabase = createMockSupabase({ data: null, error: { message: "db error" } });
    const response = await GET({ locals } as unknown as GetArgs);
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("Failed to fetch body parts");
    expect(body.details).toBe("db error");
  });

  it("returns 500 on unexpected error", async () => {
    locals.supabase = {
      ...locals.supabase,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(new Error("unexpected")), // throws
        }),
      }),
    } as unknown as Supabase;
    const response = await GET({ locals } as unknown as GetArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
  });
});
