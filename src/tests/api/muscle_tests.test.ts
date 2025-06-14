import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./muscle_tests";
import { jsonResponse } from "@/lib/utils/response";
import type { APIContext } from "astro";

vi.mock("@/lib/middleware/withAuth", () => ({
  withAuth: (handler: any) => handler,
}));

vi.mock("@/lib/utils/response", () => ({
  jsonResponse: vi.fn(),
}));

const mockedJsonResponse = vi.mocked(jsonResponse);

const mockSupabaseSelect = {
  eq: vi.fn(),
};

const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => mockSupabaseSelect),
  })),
};

const createMockContext = (params: Record<string, string | undefined>): APIContext =>
  ({
    params,
    locals: {
      supabase: mockSupabaseClient,
    },
  }) as unknown as APIContext;

describe("GET /api/body_parts/[body_part_id]/muscle_tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with data for a valid body_part_id", async () => {
    const mockData = [{ id: 1, name: "Test" }];
    mockSupabaseSelect.eq.mockResolvedValue({ data: mockData, error: null });

    const context = createMockContext({ body_part_id: "1" });
    await GET(context);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("muscle_tests");
    expect(mockSupabaseSelect.eq).toHaveBeenCalledWith("body_part_id", 1);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ data: mockData }, 200);
  });

  it("should return 400 for an invalid body_part_id", async () => {
    const context = createMockContext({ body_part_id: "invalid" });
    await GET(context);

    expect(mockedJsonResponse).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid body_part_id" }), 400);
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });
});
