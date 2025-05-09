import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
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
});
