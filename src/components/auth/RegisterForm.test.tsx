import { fireEvent, render, screen } from "@testing-library/react";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./RegisterForm";

vi.mock("@/lib/services/auth", () => ({
  register: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RegisterForm", () => {
  it("renders all fields and button", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min\. 8 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("shows error for short password", async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/min\. 8 characters/i), { target: { value: "short" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it("shows error for mismatched passwords", async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/min\. 8 characters/i), { target: { value: "abcdefgh" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows success message after successful registration", async () => {
    const { register } = await import("@/lib/services/auth");
    (register as unknown as Mock).mockResolvedValue({ success: true });
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/min\. 8 characters/i), { target: { value: "abcdefgh" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "abcdefgh" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(await screen.findByText(/registration successful/i)).toBeInTheDocument();
  });

  it("shows backend error if registration fails", async () => {
    const { register } = await import("@/lib/services/auth");
    (register as unknown as Mock).mockResolvedValue({ success: false, error: "Email already registered" });
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/min\. 8 characters/i), { target: { value: "abcdefgh" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "abcdefgh" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(await screen.findByText(/already registered/i)).toBeInTheDocument();
  });
});
