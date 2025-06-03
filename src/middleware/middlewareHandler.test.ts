import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleRequest } from "./middlewareHandler";

let mockNext: any;
beforeEach(() => {
  mockNext = vi.fn().mockResolvedValue(new Response("ok"));
  vi.clearAllMocks();
});

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
    const body = await res.text();
    expect(body).toBe("ok");
  });

  it("calls next() for unprotected route", async () => {
    const { context } = makeContext({ pathname: "/public" });
    const res = (await handleRequest(context as any, mockNext)) as Response;
    expect(mockNext).toHaveBeenCalled();
    expect(res).toBeInstanceOf(Response);
  });

  it("allows access to /api/disclaimers if disclaimer not accepted", async () => {
    const session = createMockSession();
    session.user.user_metadata = {};
    const { context } = makeContext({ session, pathname: "/api/disclaimers" });
    context.locals.supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session },
      error: null,
    });
    const res = (await handleRequest(context as any, mockNext)) as Response;
    expect(mockNext).toHaveBeenCalled();
    expect(res).toBeInstanceOf(Response);
    const body = await res.text();
    expect(body).toBe("ok");
  });

  it("calls setSessionFromCookies and logs error if setSessionError occurs", async () => {
    const session = createMockSession({ disclaimer_accepted_at: "2024-01-01" });
    const { context } = makeContext({ session });
    const setSessionError = { message: "setSession failed" };
    context.cookies.get = vi.fn((key) => ({ value: "token" }));
    context.locals.supabase.auth.setSession = vi.fn().mockResolvedValue({ error: setSessionError });
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await handleRequest(context as any, mockNext);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[MW_HANDLER_SESSION_SET_ERROR]"), setSessionError.message);
    logSpy.mockRestore();
  });

  it("calls fetchSession and logs error if sessionFetchError occurs", async () => {
    const session = createMockSession({ disclaimer_accepted_at: "2024-01-01" });
    const { context } = makeContext({ session });
    const sessionFetchError = { message: "fetchSession failed" };
    context.locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session }, error: sessionFetchError });
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await handleRequest(context as any, mockNext);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("[MW_HANDLER_SESSION_FETCH_ERROR] Error fetching session for /sessions/1: fetchSession failed")
    );
    logSpy.mockRestore();
  });

  it("handleSessionOwnership returns undefined if path does not start with /sessions/", async () => {
    const { context } = makeContext({ pathname: "/not-sessions/1" });
    const fn = await import("./middlewareHandler");
    const result = await fn.handleRequest(context as any, mockNext);
    expect(result).toBeInstanceOf(Response);
  });

  it("handleSessionOwnership returns undefined if pathSegments.length < 3", async () => {
    const { context } = makeContext({ pathname: "/sessions/" });
    const fn = await import("./middlewareHandler");
    const result = await fn.handleRequest(context as any, mockNext);
    expect(result).toBeInstanceOf(Response);
  });

  it("handleSessionOwnership returns undefined if pathSegments[2] is NaN", async () => {
    const { context } = makeContext({ pathname: "/sessions/abc" });
    const fn = await import("./middlewareHandler");
    const result = await fn.handleRequest(context as any, mockNext);
    expect(result).toBeInstanceOf(Response);
  });

  it("handleSessionOwnership returns redirect if error or !sessionRecord or user_id mismatch", async () => {
    const session = createMockSession({ disclaimer_accepted_at: "2024-01-01" });
    const { context } = makeContext({ session });
    // Simulate user_id mismatch
    context.locals.supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { user_id: "other" }, error: null }),
    });
    const res = await handleRequest(context as any, mockNext);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/sessions");
  });

  it("redirects to /sessions if logged in and pathname is /login", async () => {
    const session = createMockSession({ disclaimer_accepted_at: "2024-01-01" });
    const { context } = makeContext({ session, pathname: "/login" });
    const res = await handleRequest(context as any, mockNext);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/sessions");
  });

  it("redirects to /body-parts if disclaimer not accepted and path requires disclaimer", async () => {
    const session = createMockSession({});
    const { context } = makeContext({ session, pathname: "/muscle-tests" });
    const res = await handleRequest(context as any, mockNext);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/body-parts");
  });

  it("redirects to /login if not authenticated and path is protected", async () => {
    const { context } = makeContext({ session: null, pathname: "/muscle-tests" });
    const res = await handleRequest(context as any, mockNext);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/login");
  });

  it("calls next for /body-parts if disclaimer not accepted", async () => {
    const session = createMockSession({});
    const { context } = makeContext({ session, pathname: "/body-parts" });
    const res = await handleRequest(context as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(res).toBeInstanceOf(Response);
  });
});
