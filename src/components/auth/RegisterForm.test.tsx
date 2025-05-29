import { fireEvent, render, screen } from "@testing-library/react";
import type { Mock } from "vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./RegisterForm";

// Mock the useRegister hook
vi.mock("@/hooks/useRegister", () => ({
  useRegister: vi.fn(),
}));

// Mock Spinner component
vi.mock("@/components/ui/Spinner", () => ({
  Spinner: (props: any) => <span data-testid="spinner" {...props}>spinner</span>,
}));

describe("RegisterForm", () => {
  const getUseRegisterMock = async () => {
    const { useRegister } = await import("@/hooks/useRegister");
    return useRegister as Mock;
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("UI Rendering", () => {
    it("renders all form fields", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/min\. 8 characters/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });

    it("renders login link", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/log in here/i)).toBeInTheDocument();
    });

    it("renders password requirement text", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });

    it("displays initialError prop", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm initialError="Initial error message" />);
      
      expect(screen.getByText(/initial error message/i)).toBeInTheDocument();
    });

    it("displays hook error over initialError", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: "Hook error message",
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm initialError="Initial error message" />);
      
      expect(screen.getByText(/hook error message/i)).toBeInTheDocument();
      expect(screen.queryByText(/initial error message/i)).not.toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    it("renders success screen when registration succeeds", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: true,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
      expect(screen.getByText(/thank you for registering/i)).toBeInTheDocument();
      expect(screen.getByTestId("create-new-session-link")).toBeInTheDocument();
    });

    it("success screen has correct link attributes", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: true,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      const link = screen.getByTestId("create-new-session-link");
      expect(link).toHaveTextContent("Create First Session");
      expect(link).toHaveAttribute("href", "/body-parts");
    });

    it("does not render form when showing success", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: true,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      expect(screen.queryByRole("button", { name: /register/i })).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("calls submitRegistration when form is submitted", async () => {
      const useRegisterMock = await getUseRegisterMock();
      const mockSubmit = vi.fn();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: mockSubmit,
      });

      render(<RegisterForm />);
      
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByPlaceholderText(/min\. 8 characters/i), { target: { value: "password123" } });
      fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "password123" } });
      fireEvent.click(screen.getByRole("button", { name: /register/i }));

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith(expect.any(FormData));
    });

    it("form inputs have correct attributes", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      const emailInput = screen.getByTestId("register-email");
      const passwordInput = screen.getByTestId("register-password");
      const confirmInput = screen.getByTestId("register-passwordConfirm");

      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
      expect(emailInput).toBeRequired();

      expect(passwordInput).toHaveAttribute("name", "password");
      expect(passwordInput).toBeRequired();

      expect(confirmInput).toHaveAttribute("name", "passwordConfirm");
      expect(confirmInput).toBeRequired();
    });

    it("submit button has correct attributes", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      const submitButton = screen.getByTestId("register-submit");
      expect(submitButton).toHaveTextContent("Register");
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Hook Integration", () => {
    it("integrates with useRegister hook", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      expect(useRegisterMock).toHaveBeenCalled();
    });

    it("reflects different hook states", async () => {
      const useRegisterMock = await getUseRegisterMock();
      
      // Test error state
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: "Registration failed",
        submitRegistration: vi.fn(),
      });

      const { unmount } = render(<RegisterForm />);
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      unmount();

      // Test success state
      useRegisterMock.mockReturnValue({
        registrationSuccess: true,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    it("passes correct props to AuthForm", async () => {
      const useRegisterMock = await getUseRegisterMock();
      const mockSubmit = vi.fn();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: "Test error",
        submitRegistration: mockSubmit,
      });

      render(<RegisterForm initialError="Initial error" />);
      
      // Should prioritize hook error over initialError
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
      expect(screen.queryByText(/initial error/i)).not.toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("handles undefined initialError", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });

    it("handles null initialError", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm initialError={null} />);
      
      expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("form has proper structure", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: false,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByTestId("register-password")).toBeInTheDocument();
      expect(screen.getByTestId("register-passwordConfirm")).toBeInTheDocument();
    });

    it("success screen is accessible", async () => {
      const useRegisterMock = await getUseRegisterMock();
      useRegisterMock.mockReturnValue({
        registrationSuccess: true,
        error: null,
        submitRegistration: vi.fn(),
      });

      render(<RegisterForm />);
      
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Registration Successful!");
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/body-parts");
    });
  });
});
