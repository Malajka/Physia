import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

// Mock the loginForm service
vi.mock("@/lib/services/auth/loginForm", () => ({
  handleLoginSubmit: vi.fn(),
}));

describe("LoginForm", () => {
  describe("UI Rendering", () => {
    it("renders all form elements correctly", () => {
      render(<LoginForm />);

      expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
      expect(screen.getByTestId("email")).toBeInTheDocument();
      expect(screen.getByTestId("password")).toBeInTheDocument();
      expect(screen.getByTestId("login-submit")).toBeInTheDocument();
    });

    it("renders email field with correct attributes", () => {
      render(<LoginForm />);

      const emailField = screen.getByTestId("email");
      expect(emailField).toHaveAttribute("type", "email");
      expect(emailField).toHaveAttribute("name", "email");
      expect(emailField).toHaveAttribute("placeholder", "your@email.com");
      expect(emailField).toHaveAttribute("required");
    });

    it("renders password field with correct attributes", () => {
      render(<LoginForm />);

      const passwordField = screen.getByTestId("password");
      expect(passwordField).toHaveAttribute("type", "password");
      expect(passwordField).toHaveAttribute("name", "password");
      expect(passwordField).toHaveAttribute("placeholder", "Your password");
      expect(passwordField).toHaveAttribute("required");
    });

    it("renders submit button with correct text", () => {
      render(<LoginForm />);

      const submitButton = screen.getByTestId("login-submit");
      expect(submitButton).toHaveTextContent("Log In");
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("displays initial error when provided", () => {
      const errorMessage = "Test error message";
      render(<LoginForm initialError={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("does not display error when no initial error provided", () => {
      render(<LoginForm />);

      // Should not have any error alert visible
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Form Structure", () => {
    it("renders form with correct attributes", () => {
      render(<LoginForm />);

      const form = screen.getByTestId("auth-form");
      expect(form).toHaveAttribute("novalidate");
    });

    it("has proper form accessibility", () => {
      render(<LoginForm />);

      const emailField = screen.getByTestId("email");
      const passwordField = screen.getByTestId("password");

      expect(emailField).toHaveAttribute("aria-required", "true");
      expect(passwordField).toHaveAttribute("aria-required", "true");
    });

    it("integrates with AuthForm component", () => {
      render(<LoginForm />);

      // Check that AuthForm elements are present
      expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
      expect(screen.getByTestId("auth-form")).toBeInTheDocument();
      expect(screen.getByTestId("login-submit")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("handles null initial error", () => {
      render(<LoginForm initialError={null} />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("handles undefined initial error", () => {
      render(<LoginForm initialError={undefined} />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("handles empty string initial error", () => {
      render(<LoginForm initialError="" />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("handles multiple error messages", () => {
      const errorMessage = "Multiple error messages combined";
      render(<LoginForm initialError={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("passes correct props to AuthForm", () => {
      const initialError = "Test error";
      render(<LoginForm initialError={initialError} />);

      // Verify AuthForm receives correct props by checking rendered output
      expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
      expect(screen.getByText(initialError)).toBeInTheDocument();
      expect(screen.getByTestId("login-submit")).toHaveTextContent("Log In");
    });

    it("renders all child components", () => {
      render(<LoginForm />);

      // Check that all child components are rendered
      expect(screen.getByTestId("email")).toBeInTheDocument(); // InputField
      expect(screen.getByTestId("password")).toBeInTheDocument(); // PasswordField
    });
  });
});
