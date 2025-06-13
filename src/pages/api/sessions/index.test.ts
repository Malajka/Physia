import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./index";
import { createSession } from "@/lib/services/session";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { parseAndValidate } from "@/lib/utils/request";
import type { APIContext } from "astro";
import type { CreateSessionCommandDto, SessionDto } from "@/types";
import { ErrorCode } from "@/types";

vi.mock("@/lib/middleware/withAuth", () => ({
  withAuth: (handler: any) => handler,
}));

vi.mock("@/lib/services/session");
const mockedCreateSession = vi.mocked(createSession);

vi.mock("@/lib/utils/api");
const mockedErrorResponse = vi.mocked(errorResponse);
const mockedSuccessResponse = vi.mocked(successResponse);

vi.mock("@/lib/utils/request");
const mockedParseAndValidate = vi.mocked(parseAndValidate);

const createMockContext = (body: any): APIContext =>
  ({
    request: { json: () => Promise.resolve(body) } as Request,
    locals: { supabase: {} },
  }) as unknown as APIContext;

describe("POST /api/session/generate", () => {
  const userId = "user-123";
  const validCommand: CreateSessionCommandDto = {
    muscleTestIds: [1, 2],
    bodyPartId: 1,
  };
  const createdSession: SessionDto = { id: 99, user_id: userId, created_at: "now", body_part_id: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 201 with the created session on success", async () => {
    mockedParseAndValidate.mockResolvedValue(validCommand);
    mockedCreateSession.mockResolvedValue({ session: createdSession, error: null });

    const context = createMockContext(validCommand);
    await POST(context, userId);

    expect(mockedCreateSession).toHaveBeenCalledWith(context.locals.supabase, userId, validCommand);
    expect(mockedSuccessResponse).toHaveBeenCalledWith(createdSession, 201);
  });

  it("should return the response from parseAndValidate on validation failure", async () => {
    const validationErrorResponse = new Response("Bad Request", { status: 400 });
    mockedParseAndValidate.mockRejectedValue(validationErrorResponse);

    const context = createMockContext({});
    const response = await POST(context, userId);

    expect(response).toBe(validationErrorResponse);
    expect(mockedCreateSession).not.toHaveBeenCalled();
  });

  it("should return 403 if disclaimer is required", async () => {
    mockedParseAndValidate.mockResolvedValue(validCommand);
    mockedCreateSession.mockResolvedValue({ session: null, error: "disclaimer_required" });

    const context = createMockContext(validCommand);
    await POST(context, userId);

    expect(mockedErrorResponse).toHaveBeenCalledWith(
      ErrorCode.DISCLAIMER_REQUIRED,
      "User must accept the medical disclaimer before creating a session",
      403
    );
  });

  it("should return 404 if a resource is not found", async () => {
    const notFoundError = "Muscle test 999 not found";
    mockedParseAndValidate.mockResolvedValue(validCommand);
    mockedCreateSession.mockResolvedValue({ session: null, error: notFoundError });

    const context = createMockContext(validCommand);
    await POST(context, userId);

    expect(mockedErrorResponse).toHaveBeenCalledWith(ErrorCode.RESOURCE_NOT_FOUND, notFoundError, 404);
  });

  it("should return 500 on a generic service error", async () => {
    mockedParseAndValidate.mockResolvedValue(validCommand);
    mockedCreateSession.mockResolvedValue({ session: null, error: "Some other DB error" });

    const context = createMockContext(validCommand);
    await POST(context, userId);

    expect(mockedErrorResponse).toHaveBeenCalledWith(ErrorCode.SERVER_ERROR, "An error occurred while creating the session", 500);
  });

  it("should return 500 on an unexpected exception", async () => {
    const unexpectedError = new Error("Something broke");
    mockedParseAndValidate.mockRejectedValue(unexpectedError);

    const context = createMockContext(validCommand);
    await POST(context, userId);

    expect(mockedErrorResponse).toHaveBeenCalledWith(ErrorCode.SERVER_ERROR, "Unexpected error", 500);
  });
});
