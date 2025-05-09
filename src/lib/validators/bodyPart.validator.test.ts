import { describe, expect, it } from "vitest";
import {
    BodyPartDtoArraySchema,
    BodyPartDtoSchema,
    BodyPartIdSchema,
    validateBodyPartId,
    validateBodyPartsDto,
} from "./bodyPart.validator";

const validBodyPart = {
  id: 1,
  name: "Shoulder",
  created_at: "2024-01-01T00:00:00Z",
};

describe("BodyPartIdSchema", () => {
  it("accepts positive integer", () => {
    expect(() => BodyPartIdSchema.parse(5)).not.toThrow();
    expect(() => BodyPartIdSchema.parse("7")).not.toThrow();
  });
  it("rejects non-integer", () => {
    expect(() => BodyPartIdSchema.parse(1.5)).toThrow("bodyPartId must be an integer");
  });
  it("rejects negative number", () => {
    expect(() => BodyPartIdSchema.parse(-2)).toThrow("bodyPartId must be a positive integer");
  });
  it("rejects non-number string", () => {
    expect(() => BodyPartIdSchema.parse("abc")).toThrow("bodyPartId must be a number");
  });
});

describe("validateBodyPartId", () => {
  it("parses valid string to number", () => {
    expect(validateBodyPartId("10")).toBe(10);
  });
  it("throws for invalid string", () => {
    expect(() => validateBodyPartId("-1")).toThrow();
  });
});

describe("BodyPartDtoSchema", () => {
  it("accepts valid BodyPartDto", () => {
    expect(() => BodyPartDtoSchema.parse(validBodyPart)).not.toThrow();
  });
  it("rejects missing fields", () => {
    expect(() => BodyPartDtoSchema.parse({ id: 1, name: "Shoulder" })).toThrow();
  });
  it("rejects negative id", () => {
    expect(() => BodyPartDtoSchema.parse({ ...validBodyPart, id: -1 })).toThrow();
  });
});

describe("BodyPartDtoArraySchema", () => {
  it("accepts array of valid BodyPartDto", () => {
    expect(() => BodyPartDtoArraySchema.parse([validBodyPart])).not.toThrow();
  });
  it("rejects array with invalid BodyPartDto", () => {
    expect(() => BodyPartDtoArraySchema.parse([{ ...validBodyPart, id: 0 }])).toThrow();
  });
});

describe("validateBodyPartsDto", () => {
  it("returns array for valid input", () => {
    expect(validateBodyPartsDto([validBodyPart])).toEqual([validBodyPart]);
  });
  it("throws for invalid input", () => {
    expect(() => validateBodyPartsDto([{ ...validBodyPart, id: 0 }])).toThrow();
  });
}); 