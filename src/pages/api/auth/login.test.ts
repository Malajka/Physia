import type { AuthCredentialsDto } from "@/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./login";

const validCredentials: AuthCredentialsDto = { email: "test@example.com", password: "password123" };
const validSession = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expires_in: 3600,
};
const validUser = { id: "user-id", email: validCredentials.email };

interface MockRequest {
  json: () => Promise<unknown>;
}

interface MockCookies {
  set: (name: string, value: string, options: Record<string, unknown>) => void;
}

interface SupabaseAuth {
  signInWithPassword: (params: {
    email: string;
    password: string;
  }) => Promise<{ data: { user: typeof validUser; session: typeof validSession } | null; error: { message: string } | null }>;
}

interface Locals {
  supabase: {
    auth: SupabaseAuth;
  };
}

function createMockRequest(json: unknown): MockRequest {
  return {
    json: vi.fn().mockResolvedValue(json),
  };
}

function createMockCookies(): MockCookies {
  return {
    set: vi.fn(),
  };
}

describe("POST /api/auth/login", () => {
  let locals: Locals;
  let cookies: MockCookies;

  beforeEach(() => {
    cookies = createMockCookies();
    locals = {
      supabase: {
        auth: {
          signInWithPassword: vi.fn(),
        },
      },
    };
  });

  it("returns 200 and sets cookies on valid login", async () => {
    const request = createMockRequest(validCredentials);
    (locals.supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: validUser, session: validSession },
      error: null,
    });
    const response = await POST({ request, locals, cookies } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.user).toEqual(validUser);
    expect(body.session).toEqual(validSession);
    expect(cookies.set).toHaveBeenCalledWith("sb-access-token", validSession.access_token, expect.any(Object));
    expect(cookies.set).toHaveBeenCalledWith("sb-refresh-token", validSession.refresh_token, expect.any(Object));
  });

  it("returns 401 on invalid credentials", async () => {
    const request = createMockRequest(validCredentials);
    (locals.supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });
    const response = await POST({ request, locals, cookies } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Invalid login credentials");
  });

  it("returns 400 on validation error", async () => {
    // Missing password
    const request = createMockRequest({ email: "test@example.com" });
    const response = await POST({ request, locals, cookies } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Password is required/);
  });

  it("returns 400 on invalid JSON payload", async () => {
    // request.json throws
    const request: MockRequest = { json: vi.fn().mockRejectedValue(new Error("bad json")) };
    const response = await POST({ request, locals, cookies } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid JSON payload");
  });

  it("returns 500 on unexpected error", async () => {
    // Force an error after validation
    const request = createMockRequest(validCredentials);
    (locals.supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("supabase down"));
    const response = await POST({ request, locals, cookies } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toMatch(/supabase down/);
  });

  it("returns 500 and generic message if unexpected error is not an Error instance", async () => {
    const request = createMockRequest(validCredentials);
    // Podmieniamy funkcję, żeby rzucała string zamiast Error
    (locals.supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw "some string error";
    });
    const response = await POST({ request, locals, cookies } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("An unexpected error occurred");
  });
});
