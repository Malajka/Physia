import { g as getExercisesForSession, G as GET } from '../../../../chunks/exercises_bPx96JYu.mjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';
export { renderers } from '../../../../renderers.mjs';

vi.mock("@/lib/services/exercises", () => ({
  getExercisesForSession: vi.fn()
}));
function createMockSupabase({
  session = { user: { id: "user-id" } },
  error = null
} = {}) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error })
    }
  };
}
describe("GET /api/sessions/[session_id]/exercises", () => {
  let locals;
  beforeEach(() => {
    locals = { supabase: createMockSupabase() };
    vi.resetAllMocks();
  });
  it("returns 200 and exercises for valid session", async () => {
    locals = { supabase: createMockSupabase() };
    const exercises = [{ id: 1, muscle_test_id: 2, description: "desc", created_at: "2024-01-01", images: [] }];
    getExercisesForSession.mockResolvedValue({ exercises });
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const raw = await response.text();
    const body = JSON.parse(raw);
    expect(response.status).toBe(200);
    expect(body.data).toEqual(exercises);
  });
  it("returns 400 on invalid session_id", async () => {
    locals = { supabase: createMockSupabase() };
    const params = { session_id: "not-a-number" };
    const response = await GET({ locals, params });
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid session_id");
  });
  it("returns 401 if not authenticated", async () => {
    locals = { supabase: createMockSupabase({ session: null }) };
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });
  it("returns 404 if not found", async () => {
    locals = { supabase: createMockSupabase() };
    getExercisesForSession.mockResolvedValue({ exercises: [], error: "Session not found or access denied" });
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const raw = await response.text();
    const body = JSON.parse(raw);
    expect(response.status).toBe(404);
    expect(body.error).toMatch(/not found|no /i);
  });
  it("returns 500 on other error from getExercisesForSession", async () => {
    locals = { supabase: createMockSupabase() };
    getExercisesForSession.mockResolvedValue({ exercises: [], error: "Some other error" });
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const raw = await response.text();
    const body = JSON.parse(raw);
    expect(response.status).toBe(500);
    expect(body.error).toBe("Some other error");
  });
  it("returns 500 on unexpected error", async () => {
    locals = { supabase: createMockSupabase() };
    getExercisesForSession.mockRejectedValue(new Error("unexpected"));
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const raw = await response.text();
    const body = JSON.parse(raw);
    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
    expect(body.details).toMatch(/unexpected/);
  });
  it("returns 500 when auth getSession throws error", async () => {
    const supabase = {
      auth: {
        getSession: vi.fn().mockRejectedValue(new Error("Auth service error"))
      }
    };
    locals = { supabase };
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
    expect(body.details).toBe("Auth service error");
  });
  it("returns 500 when auth getSession returns null sessionResult", async () => {
    const supabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue(null)
      }
    };
    locals = { supabase };
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
    expect(body.details).toBe("No session result");
  });
  it("returns 401 when auth returns error", async () => {
    locals = { supabase: createMockSupabase({ session: { user: { id: "user" } }, error: { message: "Auth error" } }) };
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });
  it("returns 500 on non-Error exception from getExercisesForSession", async () => {
    locals = { supabase: createMockSupabase() };
    getExercisesForSession.mockRejectedValue("String error");
    const params = { session_id: "123" };
    const response = await GET({ locals, params });
    const raw = await response.text();
    const body = JSON.parse(raw);
    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
    expect(body.details).toBe("String error");
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
