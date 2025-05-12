import { handleRequest } from "@/middleware/middlewareHandler";
import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNext = vi.fn().mockResolvedValue(new Response("ok"));

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
      phone: ""
    }
  };
}

function makeContext({
  pathname = "/sessions/1",
  session = null,
  disclaimerAccepted = true,
  sessionOwner = true,
  cookies = {} as Record<string, string>,
}: {
  pathname?: string;
  session?: Session | null;
  disclaimerAccepted?: boolean;
  sessionOwner?: boolean;
  cookies?: Record<string, string>;
} = {}) {
  const getSession = vi.fn().mockResolvedValue({
    data: { session },
    error: null,
  });
  const setSession = vi.fn().mockResolvedValue({ error: null });
  const select = vi.fn().mockReturnThis();
  const eq = vi.fn().mockReturnThis();
  const single = vi.fn().mockResolvedValue({
    data: sessionOwner && session ? { user_id: session.user.id } : { user_id: "other" },
    error: sessionOwner && session ? null : "error",
  });
  const from = vi.fn().mockReturnValue({ select, eq, single });

  const supabase = { auth: { getSession, setSession }, from };

  const context = {
    locals: { supabase },
    cookies: {
      get: vi.fn((key) => ({ value: cookies[key] })),
    },
    request: { url: `http://localhost${pathname}` },
  };
  return { context, supabase, getSession, setSession, select, eq, single };
}

describe("middlewareHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login if not authenticated", async () => {
    const { context } = makeContext({ session: null });
    const res = (await handleRequest(context as any, mockNext)) as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/login");
  });

  it("redirects to /body-parts if disclaimer not accepted", async () => {
    const session = createMockSession();
    const { context } = makeContext({ session, disclaimerAccepted: false });
    context.locals.supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session },
      error: null,
    });
    const res = (await handleRequest(context as any, mockNext)) as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/body-parts");
  });

  it("redirects to /sessions if not session owner", async () => {
    const session = createMockSession({ disclaimer_accepted_at: "2024-01-01" });
    const { context } = makeContext({ session, sessionOwner: false });
    const res = (await handleRequest(context as any, mockNext)) as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/sessions");
  });

  it("calls next() for valid session and owner", async () => {
    const session = createMockSession({ disclaimer_accepted_at: "2024-01-01" });
    const { context } = makeContext({ session });
    const res = (await handleRequest(context as any, mockNext)) as Response;
    expect(mockNext).toHaveBeenCalled();
    expect(res).toBeInstanceOf(Response);
    expect(await res.text()).toBe("ok");
  });

  it("calls next() for unprotected route", async () => {
    const { context } = makeContext({ pathname: "/public" });
    const res = (await handleRequest(context as any, mockNext)) as Response;
    expect(mockNext).toHaveBeenCalled();
    expect(res).toBeInstanceOf(Response);
  });
}); 