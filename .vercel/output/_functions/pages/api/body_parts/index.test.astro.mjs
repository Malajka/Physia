import { vi, describe, beforeEach, it, expect } from "vitest";
import { G as GET } from "../../../chunks/index_CC1zGFZV.mjs";
export { renderers } from "../../../renderers.mjs";

vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn) => fn,
}));
function createMockSupabase({ data, error }) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
  };
}
describe("GET /api/body_parts", () => {
  let locals;
  beforeEach(() => {
    locals = { supabase: createMockSupabase({ data: [], error: null }) };
  });
  it("returns 200 and data for valid request", async () => {
    const bodyParts = [{ id: 1, name: "Shoulder", created_at: "2024-01-01" }];
    locals.supabase = createMockSupabase({ data: bodyParts, error: null });
    const response = await GET({ locals });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(bodyParts);
  });
  it("returns 502 on Supabase error", async () => {
    locals.supabase = createMockSupabase({ data: null, error: { message: "db error" } });
    const response = await GET({ locals });
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
          order: vi.fn().mockRejectedValue(new Error("unexpected")),
          // throws
        }),
      }),
    };
    const response = await GET({ locals });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
  });
});

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

const page = () => _page;

export { page };
