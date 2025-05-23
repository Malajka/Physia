import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { LoginForm } from "./LoginForm";

// Mock login service
vi.mock("@/lib/services/auth", () => ({
  login: vi.fn(),
}));

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  // @ts-expect-error: We need to delete window.location to mock it for redirect testing
  delete window.location;
  window.location = { href: "" } as Location;
});
afterAll(() => {
  window.location = originalLocation;
});
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

describe("LoginForm", () => {
  it("renders all fields and link", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute("href", "/forgot-password");
  });

  it("shows backend error if login fails", async () => {
    const { login } = await import("@/lib/services/auth");
    (login as Mock).mockResolvedValue({ success: false, error: "Invalid credentials" });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("redirects on successful login", async () => {
    const { login } = await import("@/lib/services/auth");
    (login as Mock).mockResolvedValue({ success: true });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(window.location.href).toBe("/sessions");
    });
  });

  it("shows initial error if provided", () => {
    render(<LoginForm initialError="Test error" />);
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it("shows validation error for empty fields", async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for empty password", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it("password field is of type password", () => {
    render(<LoginForm />);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("disables login button while loading", async () => {
    const { login } = await import("@/lib/services/auth");
    (login as Mock).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ success: false, error: "Invalid" }), 100)));
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
  });

  it("does not call login if validation fails (invalid email)", async () => {
    const { login } = await import("@/lib/services/auth");
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(login).not.toHaveBeenCalled();
    });
  });

  it("does not call login if validation fails (empty fields)", async () => {
    const { login } = await import("@/lib/services/auth");
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(login).not.toHaveBeenCalled();
    });
  });

  it("shows both validation errors when both fields are empty", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows only email required error if password is filled", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
  });

  it("shows only password required error if email is filled", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  it("shows validation error if email field is missing from the form", async () => {
    render(<LoginForm />);
    // Remove email field from DOM
    const emailInput = screen.getByLabelText(/email/i);
    emailInput.parentElement?.removeChild(emailInput);
    fireEvent.change(screen.getByPlaceholderText(/your password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("shows validation error if password field is missing from the form", async () => {
    render(<LoginForm />);
    // Remove password field from DOM
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    passwordInput.parentElement?.removeChild(passwordInput);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  // it("sets aria-invalid on fields with error", async () => {
  //   render(<LoginForm />);
  //   const emailInput = screen.getByLabelText(/email/i);
  //   const passwordInput = screen.getByPlaceholderText(/your password/i);
  //   const submitButton = screen.getByRole("button", { name: /log in/i });

  //   // Clear fields and submit
  //   fireEvent.change(emailInput, { target: { value: "" } });
  //   fireEvent.change(passwordInput, { target: { value: "" } });
  //   fireEvent.click(submitButton);

  //   // Wait for validation errors to appear
  //   await waitFor(() => {
  //     expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  //     expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  //   });

  //   // Check aria-invalid attributes
  //   expect(emailInput).toHaveAttribute("aria-invalid", "true");
  //   expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  // });
});
