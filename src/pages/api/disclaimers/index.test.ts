import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./index";
import { jsonResponse } from "@/lib/utils/response";
import type { APIContext } from "astro";
import type { SupabaseClient, User } from "@supabase/supabase-js";

vi.mock("@/lib/middleware/withAuth", () => ({
  withAuth: vi.fn((handler) => handler),
}));

vi.mock("@/lib/utils/response", () => ({
  jsonResponse: vi.fn(),
}));

const mockedJsonResponse = vi.mocked(jsonResponse);

const mockSingle = vi.fn();
const mockUpdateUser = vi.fn();
const mockRefreshSession = vi.fn();

const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: mockSingle,
        })),
      })),
    })),
  })),
  auth: {
    updateUser: mockUpdateUser,
    refreshSession: mockRefreshSession,
  },
} as unknown as SupabaseClient;

const createMockContext = (user: Partial<User>): APIContext =>
  ({
    locals: {
      supabase: mockSupabaseClient,
      user: user as User,
    },
  }) as unknown as APIContext;

describe("GET /api/disclaimers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with content and acceptance date if user accepted", async () => {
    const mockUser = { user_metadata: { disclaimer_accepted_at: "2024-01-01T12:00:00Z" } };
    mockSingle.mockResolvedValue({ data: { content: "Disclaimer text" }, error: null });

    const context = createMockContext(mockUser);
    await GET(context);

    expect(mockedJsonResponse).toHaveBeenCalledWith({ text: "Disclaimer text", accepted_at: "2024-01-01T12:00:00Z" }, 200);
  });

  it("should return 200 with content and null if user has not accepted", async () => {
    const mockUser = { user_metadata: {} };
    mockSingle.mockResolvedValue({ data: { content: "Disclaimer text" }, error: null });

    const context = createMockContext(mockUser);
    await GET(context);

    expect(mockedJsonResponse).toHaveBeenCalledWith({ text: "Disclaimer text", accepted_at: null }, 200);
  });

  it("should return 500 if fetching disclaimer content fails", async () => {
    const dbError = { message: "Database query failed" };
    mockSingle.mockResolvedValue({ data: null, error: dbError });

    const context = createMockContext({ user_metadata: {} });
    await GET(context);

    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Database query failed" }, 500);
  });
});

describe("POST /api/disclaimers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should update user, refresh session, and return 201 on success", async () => {
    const fakeNow = new Date("2024-06-13T10:00:00Z");
    vi.setSystemTime(fakeNow);

    mockUpdateUser.mockResolvedValue({ error: null });
    mockRefreshSession.mockResolvedValue({ data: {}, error: null });

    const context = createMockContext({});
    await POST(context);

    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { disclaimer_accepted_at: fakeNow.toISOString() },
    });
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ accepted_at: fakeNow.toISOString() }, 201);
  });

  it("should return 500 if updating user metadata fails", async () => {
    const updateError = { message: "Update failed" };
    mockUpdateUser.mockResolvedValue({ error: updateError });

    const context = createMockContext({});
    await POST(context);

    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Update failed" }, 500);
    expect(mockRefreshSession).not.toHaveBeenCalled();
  });
});
