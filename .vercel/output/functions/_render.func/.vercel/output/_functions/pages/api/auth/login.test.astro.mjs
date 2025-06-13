import { describe, beforeEach, vi, it, expect } from 'vitest';
import { P as POST } from '../../../chunks/login_BdxDrYKl.mjs';
export { renderers } from '../../../renderers.mjs';

const validCredentials = { email: "test@example.com", password: "password123" };
const validSession = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expires_in: 3600
};
const validUser = { id: "user-id", email: validCredentials.email };
function createMockRequest(json) {
  return {
    json: vi.fn().mockResolvedValue(json)
  };
}
function createMockCookies() {
  return {
    set: vi.fn()
  };
}
describe("POST /api/auth/login", () => {
  let locals;
  let cookies;
  beforeEach(() => {
    cookies = createMockCookies();
    locals = {
      supabase: {
        auth: {
          signInWithPassword: vi.fn()
        }
      }
    };
  });
  it("returns 200 and sets cookies on valid login", async () => {
    const request = createMockRequest(validCredentials);
    locals.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: validUser, session: validSession },
      error: null
    });
    const response = await POST({ request, locals});
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.user).toEqual(validUser);
    expect(body.session).toEqual(validSession);
    expect(cookies.set).toHaveBeenCalledWith("sb-access-token", validSession.access_token, expect.any(Object));
    expect(cookies.set).toHaveBeenCalledWith("sb-refresh-token", validSession.refresh_token, expect.any(Object));
  });
  it("returns 401 on invalid credentials", async () => {
    const request = createMockRequest(validCredentials);
    locals.supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" }
    });
    const response = await POST({ request, locals});
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Invalid login credentials");
  });
  it("returns 400 on validation error", async () => {
    const request = createMockRequest({ email: "test@example.com" });
    const response = await POST({ request, locals});
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Password is required/);
  });
  it("returns 400 on invalid JSON payload", async () => {
    const request = { json: vi.fn().mockRejectedValue(new Error("bad json")) };
    const response = await POST({ request, locals});
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid JSON payload");
  });
  it("returns 500 on unexpected error", async () => {
    const request = createMockRequest(validCredentials);
    locals.supabase.auth.signInWithPassword.mockRejectedValue(new Error("supabase down"));
    const response = await POST({ request, locals});
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toMatch(/supabase down/);
  });
  it("returns 500 and generic message if unexpected error is not an Error instance", async () => {
    const request = createMockRequest(validCredentials);
    locals.supabase.auth.signInWithPassword.mockImplementation(() => {
      throw "some string error";
    });
    const response = await POST({ request, locals});
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("An unexpected error occurred");
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
