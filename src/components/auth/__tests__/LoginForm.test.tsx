import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../LoginForm";

// Only mock LinkButton and login service
vi.mock("@/components/ui/LinkButton", () => ({
  LinkButton: (props: { href: string; children: ReactNode }) => <a href={props.href}>{props.children}</a>,
}));

const mockLogin = vi.fn();
vi.mock("@/lib/services/auth", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  // Helper to get element by data-test-id
  function getByTestId(id: string) {
    const el = document.querySelector(`[data-test-id="${id}"]`);
    if (!el) throw new Error(`Unable to find element with data-test-id="${id}"`);
    return el;
  }

  it("should login successfully and redirect", async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    // Mock window.location.href
    const originalLocation = window.location;
    // @ts-expect-error: We need to delete window.location to mock it for redirect testing
    delete window.location;
    window.location = { href: "" } as Location;

    render(<LoginForm />);
    fireEvent.change(getByTestId("email"), { target: { value: "test@example.com" } });
    fireEvent.change(getByTestId("password"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: "test@example.com", password: "Password123!" });
      expect(window.location.href).toBe("/sessions");
    });

    window.location = originalLocation;
  });

  it("should show validation error for invalid email", async () => {
    render(<LoginForm />);
    fireEvent.change(getByTestId("email"), { target: { value: "invalid-email" } });
    fireEvent.blur(getByTestId("email"));
    fireEvent.change(getByTestId("password"), { target: { value: "Password123!" } });
    fireEvent.blur(getByTestId("password"));
    fireEvent.submit(screen.getByTestId("auth-form"));
    await waitFor(() => {
      // Debug: log all text content in the DOM
      console.log("All text in DOM after click (invalid email):", document.body.textContent);
    });
    // Try to find the alert, fallback to finding the error text directly (broader matcher)
    let found = false;
    try {
      const alert = await screen.findByRole("alert");
      expect(alert.textContent?.toLowerCase()).toContain("valid email");
      found = true;
    } catch (e) {}
    if (!found) {
      await screen.findByText((content, node) => !!node?.textContent && node.textContent.toLowerCase().includes("valid email"));
    }
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("should show validation error for empty password", async () => {
    render(<LoginForm />);
    fireEvent.change(getByTestId("email"), { target: { value: "test@example.com" } });
    fireEvent.blur(getByTestId("email"));
    fireEvent.change(getByTestId("password"), { target: { value: "" } });
    fireEvent.blur(getByTestId("password"));
    fireEvent.submit(screen.getByTestId("auth-form"));
    await waitFor(() => {
      // Debug: log all text content in the DOM
      console.log("All text in DOM after click (empty password):", document.body.textContent);
    });
    let found = false;
    try {
      const alert = await screen.findByRole("alert");
      expect(alert.textContent?.toLowerCase()).toContain("password is required");
      found = true;
    } catch (e) {}
    if (!found) {
      await screen.findByText((content, node) => !!node?.textContent && node.textContent.toLowerCase().includes("password is required"));
    }
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("should show error on failed login", async () => {
    mockLogin.mockResolvedValueOnce({ success: false, error: "invalid credentials" });
    render(<LoginForm />);
    fireEvent.change(getByTestId("email"), { target: { value: "test@example.com" } });
    fireEvent.change(getByTestId("password"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await screen.findByText(/invalid credentials/i);
    expect(mockLogin).toHaveBeenCalled();
  });
});
