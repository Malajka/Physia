import type { AuthCredentialsDto } from "@/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./register";

const validCredentials: AuthCredentialsDto = { email: "test@example.com", password: "password1234" };
const validUser = { id: "user-id", email: validCredentials.email };

interface MockRequest {
  json: () => Promise<unknown>;
  url?: string;
}

interface SupabaseAuth {
  signUp: (params: {
    email: string;
    password: string;
    options: { emailRedirectTo: string };
  }) => Promise<{ data: { user: typeof validUser } | null; error: { message: string } | null }>;
}

interface Locals {
  supabase: {
    auth: SupabaseAuth;
  };
}

type PostArgs = Parameters<typeof POST>[0];

function createMockRequest(json: unknown, url = "http://localhost/register"): MockRequest {
  return {
    json: vi.fn().mockResolvedValue(json),
    url,
  };
}

describe("POST /api/auth/register", () => {
  let locals: Locals;

  beforeEach(() => {
    locals = {
      supabase: {
        auth: {
          signUp: vi.fn(),
        },
      },
    };
  });

  it("returns 200 and user on valid registration", async () => {
    const request = createMockRequest(validCredentials);
    (locals.supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: validUser },
      error: null,
    });
    const response = await POST({ request, locals } as PostArgs);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.user).toEqual(validUser);
    expect(body.message).toMatch(/Registration successful/);
  });

  it("returns 409 on duplicate email", async () => {
    const request = createMockRequest(validCredentials);
    (locals.supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: "Email already registered" },
    });
    const response = await POST({ request, locals } as PostArgs);
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toMatch(/already registered/i);
  });

  it("returns 400 on other signup error", async () => {
    const request = createMockRequest(validCredentials);
    (locals.supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: "Something else went wrong" },
    });
    const response = await POST({ request, locals } as PostArgs);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Something else went wrong");
  });

  it("returns 400 on validation error", async () => {
    // Password too short
    const request = createMockRequest({ email: "test@example.com", password: "123" });
    const response = await POST({ request, locals } as PostArgs);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Password must be at least 8 characters long/);
  });

  it("returns 400 on invalid JSON payload", async () => {
    // request.json throws
    const request: MockRequest = { json: vi.fn().mockRejectedValue(new Error("bad json")), url: "http://localhost/register" };
    const response = await POST({ request, locals } as PostArgs);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid JSON payload");
  });

  it("returns 500 on unexpected error", async () => {
    const request = createMockRequest(validCredentials);
    (locals.supabase.auth.signUp as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("unexpected"));
    const response = await POST({ request, locals } as PostArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toMatch(/unexpected/);
  });

  it("returns 500 and default error message if thrown value is not an Error", async () => {
    const request = createMockRequest(validCredentials);
    (locals.supabase.auth.signUp as ReturnType<typeof vi.fn>).mockRejectedValue("not-an-error");
    const response = await POST({ request, locals } as PostArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("An unexpected error occurred");
  });
});
