import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleRequest } from "./middlewareHandler";

function createMockContext({
  pathname = "/sessions/1",
  session = null,
  disclaimerAccepted = true,
  sessionOwner = true,
  cookies = {},
} = {}) {
  const getSession = vi.fn().mockResolvedValue({
    data: { session },
    error: null,
  });
  const setSession = vi.fn();
  const select = vi.fn().mockReturnThis();
  const eq = vi.fn().mockReturnThis();
  const single = vi.fn().mockResolvedValue({
    data: sessionOwner ? { user_id: session?.user.id } : { user_id: "other-user" },
    error: sessionOwner ? null : "error",
  });
  const from = vi.fn().mockImplementation(() => ({ select, eq, single }));
  const supabase = { auth: { getSession, setSession }, from };
  const context = {
    locals: {},
    cookies: {
      get: vi.fn((key) => ({ value: cookies[key] })),
    },
    request: { url: `http://localhost${pathname}` },
  };
  // @ts-ignore
  context.locals.supabase = supabase;
  return { context, supabase, getSession, setSession, select, eq, single };
}

describe("middleware handleRequest", () => {
  let next;
  beforeEach(() => {
    next = vi.fn().mockResolvedValue(new Response("ok"));
  });

  it("redirects to /login if no session", async () => {
    const { context } = createMockContext({ session: null });
    const res = await handleRequest(context, next);
    expect(res.headers.get("Location")).toBe("/login");
    expect(res.status).toBe(302);
  });

  it("redirects to /body-parts if disclaimer not accepted", async () => {
    const session = { user: { id: "user-1", user_metadata: {} } };
    const { context } = createMockContext({ session, disclaimerAccepted: false });
    // Patch user_metadata to not have disclaimer_accepted_at
    context.locals.supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: { user: { id: "user-1", user_metadata: {} } } },
      error: null,
    });
    const res = await handleRequest(context, next);
    expect(res.headers.get("Location")).toBe("/body-parts");
    expect(res.status).toBe(302);
  });

  it("redirects to /sessions if not session owner", async () => {
    const session = { user: { id: "user-1", user_metadata: { disclaimer_accepted_at: "2024-01-01" } } };
    const { context } = createMockContext({ session, sessionOwner: false });
    const res = await handleRequest(context, next);
    expect(res.headers.get("Location")).toBe("/sessions");
    expect(res.status).toBe(302);
  });

  it("calls next() for valid session and owner", async () => {
    const session = { user: { id: "user-1", user_metadata: { disclaimer_accepted_at: "2024-01-01" } } };
    const { context } = createMockContext({ session });
    const res = await handleRequest(context, next);
    expect(next).toHaveBeenCalled();
    expect(res).toBeInstanceOf(Response);
    const text = await res.text();
    expect(text).toBe("ok");
  });

  it("calls next() for unprotected route", async () => {
    const { context } = createMockContext({ pathname: "/public" });
    const res = await handleRequest(context, next);
    expect(next).toHaveBeenCalled();
    expect(res).toBeInstanceOf(Response);
  });
}); 