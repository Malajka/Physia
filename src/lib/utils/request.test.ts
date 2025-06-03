import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseAndValidate } from "./request";

const schema = z.object({ foo: z.string() });

describe("parseAndValidate", () => {
  it("parses and validates a valid request", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseAndValidate(req, schema);
    expect(result).toEqual({ foo: "bar" });
  });

  it("throws errorResponse for invalid JSON", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    await expect(parseAndValidate(req, schema)).rejects.toMatchObject({ status: 400 });
  });

  it("throws errorResponse for validation error", async () => {
    const req = new Request("http://localhost/", {
      method: "POST",
      body: JSON.stringify({ foo: 123 }),
      headers: { "Content-Type": "application/json" },
    });
    await expect(parseAndValidate(req, schema)).rejects.toMatchObject({ status: 400 });
  });
});
