import { ErrorCode } from "@/types";
import type { APIRoute } from "astro";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { withAuth } from "./withAuth";

// Mock dependencies
vi.mock("@/lib/utils/api", () => ({
  errorResponse: vi.fn((code, message, status) => 
    new Response(JSON.stringify({ error: { code, message } }), { status })
  ),
}));

type APIRouteContext = Parameters<APIRoute>[0];

describe("withAuth", () => {
  let mockHandler: Mock;
  let mockContext: APIRouteContext;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockHandler = vi.fn();
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
    };
    
    mockContext = {
      locals: {
        supabase: mockSupabase,
      },
    } as APIRouteContext;
  });

  describe("Success scenarios", () => {
    it("calls handler with context and userId when session is valid", async () => {
      const userId = "user-123";
      const mockSession = {
        user: { id: userId },
      };
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      const expectedResponse = new Response("success");
      mockHandler.mockReturnValue(expectedResponse);
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(mockSupabase.auth.getSession).toHaveBeenCalledOnce();
      expect(mockHandler).toHaveBeenCalledWith(mockContext, userId);
      expect(result).toBe(expectedResponse);
    });

    it("returns handler response when authentication succeeds", async () => {
      const userId = "user-456";
      const mockSession = {
        user: { id: userId },
      };
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      const handlerResponse = new Response(JSON.stringify({ success: true }), { status: 200 });
      mockHandler.mockReturnValue(handlerResponse);
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(result).toBe(handlerResponse);
      expect(mockHandler).toHaveBeenCalledWith(mockContext, userId);
    });
  });

  describe("Error scenarios", () => {
    it("returns server error when supabase client is unavailable", async () => {
      const contextWithoutSupabase = {
        locals: {
          supabase: null,
        },
      } as APIRouteContext;
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(contextWithoutSupabase);
      
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(500);
      
      const responseBody = await result.json();
      expect(responseBody).toEqual({
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: "Server configuration error: Supabase client unavailable"
        }
      });
      
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("returns server error when supabase client is undefined", async () => {
      const contextWithUndefinedSupabase = {
        locals: {
          supabase: undefined,
        },
      } as APIRouteContext;
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(contextWithUndefinedSupabase);
      
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(500);
      
      const responseBody = await result.json();
      expect(responseBody.error.code).toBe(ErrorCode.SERVER_ERROR);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("returns server error when getSession fails", async () => {
      const sessionError = new Error("Database connection failed");
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: sessionError,
      });
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(500);
      
      const responseBody = await result.json();
      expect(responseBody).toEqual({
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: "Failed to retrieve session"
        }
      });
      
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("returns authentication required when session is null", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(401);
      
      const responseBody = await result.json();
      expect(responseBody).toEqual({
        error: {
          code: ErrorCode.AUTHENTICATION_REQUIRED,
          message: "Authentication required"
        }
      });
      
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("returns authentication required when session is undefined", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: undefined },
        error: null,
      });
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(result.status).toBe(401);
      
      const responseBody = await result.json();
      expect(responseBody.error.code).toBe(ErrorCode.AUTHENTICATION_REQUIRED);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("handles empty user object in session", async () => {
      const mockSession = {
        user: { id: "" }, // Empty user ID
      };
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      const mockResponse = new Response("handled");
      mockHandler.mockReturnValue(mockResponse);
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext, "");
      expect(result).toBe(mockResponse);
    });

    it("handles session with complex user object", async () => {
      const complexUser = {
        id: "user-789",
        email: "test@example.com",
        metadata: { role: "admin" },
      };
      
      const mockSession = {
        user: complexUser,
        expires_at: Date.now() + 3600000,
      };
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      const mockResponse = new Response("complex user handled");
      mockHandler.mockReturnValue(mockResponse);
      
      const wrappedHandler = withAuth(mockHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(mockHandler).toHaveBeenCalledWith(mockContext, complexUser.id);
      expect(result).toBe(mockResponse);
    });
  });

  describe("Type safety", () => {
    it("preserves handler return type", async () => {
      const userId = "user-type-test";
      const mockSession = {
        user: { id: userId },
      };
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      // Handler that returns a specific response type
      const specificHandler = vi.fn().mockReturnValue(
        new Response(JSON.stringify({ custom: "data" }), { 
          status: 201,
          headers: { "Custom-Header": "value" }
        })
      );
      
      const wrappedHandler = withAuth(specificHandler);
      const result = await wrappedHandler(mockContext);
      
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(201);
      expect(result.headers.get("Custom-Header")).toBe("value");
      
      const body = await result.json();
      expect(body).toEqual({ custom: "data" });
    });
  });

  describe("Error response integration", () => {
    it("uses errorResponse utility for server errors", async () => {
      const { errorResponse } = await import("@/lib/utils/api");
      
      const contextWithoutSupabase = {
        locals: { supabase: null },
      } as APIRouteContext;
      
      const wrappedHandler = withAuth(mockHandler);
      await wrappedHandler(contextWithoutSupabase);
      
      expect(errorResponse).toHaveBeenCalledWith(
        ErrorCode.SERVER_ERROR,
        "Server configuration error: Supabase client unavailable",
        500
      );
    });

    it("uses errorResponse utility for session errors", async () => {
      const { errorResponse } = await import("@/lib/utils/api");
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error("Test error"),
      });
      
      const wrappedHandler = withAuth(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(errorResponse).toHaveBeenCalledWith(
        ErrorCode.SERVER_ERROR,
        "Failed to retrieve session",
        500
      );
    });

    it("uses errorResponse utility for authentication errors", async () => {
      const { errorResponse } = await import("@/lib/utils/api");
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      
      const wrappedHandler = withAuth(mockHandler);
      await wrappedHandler(mockContext);
      
      expect(errorResponse).toHaveBeenCalledWith(
        ErrorCode.AUTHENTICATION_REQUIRED,
        "Authentication required",
        401
      );
    });
  });
}); 