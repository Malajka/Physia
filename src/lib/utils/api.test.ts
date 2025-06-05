import { ErrorCode } from "@/types";
import { describe, expect, it } from "vitest";
import { errorResponse, successResponse } from "./api";

describe("api utils", () => {
  it("errorResponse returns a JSON error with correct code, message, and status", async () => {
    const res = errorResponse(ErrorCode.VALIDATION_FAILED, "Something went wrong", 400);
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: { code: "validation_failed", message: "Something went wrong" } });
  });

  it("successResponse returns a JSON response with data and status", async () => {
    const data = { foo: 123 };
    const res = successResponse(data, 201);
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(data);
  });

  it("successResponse defaults status to 200", async () => {
    const res = successResponse({ ok: true });
    expect(res.status).toBe(200);
  });
});
