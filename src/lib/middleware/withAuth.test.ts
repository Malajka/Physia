import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIRouteContext } from "astro";
import { withAuth } from "./withAuth";
import { errorResponse } from "@/lib/utils/api";
import { ErrorCode } from "@/types";

vi.mock("@/lib/utils/api", () => ({
  errorResponse: vi.fn(),
}));

describe("withAuth middleware", () => {
  const mockHandler = vi.fn();
  const mockSuccessResponse = new Response("Success", { status: 200 });
  const mockErrorResponse = new Response("Unauthorized", { status: 401 });

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandler.mockReturnValue(mockSuccessResponse);
    (errorResponse as vi.Mock).mockReturnValue(mockErrorResponse);
  });

  it("should call the handler with user id when user is authenticated", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const mockContext = {
      locals: { user: mockUser },
    } as unknown as APIRouteContext;

    const protectedRoute = withAuth(mockHandler);
    const result = protectedRoute(mockContext);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(mockContext, mockUser.id);
    expect(errorResponse).not.toHaveBeenCalled();
    expect(result).toBe(mockSuccessResponse);
  });

  it("should return an authentication error when user is null", () => {
    const mockContext = {
      locals: { user: null },
    } as unknown as APIRouteContext;

    const protectedRoute = withAuth(mockHandler);
    const result = protectedRoute(mockContext);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(errorResponse).toHaveBeenCalledTimes(1);
    expect(errorResponse).toHaveBeenCalledWith(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    expect(result).toBe(mockErrorResponse);
  });

  it("should return an authentication error when locals.user is undefined", () => {
    const mockContext = {
      locals: {},
    } as unknown as APIRouteContext;

    const protectedRoute = withAuth(mockHandler);
    const result = protectedRoute(mockContext);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(errorResponse).toHaveBeenCalledTimes(1);
    expect(errorResponse).toHaveBeenCalledWith(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    expect(result).toBe(mockErrorResponse);
  });
});
