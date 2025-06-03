import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.validator";

// Valid credentials
const validEmail = "user@example.com";
const validPassword = "strongpassword";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(() => loginSchema.parse({ email: validEmail, password: validPassword })).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() => loginSchema.parse({ email: "bademail", password: validPassword })).toThrow("Please enter a valid email address");
  });

  it("rejects empty password", () => {
    expect(() => loginSchema.parse({ email: validEmail, password: "" })).toThrow("Password is required");
  });
});

describe("registerSchema", () => {
  it("accepts valid credentials", () => {
    expect(() => registerSchema.parse({ email: validEmail, password: validPassword })).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() => registerSchema.parse({ email: "bademail", password: validPassword })).toThrow("Please enter a valid email address");
  });

  it("rejects short password", () => {
    expect(() => registerSchema.parse({ email: validEmail, password: "short" })).toThrow("Password must be at least 8 characters long");
  });
});
