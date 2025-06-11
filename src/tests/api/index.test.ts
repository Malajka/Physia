import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/pages/api/disclaimers/index";

// Types for the mock context and API calls
interface MockSupabase {
  from: ReturnType<typeof vi.fn>;
  auth: {
    getSession: ReturnType<typeof vi.fn>;
    setSession?: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
  };
}

interface MockLocals {
  supabase: MockSupabase;
}

type GetPostArgs = Parameters<typeof GET>[0];

function createMockSession(userMetadata = {}): Session {
  return {
    access_token: "mock-token",
    refresh_token: "mock-refresh",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "user-1",
      user_metadata: userMetadata,
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: "",
      phone: "",
    },
  };
}

// Middleware tests moved to src/middleware/index.test.ts

function createMockSupabase({
  disclaimerContent = "Test disclaimer text",
  getSessionData = { session: { user: { user_metadata: { disclaimer_accepted_at: "2024-01-01" } } } },
  getSessionError = null,
  disclaimerError = null,
  updateUserError = null,
} = {}): MockSupabase {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: disclaimerError ? null : { content: disclaimerContent },
        error: disclaimerError,
      }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: getSessionData,
        error: getSessionError,
      }),
      updateUser: vi.fn().mockResolvedValue({ error: updateUserError }),
    },
  };
}

describe("/api/disclaimers GET", () => {
  let locals: MockLocals;
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns disclaimer text and accepted_at on success", async () => {
    locals = { supabase: createMockSupabase() };
    const response = await GET({ locals } as unknown as GetPostArgs);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.text).toBe("Test disclaimer text");
    expect(body.accepted_at).toBe("2024-01-01");
  });

  it("returns accepted_at as null if not accepted", async () => {
    const sessionWithoutDisclaimer = createMockSession({});
    locals = {
      supabase: {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { content: "Test disclaimer text" },
            error: null,
          }),
        }),
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: sessionWithoutDisclaimer },
            error: null,
          }),
          updateUser: vi.fn().mockResolvedValue({ error: null }),
        },
      },
    };
    const response = await GET({ locals } as unknown as GetPostArgs);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.accepted_at).toBeNull();
  });

  it("returns 500 if disclaimer fetch fails", async () => {
    locals = { supabase: createMockSupabase({ disclaimerError: null }) };
    locals.supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
    });
    const response = await GET({ locals } as unknown as GetPostArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toMatch(/fail/);
  });
});

describe("/api/disclaimers POST", () => {
  let locals: MockLocals;
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 and accepted_at on success", async () => {
    vi.useFakeTimers();
    const now = new Date("2024-05-25T12:00:00.000Z");
    vi.setSystemTime(now);
    locals = { supabase: createMockSupabase() };
    const response = await POST({ locals } as unknown as GetPostArgs);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.accepted_at).toBe(now.toISOString());
    vi.useRealTimers();
  });

  it("returns 500 if updateUser fails", async () => {
    locals = { supabase: createMockSupabase({ updateUserError: null }) };
    locals.supabase.auth.updateUser = vi.fn().mockResolvedValue({ error: { message: "update failed" } });
    const response = await POST({ locals } as unknown as GetPostArgs);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toMatch(/update failed/);
  });
});
