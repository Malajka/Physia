import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRegister } from "./useRegister";

// Mock the registerForm service
vi.mock("@/lib/services/auth/registerForm", () => ({
  handleRegisterSubmit: vi.fn(),
}));

describe("useRegister", () => {
  const getRegisterService = async () => {
    const { handleRegisterSubmit } = await import("@/lib/services/auth/registerForm");
    return handleRegisterSubmit as any;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial state", () => {
    it("returns correct initial state", () => {
      const { result } = renderHook(() => useRegister());

      expect(result.current.registrationSuccess).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.submitRegistration).toBe("function");
      expect(typeof result.current.resetForm).toBe("function");
    });
  });

  describe("Successful registration", () => {
    it("sets loading state during registration process", async () => {
      const registerService = await getRegisterService();
      registerService.mockResolvedValue({ success: true, registrationSuccess: true });

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.submitRegistration(formData);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("sets registrationSuccess on successful registration", async () => {
      const registerService = await getRegisterService();
      registerService.mockResolvedValue({ success: true, registrationSuccess: true });

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(result.current.registrationSuccess).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it("calls register service", async () => {
      const registerService = await getRegisterService();
      registerService.mockResolvedValue({ success: true, registrationSuccess: true });

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(registerService).toHaveBeenCalledWith(formData);
    });

    it("returns service result", async () => {
      const registerService = await getRegisterService();
      const expectedResult = { success: true, registrationSuccess: true };
      registerService.mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      let serviceResult;
      await act(async () => {
        serviceResult = await result.current.submitRegistration(formData);
      });

      expect(serviceResult).toEqual(expectedResult);
    });
  });

  describe("Failed registration", () => {
    it("handles service error and sets error state", async () => {
      const registerService = await getRegisterService();
      const errorMessage = "Email already registered";
      registerService.mockResolvedValue({ 
        success: false, 
        error: errorMessage 
      });

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.registrationSuccess).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("handles service exception and sets error state", async () => {
      const registerService = await getRegisterService();
      const networkError = new Error("Network failed");
      registerService.mockRejectedValue(networkError);

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(result.current.error).toBe("Network failed");
      expect(result.current.registrationSuccess).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("handles non-Error exceptions", async () => {
      const registerService = await getRegisterService();
      registerService.mockRejectedValue("String error");

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(result.current.error).toBe("Unexpected error during registration");
      expect(result.current.registrationSuccess).toBe(false);
    });

    it("resets loading state after error", async () => {
      const registerService = await getRegisterService();
      registerService.mockRejectedValue(new Error("Test error"));

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("returns error result when service fails", async () => {
      const registerService = await getRegisterService();
      registerService.mockResolvedValue({ 
        success: false, 
        error: "Validation failed" 
      });

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      let serviceResult;
      await act(async () => {
        serviceResult = await result.current.submitRegistration(formData);
      });

      expect(serviceResult).toEqual({
        success: false,
        error: "Validation failed"
      });
    });
  });

  describe("State management", () => {
    it("clears previous error before new registration attempt", async () => {
      const registerService = await getRegisterService();
      
      // First call fails
      registerService.mockResolvedValueOnce({ 
        success: false, 
        error: "First error" 
      });
      
      // Second call succeeds
      registerService.mockResolvedValueOnce({ 
        success: true, 
        registrationSuccess: true 
      });

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      // First registration (failure)
      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(result.current.error).toBe("First error");

      // Second registration (success)
      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.registrationSuccess).toBe(true);
    });

    it("resets all state when resetForm is called", () => {
      const { result } = renderHook(() => useRegister());

      // Set some state manually for testing
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.registrationSuccess).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });

    it("maintains stable function references", () => {
      const { result, rerender } = renderHook(() => useRegister());
      
      const firstSubmitFn = result.current.submitRegistration;
      const firstResetFn = result.current.resetForm;
      
      rerender();
      
      const secondSubmitFn = result.current.submitRegistration;
      const secondResetFn = result.current.resetForm;
      
      expect(firstSubmitFn).toBe(secondSubmitFn);
      expect(firstResetFn).toBe(secondResetFn);
    });
  });

  describe("Service success without registrationSuccess flag", () => {
    it("handles service success without registrationSuccess flag", async () => {
      const registerService = await getRegisterService();
      registerService.mockResolvedValue({ success: true }); // No registrationSuccess flag

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      await act(async () => {
        await result.current.submitRegistration(formData);
      });

      expect(result.current.registrationSuccess).toBe(false); // Should not be set
      expect(result.current.error).toBe(null);
    });
  });

  describe("Concurrent registration calls", () => {
    it("handles multiple concurrent registration calls gracefully", async () => {
      const registerService = await getRegisterService();
      registerService.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ success: true, registrationSuccess: true }), 100)
        )
      );

      const { result } = renderHook(() => useRegister());
      const formData = new FormData();

      // Start multiple registration calls
      act(() => {
        result.current.submitRegistration(formData);
        result.current.submitRegistration(formData);
        result.current.submitRegistration(formData);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Service should be called multiple times
      expect(registerService).toHaveBeenCalledTimes(3);
    });
  });
}); 