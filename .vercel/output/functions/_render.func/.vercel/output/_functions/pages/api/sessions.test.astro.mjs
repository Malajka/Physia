import { p as parseAndValidate, c as createSession, P as POST } from '../../chunks/index_Dds9DCN5.mjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';
export { renderers } from '../../renderers.mjs';

vi.mock("@/lib/services/session", () => ({
  createSession: vi.fn()
}));
vi.mock("@/lib/utils/request", () => ({
  parseAndValidate: vi.fn()
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
function createMockRequest(json) {
  return {
    json: vi.fn().mockResolvedValue(json),
    url: "http://localhost/api/sessions",
    headers: new Headers()
  };
}
describe("POST /api/sessions", () => {
  let locals;
  let request;
  beforeEach(() => {
    locals = { supabase: createMockSupabase() };
    vi.resetAllMocks();
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-id" } } }, error: null });
  });
  it("returns 201 and session on valid creation", async () => {
    const command = { body_part_id: 1, tests: [{ muscle_test_id: 2, pain_intensity: 5 }] };
    const session = {
      id: 1,
      body_part_id: 1,
      user_id: "user-id",
      disclaimer_accepted_at: "2024-01-01",
      created_at: "2024-01-01",
      training_plan: {},
      session_tests: [],
      feedback_rating: null
    };
    vi.mocked(parseAndValidate).mockResolvedValue(command);
    vi.mocked(createSession).mockResolvedValue({ session, error: null });
    request = createMockRequest(command);
    const response = await POST({ request, locals });
    const raw = await response.text();
    const body = JSON.parse(raw);
    expect(response.status).toBe(201);
    expect(body).toEqual(session);
  });
  it("returns 403 if disclaimer required", async () => {
    const command = { body_part_id: 1, tests: [{ muscle_test_id: 2, pain_intensity: 5 }] };
    vi.mocked(parseAndValidate).mockResolvedValue(command);
    vi.mocked(createSession).mockResolvedValue({ session: null, error: "disclaimer_required" });
    request = createMockRequest(command);
    const response = await POST({ request, locals });
    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.error.code).toBe("disclaimer_required");
  });
  it("returns 404 if not found error", async () => {
    const command = { body_part_id: 1, tests: [{ muscle_test_id: 2, pain_intensity: 5 }] };
    vi.mocked(parseAndValidate).mockResolvedValue(command);
    vi.mocked(createSession).mockResolvedValue({ session: null, error: "body part not found" });
    request = createMockRequest(command);
    const response = await POST({ request, locals });
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body.error.code).toBe("resource_not_found");
  });
  it("returns 500 on generic server error", async () => {
    const command = { body_part_id: 1, tests: [{ muscle_test_id: 2, pain_intensity: 5 }] };
    vi.mocked(parseAndValidate).mockResolvedValue(command);
    vi.mocked(createSession).mockResolvedValue({ session: null, error: "something else" });
    request = createMockRequest(command);
    const response = await POST({ request, locals });
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error.code).toBe("server_error");
  });
  it("returns 400 on validation error", async () => {
    vi.mocked(parseAndValidate).mockRejectedValue(
      new Response(JSON.stringify({ error: { code: "validation_failed", message: "validation" } }), { status: 400 })
    );
    request = createMockRequest({});
    const response = await POST({ request, locals });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("validation_failed");
  });
  it("returns 400 on invalid JSON", async () => {
    vi.mocked(parseAndValidate).mockRejectedValue(
      new Response(JSON.stringify({ error: { code: "validation_failed", message: "Invalid JSON in request body" } }), { status: 400 })
    );
    request = createMockRequest("bad json");
    const response = await POST({ request, locals });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("validation_failed");
  });
  it("returns 401 if not authenticated", async () => {
    locals = { supabase: createMockSupabase({ session: null }) };
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    const command = { body_part_id: 1, tests: [{ muscle_test_id: 2, pain_intensity: 5 }] };
    vi.mocked(parseAndValidate).mockResolvedValue(command);
    request = createMockRequest(command);
    const response = await POST({ request, locals });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("authentication_required");
  });
  it("returns 500 if session error", async () => {
    locals = { supabase: createMockSupabase({ error: { message: "session error" } }) };
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-id" } } }, error: { message: "session error" } });
    const command = { body_part_id: 1, tests: [{ muscle_test_id: 2, pain_intensity: 5 }] };
    vi.mocked(parseAndValidate).mockResolvedValue(command);
    request = createMockRequest(command);
    const response = await POST({ request, locals });
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
