import { describe, expect, it } from "vitest";
import { jsonResponse } from "./response";

describe("jsonResponse", () => {
  it("returns a Response with JSON body and correct status", async () => {
    const data = { foo: "bar" };
    const res = jsonResponse(data, 201);
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    const json = await res.json();
    expect(json).toEqual(data);
  });
  it("defaults status to 200 if not provided", async () => {
    const res = jsonResponse({ ok: true });
    expect(res.status).toBe(200);
  });
});
