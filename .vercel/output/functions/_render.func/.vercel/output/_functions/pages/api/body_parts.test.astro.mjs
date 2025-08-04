import { vi, describe, beforeEach, it, expect } from 'vitest';
import { G as GET } from '../../chunks/index_CLgpSJUb.mjs';
import { j as jsonResponse } from '../../chunks/response_BJucfPdF.mjs';
export { renderers } from '../../renderers.mjs';

vi.mock("@/lib/middleware/withAuth", () => ({
  withAuth: vi.fn((handler) => handler)
}));
vi.mock("@/lib/utils/response", () => ({
  jsonResponse: vi.fn()
}));
const mockedJsonResponse = vi.mocked(jsonResponse);
const mockSupabaseOrder = {
  order: vi.fn()
};
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => mockSupabaseOrder)
  }))
};
const createMockContext = () => ({
  locals: {
    supabase: mockSupabaseClient
  }
});
describe("GET /api/body_parts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should return 200 with data on a successful request", async () => {
    const mockData = [{ id: 1, name: "Shoulder", created_at: "2024-01-01" }];
    mockSupabaseOrder.order.mockResolvedValue({ data: mockData, error: null });
    const context = createMockContext();
    await GET(context);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("body_parts");
    expect(mockedJsonResponse).toHaveBeenCalledWith({ data: mockData }, 200);
  });
  it("should return 502 when Supabase returns an error", async () => {
    const dbError = { message: "Connection failed" };
    mockSupabaseOrder.order.mockResolvedValue({ data: null, error: dbError });
    const context = createMockContext();
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Failed to fetch body parts", details: "Connection failed" }, 502);
  });
  it("should return 500 on an unexpected database error", async () => {
    mockSupabaseOrder.order.mockRejectedValue(new Error("DB crashed"));
    const context = createMockContext();
    await GET(context);
    expect(mockedJsonResponse).toHaveBeenCalledWith({ error: "Internal server error" }, 500);
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
