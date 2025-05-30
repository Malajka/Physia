import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { handleRegisterSubmit } from "./registerForm";

// Mock dependencies
vi.mock("@/lib/services/auth", () => ({
  register: vi.fn(),
}));

vi.mock("@/lib/validators/auth.validator", () => ({
  registerWithConfirmSchema: {
    safeParse: vi.fn(),
  },
}));

describe("handleRegisterSubmit", () => {
  const getRegisterMock = async () => {
    const { register } = await import("@/lib/services/auth");
    return register as Mock;
  };

  const getSchemaMock = async () => {
    const { registerWithConfirmSchema } = await import("@/lib/validators/auth.validator");
    return registerWithConfirmSchema.safeParse as Mock;
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create mock FormData
  const createFormData = (email: string, password: string, passwordConfirm: string): FormData => {
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("passwordConfirm", passwordConfirm);
    return formData;
  };

  describe("Form Data Extraction", () => {
    it("extracts all fields from FormData", async () => {
      const schemaMock = await getSchemaMock();
      const registerMock = await getRegisterMock();
      
      schemaMock.mockReturnValue({ 
        success: true, 
        data: { email: "test@example.com", password: "password123", passwordConfirm: "password123" }
      });
      registerMock.mockResolvedValue({ success: true });

      const formData = createFormData("test@example.com", "password123", "password123");
      await handleRegisterSubmit(formData);

      expect(schemaMock).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password123",
      });
    });

    it("handles missing form fields gracefully", async () => {
      const schemaMock = await getSchemaMock();
      schemaMock.mockReturnValue({ 
        success: false, 
        error: { errors: [{ message: "Email is required" }] }
      });

      const emptyFormData = new FormData();
      const result = await handleRegisterSubmit(emptyFormData);

      expect(schemaMock).toHaveBeenCalledWith({
        email: "",
        password: "",
        passwordConfirm: "",
      });
      expect(result).toEqual({
        success: false,
        error: "Email is required"
      });
    });
  });

  describe("Validation", () => {
    it("returns validation errors when schema fails", async () => {
      const schemaMock = await getSchemaMock();
      schemaMock.mockReturnValue({
        success: false,
        error: { 
          errors: [
            { message: "Please enter a valid email address" },
            { message: "Password must be at least 8 characters long" }
          ]
        }
      });

      const formData = createFormData("invalid-email", "short", "short");
      const result = await handleRegisterSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "Please enter a valid email address, Password must be at least 8 characters long"
      });
    });

    it("handles password mismatch validation error", async () => {
      const schemaMock = await getSchemaMock();
      schemaMock.mockReturnValue({
        success: false,
        error: { 
          errors: [{ message: "Passwords do not match" }]
        }
      });

      const formData = createFormData("test@example.com", "password123", "different");
      const result = await handleRegisterSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "Passwords do not match"
      });
    });

    it("proceeds to registration when validation passes", async () => {
      const schemaMock = await getSchemaMock();
      const registerMock = await getRegisterMock();
      
      const validData = { email: "test@example.com", password: "password123", passwordConfirm: "password123" };
      schemaMock.mockReturnValue({ success: true, data: validData });
      registerMock.mockResolvedValue({ success: true });

      const formData = createFormData(validData.email, validData.password, validData.passwordConfirm);
      await handleRegisterSubmit(formData);

      expect(registerMock).toHaveBeenCalledWith({
        email: validData.email,
        password: validData.password,
      });
    });
  });

  describe("Registration Process", () => {
    beforeEach(async () => {
      const schemaMock = await getSchemaMock();
      schemaMock.mockReturnValue({ 
        success: true, 
        data: { email: "test@example.com", password: "password123", passwordConfirm: "password123" }
      });
    });

    it("returns success with registrationSuccess flag", async () => {
      const registerMock = await getRegisterMock();
      registerMock.mockResolvedValue({ success: true });

      const formData = createFormData("test@example.com", "password123", "password123");
      const result = await handleRegisterSubmit(formData);

      expect(result).toEqual({ 
        success: true, 
        registrationSuccess: true 
      });
    });

    it("handles already registered email error", async () => {
      const registerMock = await getRegisterMock();
      registerMock.mockResolvedValue({ 
        success: false, 
        error: "This email is already registered. Please log in instead.|EMAIL_ALREADY_EXISTS" 
      });

      const formData = createFormData("existing@example.com", "password123", "password123");
      const result = await handleRegisterSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: `This email is already registered. Would you like to <a href="/login" class="text-blue-600 hover:underline">log in</a> instead?`
      });
    });

    it("handles other registration errors", async () => {
      const registerMock = await getRegisterMock();
      registerMock.mockResolvedValue({ 
        success: false, 
        error: "Server error" 
      });

      const formData = createFormData("test@example.com", "password123", "password123");
      const result = await handleRegisterSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "Server error"
      });
    });

    it("handles registration failure without error message", async () => {
      const registerMock = await getRegisterMock();
      registerMock.mockResolvedValue({ success: false });

      const formData = createFormData("test@example.com", "password123", "password123");
      const result = await handleRegisterSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "Registration failed"
      });
    });

    it("handles registration service exceptions", async () => {
      const registerMock = await getRegisterMock();
      registerMock.mockRejectedValue(new Error("Network error"));

      const formData = createFormData("test@example.com", "password123", "password123");
      const result = await handleRegisterSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "Network error"
      });
    });

    it("handles non-Error exceptions", async () => {
      const registerMock = await getRegisterMock();
      registerMock.mockRejectedValue("String error");

      const formData = createFormData("test@example.com", "password123", "password123");
      const result = await handleRegisterSubmit(formData);

      expect(result).toEqual({
        success: false,
        error: "An unexpected error occurred"
      });
    });
  });

  describe("Integration", () => {
    it("handles complete successful flow", async () => {
      const schemaMock = await getSchemaMock();
      const registerMock = await getRegisterMock();
      
      const formData = { email: "user@example.com", password: "validpass123", passwordConfirm: "validpass123" };
      schemaMock.mockReturnValue({ success: true, data: formData });
      registerMock.mockResolvedValue({ success: true });

      const mockFormData = createFormData(formData.email, formData.password, formData.passwordConfirm);
      const result = await handleRegisterSubmit(mockFormData);

      expect(schemaMock).toHaveBeenCalledWith(formData);
      expect(registerMock).toHaveBeenCalledWith({
        email: formData.email,
        password: formData.password,
      });
      expect(result).toEqual({ 
        success: true, 
        registrationSuccess: true 
      });
    });

    it("handles complete failed validation flow", async () => {
      const schemaMock = await getSchemaMock();
      const registerMock = await getRegisterMock();
      
      schemaMock.mockReturnValue({
        success: false,
        error: { errors: [{ message: "Invalid email" }] }
      });

      const formData = createFormData("bad-email", "password", "password");
      const result = await handleRegisterSubmit(formData);

      expect(schemaMock).toHaveBeenCalled();
      expect(registerMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "Invalid email"
      });
    });
  });
}); 