import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { NavigationNextButton } from "./NavigationNextButton";

// Mock Button to avoid dependency on external UI
vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

describe("NavigationNextButton", () => {
  it("renders disabled when no body part is selected", () => {
    render(<NavigationNextButton selectedBodyPartId={null} />);
    const button = screen.getByRole("button", { name: /next/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("enables and calls onNavigate when a body part is selected", () => {
    const onNavigate = vi.fn();
    render(<NavigationNextButton selectedBodyPartId={5} onNavigate={onNavigate} />);
    const button = screen.getByRole("button", { name: /next/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(onNavigate).toHaveBeenCalledWith(5);
  });

  it("falls back to window.location when onNavigate is not provided", () => {
    const originalLocation = window.location;
    // @ts-expect-error: This is required to mock window.location for the test
    delete window.location;
    // @ts-expect-error: This is required to mock window.location for the test
    window.location = { pathname: "" };
    render(<NavigationNextButton selectedBodyPartId={7} />);
    const button = screen.getByRole("button", { name: /next/i });
    fireEvent.click(button);
    expect(window.location.pathname).toBe("/muscle-tests/7");
    window.location = originalLocation;
  });
});
