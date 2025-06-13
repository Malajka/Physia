import { describe, beforeEach, vi, it, expect } from 'vitest';
import { P as POST } from '../../../chunks/logout_CSnxwm-m.mjs';
export { renderers } from '../../../renderers.mjs';

function createMockCookies() {
  return {
    delete: vi.fn()
  };
}
describe("POST /api/auth/logout", () => {
  let locals;
  let cookies;
  beforeEach(() => {
    cookies = createMockCookies();
    locals = {
      supabase: {
        auth: {
          signOut: vi.fn()
        }
      }
    };
  });
  it("returns 200 and deletes cookies on successful logout", async () => {
    locals.supabase.auth.signOut.mockResolvedValue({ error: null });
    const response = await POST({ locals});
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(cookies.delete).toHaveBeenCalledWith("sb-access-token", { path: "/" });
    expect(cookies.delete).toHaveBeenCalledWith("sb-refresh-token", { path: "/" });
  });
  it("returns 500 and error message if signOut fails", async () => {
    locals.supabase.auth.signOut.mockResolvedValue({ error: { message: "logout failed" } });
    const response = await POST({ locals});
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("logout failed");
  });
  it("returns 500 and error message on unexpected error", async () => {
    locals.supabase.auth.signOut.mockRejectedValue(new Error("unexpected"));
    const response = await POST({ locals});
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toMatch(/unexpected/);
  });
  it("returns 500 and default error message if thrown value is not an Error", async () => {
    locals.supabase.auth.signOut.mockRejectedValue("not-an-error");
    const response = await POST({ locals});
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Failed to log out");
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
