import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { handleLoginSubmit } from "./loginForm";

// Mock dependencies
vi.mock("@/lib/services/auth", () => ({
  login: vi.fn(),
}));

vi.mock("@/lib/validators/auth.validator", () => ({
  loginSchema: {
    safeParse: vi.fn(),
  },
}));

beforeEach(() => {
  // @ts-expect-error: Need to delete window.location to mock it
  delete window.location;
  window.location = { href: "" } as Location;
});

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to create mock FormData
const createFormData = (email: string, password: string): FormData => {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
};

describe("handleLoginSubmit", () => {
  const getLoginMock = async () => {
    const { login } = await import("@/lib/services/auth");
    return login as Mock;
  };

  const getSchemaMock = async () => {
    const { loginSchema } = await import("@/lib/validators/auth.validator");
    return loginSchema.safeParse as Mock;
  };

  describe("Form Data Extraction", () => {
    it("extracts email and password from FormData", async () => {
      const schemaMock = await getSchemaMock();
      const loginMock = await getLoginMock();

      schemaMock.mockReturnValue({ success: true, data: { email: "test@example.com", password: "password123" } });
      loginMock.mockResolvedValue({ success: true });

      const formData = createFormData("test@example.com", "password123");
      await handleLoginSubmit(formData);

      expect(schemaMock).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("handles missing form fields gracefully", async () => {
      const schemaMock = await getSchemaMock();
      schemaMock.mockReturnValue({
        success: false,
        error: { errors: [{ message: "Email is required" }, { message: "Password is required" }] },
      });

      const emptyFormData = new FormData();
      const result = await handleLoginSubmit(emptyFormData);

      expect(schemaMock).toHaveBeenCalledWith({
        email: "",
        password: "",
      });
      expect(result).toEqual({
        success: false,
        error: "Email is required, Password is required",
      });
    });
  });

  describe("Validation", () => {
    it("returns validation errors when schema fails", async () => {
      const schemaMock = await getSchemaMock();
      schemaMock.mockReturnValue({
        success: false,
        error: {
          errors: [{ message: "Please enter a valid email address" }, { message: "Password is required" }],
        },
      });

      const formData = createFormData("invalid-email", "");
      const result = await handleLoginSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "Please enter a valid email address, Password is required",
      });
    });

    it("handles single validation error", async () => {
      const schemaMock = await getSchemaMock();
      schemaMock.mockReturnValue({
        success: false,
        error: {
          errors: [{ message: "Please enter a valid email address" }],
        },
      });

      const formData = createFormData("invalid-email", "password123");
      const result = await handleLoginSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "Please enter a valid email address",
      });
    });

    it("proceeds to login when validation passes", async () => {
      const schemaMock = await getSchemaMock();
      const loginMock = await getLoginMock();

      const validCredentials = { email: "test@example.com", password: "password123" };
      schemaMock.mockReturnValue({ success: true, data: validCredentials });
      loginMock.mockResolvedValue({ success: true });

      const formData = createFormData(validCredentials.email, validCredentials.password);
      await handleLoginSubmit(formData);

      expect(loginMock).toHaveBeenCalledWith(validCredentials);
    });
  });

  describe("Authentication", () => {
    beforeEach(async () => {
      const schemaMock = await getSchemaMock();
      schemaMock.mockReturnValue({
        success: true,
        data: { email: "test@example.com", password: "password123" },
      });
    });

    it("returns success result when login succeeds", async () => {
      const loginMock = await getLoginMock();
      loginMock.mockResolvedValue({ success: true });

      const formData = createFormData("test@example.com", "password123");
      const result = await handleLoginSubmit(formData);

      expect(result).toEqual({ success: true });
    });

    it("redirects to sessions page on successful login", async () => {
      const loginMock = await getLoginMock();
      loginMock.mockResolvedValue({ success: true });

      const formData = createFormData("test@example.com", "password123");
      await handleLoginSubmit(formData);

      expect(window.location.href).toBe("/sessions");
    });

    it("returns error result when login fails", async () => {
      const loginMock = await getLoginMock();
      loginMock.mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      const formData = createFormData("test@example.com", "wrong-password");
      const result = await handleLoginSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "Invalid credentials",
      });
    });

    it("does not redirect on failed login", async () => {
      const loginMock = await getLoginMock();
      loginMock.mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      const formData = createFormData("test@example.com", "wrong-password");
      await handleLoginSubmit(formData);

      expect(window.location.href).toBe("");
    });

    it("propagates login service errors", async () => {
      const loginMock = await getLoginMock();
      loginMock.mockRejectedValue(new Error("Network error"));

      const formData = createFormData("test@example.com", "password123");

      await expect(handleLoginSubmit(formData)).rejects.toThrow("Network error");
    });
  });

  describe("Integration", () => {
    it("handles complete successful flow", async () => {
      const schemaMock = await getSchemaMock();
      const loginMock = await getLoginMock();

      const credentials = { email: "user@example.com", password: "validpass" };
      schemaMock.mockReturnValue({ success: true, data: credentials });
      loginMock.mockResolvedValue({ success: true });

      const formData = createFormData(credentials.email, credentials.password);
      const result = await handleLoginSubmit(formData);

      expect(schemaMock).toHaveBeenCalledWith(credentials);
      expect(loginMock).toHaveBeenCalledWith(credentials);
      expect(result).toEqual({ success: true });
      expect(window.location.href).toBe("/sessions");
    });

    it("handles complete failed validation flow", async () => {
      const schemaMock = await getSchemaMock();
      const loginMock = await getLoginMock();

      schemaMock.mockReturnValue({
        success: false,
        error: { errors: [{ message: "Invalid email" }] },
      });

      const formData = createFormData("bad-email", "password");
      const result = await handleLoginSubmit(formData);

      expect(schemaMock).toHaveBeenCalled();
      expect(loginMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "Invalid email",
      });
      expect(window.location.href).toBe("");
    });
  });
});
