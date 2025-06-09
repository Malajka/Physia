import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/pages/api/auth/logout";

// --- Types ---
interface MockCookies {
  delete: (name: string, options: { path: string }) => void;
}

interface SupabaseAuth {
  signOut: () => Promise<{ error: { message: string } | null }>;
}

interface Locals {
  supabase: {
    auth: SupabaseAuth;
  };
}

type PostArgs = Parameters<typeof POST>[0];

function createMockCookies(): MockCookies {
  return {
    delete: vi.fn(),
  };
}

describe("POST /api/auth/logout", () => {
  let locals: Locals;
  let cookies: MockCookies;

  beforeEach(() => {
    cookies = createMockCookies();
    locals = {
      supabase: {
        auth: {
          signOut: vi.fn(),
        },
      },
    };
  });

  it("returns 200 and deletes cookies on successful logout", async () => {
    (locals.supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
    const response = await POST({ locals, cookies } as PostArgs);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(cookies.delete).toHaveBeenCalledWith("sb-access-token", { path: "/" });
    expect(cookies.delete).toHaveBeenCalledWith("sb-refresh-token", { path: "/" });
  });

  it("returns 500 and error message if signOut fails", async () => {
    (locals.supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({ error: { message: "logout failed" } });
    const response = await POST({ locals, cookies } as PostArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("logout failed");
  });

  it("returns 500 and error message on unexpected error", async () => {
    (locals.supabase.auth.signOut as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("unexpected"));
    const response = await POST({ locals, cookies } as PostArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toMatch(/unexpected/);
  });

  it("returns 500 and default error message if thrown value is not an Error", async () => {
    (locals.supabase.auth.signOut as ReturnType<typeof vi.fn>).mockRejectedValue("not-an-error");
    const response = await POST({ locals, cookies } as PostArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Failed to log out");
  });
});
