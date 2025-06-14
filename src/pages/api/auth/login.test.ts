import { loginSchema } from "@/lib/validators/auth.validator";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { APIContext, AstroCookies } from "astro";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { POST } from "./login";

vi.mock("@/lib/validators/auth.validator", () => ({
  loginSchema: {
    parse: vi.fn(),
  },
}));
const mockedLoginSchemaParse = vi.mocked(loginSchema.parse);

const mockSignInWithPassword = vi.fn();
const mockSupabaseClient = {
  auth: {
    signInWithPassword: mockSignInWithPassword,
  },
} as unknown as SupabaseClient;

const createMockContext = (body: any | null, throwsOnJson = false): APIContext => ({
  request: {
    json: throwsOnJson ? vi.fn().mockRejectedValue(new Error("Invalid JSON")) : vi.fn().mockResolvedValue(body),
  } as unknown as Request,
  locals: {
    supabase: mockSupabaseClient,
    user: null,
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
    headers: vi.fn(),
  } as unknown as AstroCookies,
  clientAddress: "127.0.0.1",
  rewrite: vi.fn(),
  preferredLocale: "en",
  preferredLocaleList: ["en"],
  currentLocale: "en",
  getActionResult: vi.fn(),
  callAction: vi.fn(),
});

describe("POST /api/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with user and session data on successful login", async () => {
    const validCredentials = { email: "test@example.com", password: "password123" };
    const mockUser = { id: "user-id" } as User;
    const mockSession = { access_token: "token" } as Session;

    mockedLoginSchemaParse.mockReturnValue(validCredentials);
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const context = createMockContext(validCredentials);
    const response = await POST(context as APIContext);
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
    const response = await POST(context as APIContext);
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
        message: "Required",
      },
    ]);
    mockedLoginSchemaParse.mockImplementation(() => {
      throw validationError;
    });

    const context = createMockContext({ email: "test@example.com" });
    const response = await POST(context as APIContext);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Required");
  });

  it("should return 400 on invalid JSON payload", async () => {
    const context = createMockContext(null, true);
    const response = await POST(context as APIContext);
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
    const response = await POST(context as APIContext);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Database connection failed");
  });
});
