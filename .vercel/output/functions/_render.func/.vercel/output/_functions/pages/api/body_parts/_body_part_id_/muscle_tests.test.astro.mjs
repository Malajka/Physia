import { describe, beforeEach, vi, it, expect } from 'vitest';
import { G as GET } from '../../../../chunks/muscle_tests_c4D4WmNG.mjs';
export { renderers } from '../../../../renderers.mjs';

function createMockSupabase({ data, error }) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error })
      })
    }),
    auth: {
      // Domyślnie symulujemy zalogowanego użytkownika, aby testy mogły skupić się na logice endpointu.
      // Poszczególne testy mogą nadpisać ten mock, jeśli testują scenariusze autentykacji.
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "test-user-id" } } }, error: null })
    }
  };
}
function createMockApiContext(params, locals, method = "GET", pathnameSuffix = "") {
  const requestUrl = `http://localhost/api/body_parts/${params.body_part_id || "test"}${pathnameSuffix}`;
  const request = new Request(requestUrl, { method, headers: new Headers() });
  request.json = vi.fn();
  request.text = vi.fn();
  request.arrayBuffer = vi.fn();
  request.formData = vi.fn();
  return {
    locals,
    params,
    request,
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn()
    },
    // Bardziej precyzyjny typ dla mocka
    redirect: vi.fn((path, status) => new Response(null, { status: status || 302, headers: { Location: path } })),
    clientAddress: "127.0.0.1"
    // site: new URL("http://localhost"),
  };
}
describe("GET /api/body_parts/[body_part_id]/muscle_tests", () => {
  let locals;
  beforeEach(() => {
    locals = { supabase: createMockSupabase({ data: [], error: null }) };
    vi.clearAllMocks();
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: "test-user-id" } } }, error: null });
  });
  it("returns 200 and data for valid body_part_id", async () => {
    const muscleTests = [{ id: 1, body_part_id: 2, name: "Test", description: "desc", created_at: "2024-01-01" }];
    locals.supabase = createMockSupabase({ data: muscleTests, error: null });
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");
    const response = await GET(context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(muscleTests);
  });
  it("returns 400 on invalid body_part_id", async () => {
    const params = { body_part_id: "not-a-number" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");
    const response = await GET(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid body_part_id");
  });
  it("returns 502 on Supabase error", async () => {
    locals.supabase = createMockSupabase({ data: null, error: { message: "db error" } });
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");
    const response = await GET(context);
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("Failed to fetch muscle tests");
    expect(body.details).toBe("db error");
  });
  it("returns 500 on unexpected error (e.g., non-Supabase error in handler)", async () => {
    locals.supabase = {
      ...locals.supabase,
      // Zachowaj mock auth
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error("unexpected database crash"))
        })
      }),
      auth: locals.supabase.auth
      // Upewnij się, że auth jest zachowane
    };
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");
    const response = await GET(context);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
  });
  it("returns 401 if not authenticated (withAuth check)", async () => {
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");
    const response = await GET(context);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("authentication_required");
  });
  it("returns 500 if session retrieval error in withAuth", async () => {
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: { message: "session retrieval failed" } });
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");
    const response = await GET(context);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("server_error");
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
