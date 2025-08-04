import { l as loginSchema } from '../../../chunks/auth.validator_ZWOtGhyR.mjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ZodError } from 'zod';
import { P as POST } from '../../../chunks/login_BdxDrYKl.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DziWr-Mn.mjs';

vi.mock("@/lib/validators/auth.validator", () => ({
  loginSchema: {
    parse: vi.fn()
  }
}));
const mockedLoginSchemaParse = vi.mocked(loginSchema.parse);
const mockSignInWithPassword = vi.fn();
const mockSupabaseClient = {
  auth: {
    signInWithPassword: mockSignInWithPassword
  }
};
const createMockContext = (body, throwsOnJson = false) => ({
  request: {
    json: throwsOnJson ? vi.fn().mockRejectedValue(new Error("Invalid JSON")) : vi.fn().mockResolvedValue(body)
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
describe("POST /api/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should return 200 with user and session data on successful login", async () => {
    const validCredentials = { email: "test@example.com", password: "password123" };
    const mockUser = { id: "user-id" };
    const mockSession = { access_token: "token" };
    mockedLoginSchemaParse.mockReturnValue(validCredentials);
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    });
    const context = createMockContext(validCredentials);
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.user).toEqual(mockUser);
    expect(body.session).toEqual(mockSession);
    expect(mockSignInWithPassword).toHaveBeenCalledWith(validCredentials);
  });
  it("should return 401 on invalid Supabase credentials", async () => {
    const validCredentials = { email: "test@example.com", password: "password123" };
    const authError = { message: "Invalid login credentials" };
    mockedLoginSchemaParse.mockReturnValue(validCredentials);
    mockSignInWithPassword.mockResolvedValue({ data: null, error: authError });
    const context = createMockContext(validCredentials);
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid login credentials");
  });
  it("should return 400 on a Zod validation error", async () => {
    const validationError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["password"],
        message: "Required"
      }
    ]);
    mockedLoginSchemaParse.mockImplementation(() => {
      throw validationError;
    });
    const context = createMockContext({ email: "test@example.com" });
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe("Required");
  });
  it("should return 400 on invalid JSON payload", async () => {
    const context = createMockContext(null, true);
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid JSON payload");
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
  it("should return 500 on an unexpected error during login", async () => {
    const validCredentials = { email: "test@example.com", password: "password123" };
    const unexpectedError = new Error("Database connection failed");
    mockedLoginSchemaParse.mockReturnValue(validCredentials);
    mockSignInWithPassword.mockRejectedValue(unexpectedError);
    const context = createMockContext(validCredentials);
    const response = await POST(context);
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("Database connection failed");
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
