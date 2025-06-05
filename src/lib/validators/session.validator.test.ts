import { describe, expect, it } from "vitest";
import { CreateSessionSchema } from "./session.validator";

describe("CreateSessionSchema", () => {
  const validSession = {
    body_part_id: 1,
    tests: [
      { muscle_test_id: 2, pain_intensity: 5 },
      { muscle_test_id: 3, pain_intensity: 0 },
    ],
  };

  it("accepts valid session", () => {
    expect(() => CreateSessionSchema.parse(validSession)).not.toThrow();
  });

  it("rejects missing body_part_id", () => {
    expect(() => CreateSessionSchema.parse({ ...validSession, body_part_id: undefined })).toThrow();
  });

  it("rejects non-positive body_part_id", () => {
    expect(() => CreateSessionSchema.parse({ ...validSession, body_part_id: 0 })).toThrow();
  });

  it("rejects empty tests array", () => {
    expect(() => CreateSessionSchema.parse({ ...validSession, tests: [] })).toThrow();
  });

  it("rejects test with non-positive muscle_test_id", () => {
    const tests = [{ muscle_test_id: 0, pain_intensity: 5 }];
    expect(() => CreateSessionSchema.parse({ ...validSession, tests })).toThrow();
  });

  it("rejects test with pain_intensity < 0", () => {
    const tests = [{ muscle_test_id: 1, pain_intensity: -1 }];
    expect(() => CreateSessionSchema.parse({ ...validSession, tests })).toThrow();
  });

  it("rejects test with pain_intensity > 10", () => {
    const tests = [{ muscle_test_id: 1, pain_intensity: 11 }];
    expect(() => CreateSessionSchema.parse({ ...validSession, tests })).toThrow();
  });
});
