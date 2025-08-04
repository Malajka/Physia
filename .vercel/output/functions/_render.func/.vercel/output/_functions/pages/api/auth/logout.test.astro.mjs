import { vi, describe, beforeEach, it, expect } from 'vitest';
import { P as POST } from '../../../chunks/logout_CSnxwm-m.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DziWr-Mn.mjs';

const mockSignOut = vi.fn();
const mockSupabaseClient = {
  auth: {
    signOut: mockSignOut
  }
};
const createMockContext = () => ({
  request: {
    json: vi.fn()
  },
  locals: {
    supabase: mockSupabaseClient,
    user: null
  },
  site: new URL("http://localhost"),
  generator: "astro",
  url: new URL("http://localhost"),
  params: {},
  props: {},
  redirect: vi.fn(),
  cookies: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
    headers: vi.fn()
  },
  clientAddress: "127.0.0.1",
  rewrite: vi.fn(),
  preferredLocale: "en",
  preferredLocaleList: ["en"],
  currentLocale: "en",
  getActionResult: vi.fn(),
  callAction: vi.fn()
});
describe("POST /api/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should return 200 on successful logout", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    const context = createMockContext();
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
  it("should return 500 if supabase.auth.signOut returns an error", async () => {
    const signOutError = { message: "Failed to invalidate session" };
    mockSignOut.mockResolvedValue({ error: signOutError });
    const context = createMockContext();
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to invalidate session");
  });
  it("should return 500 on an unexpected error during signOut", async () => {
    const unexpectedError = new Error("Network connection failed");
    mockSignOut.mockRejectedValue(unexpectedError);
    const context = createMockContext();
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("Network connection failed");
  });
  it("should return a generic 500 error if thrown value is not an Error instance", async () => {
    mockSignOut.mockRejectedValue("a string error");
    const context = createMockContext();
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to log out");
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
