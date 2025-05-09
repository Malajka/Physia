import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./disclaimers";

// Mock Supabase auth
const mockUpdateUser = vi.fn();
const mockGetSession = vi.fn();
const mockSupabase = {
  auth: {
    updateUser: mockUpdateUser,
    getSession: mockGetSession,
  },
};

const locals = { supabase: mockSupabase };

function createMockRequest() {
  return {} as Request;
}

describe("POST /api/disclaimers (MVP happy path)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUpdateUser.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: "user-id", user_metadata: {} } } }, error: null });
  });

  it("returns 201 and accepted_at on valid acceptance", async () => {
    const request = createMockRequest();
    const response = await POST({ request, locals } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(typeof body.accepted_at).toBe("string");
    // Optionally: check that accepted_at is a valid ISO string
    expect(new Date(body.accepted_at).toISOString()).toBe(body.accepted_at);
    expect(mockUpdateUser).toHaveBeenCalledWith({ data: { disclaimer_accepted_at: body.accepted_at } });
  });
});
