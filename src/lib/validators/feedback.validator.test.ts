import { describe, expect, it } from "vitest";
import { FeedbackBodySchema, FeedbackParamsSchema } from "./feedback.validator";

describe("FeedbackParamsSchema", () => {
  it("accepts valid session_id (number)", () => {
    expect(() => FeedbackParamsSchema.parse({ session_id: 1 })).not.toThrow();
  });
  it("accepts valid session_id (string)", () => {
    expect(() => FeedbackParamsSchema.parse({ session_id: "2" })).not.toThrow();
  });
  it("rejects negative session_id", () => {
    expect(() => FeedbackParamsSchema.parse({ session_id: -1 })).toThrow("session_id must be a positive integer");
  });
  it("rejects non-integer session_id", () => {
    expect(() => FeedbackParamsSchema.parse({ session_id: 1.5 })).toThrow("session_id must be an integer");
  });
  it("rejects non-number string", () => {
    expect(() => FeedbackParamsSchema.parse({ session_id: "abc" })).toThrow("session_id must be a number");
  });
});

describe("FeedbackBodySchema", () => {
  it("accepts rating 0", () => {
    expect(() => FeedbackBodySchema.parse({ rating: 0 })).not.toThrow();
  });
  it("accepts rating 1", () => {
    expect(() => FeedbackBodySchema.parse({ rating: 1 })).not.toThrow();
  });

  it("rejects rating below 0", () => {
    expect(() => FeedbackBodySchema.parse({ rating: -1 })).toThrow();
  });
  it("rejects rating above 1", () => {
    expect(() => FeedbackBodySchema.parse({ rating: 2 })).toThrow();
  });
  it("rejects non-integer rating", () => {
    expect(() => FeedbackBodySchema.parse({ rating: 0.5 })).toThrow();
  });
  it("rejects missing rating", () => {
    expect(() => FeedbackBodySchema.parse({})).toThrow();
  });
});
