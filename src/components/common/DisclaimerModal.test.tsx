import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { DisclaimerModal, type DisclaimerModalProps } from "./DisclaimerModal";

// Mock Modal and Button to avoid external dependencies
vi.mock("@/components/ui/Modal", () => ({
  Modal: ({ open, title, children, footer }: React.PropsWithChildren<{ open: boolean; title: string; footer: React.ReactNode }>) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
}));
vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

const defaultProps: DisclaimerModalProps = {
  open: true,
  onAccept: vi.fn(),
  text: "Dynamic disclaimer text",
};

describe("DisclaimerModal", () => {
  it("renders with open=true and displays title, text, and static list", () => {
    render(<DisclaimerModal {...defaultProps} />);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Medical Disclaimer")).toBeInTheDocument();
    expect(screen.getByText("Dynamic disclaimer text")).toBeInTheDocument();
    expect(screen.getByText("Consult a healthcare professional before performing any exercises.")).toBeInTheDocument();
    expect(screen.getByText("Stop immediately if you experience pain or discomfort.")).toBeInTheDocument();
    expect(screen.getByText("These exercises are suggestions, not personalized medical advice.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
  });

  it("does not render when open=false", () => {
    render(<DisclaimerModal {...defaultProps} open={false} text="Should not be visible" />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    expect(screen.queryByText("Should not be visible")).not.toBeInTheDocument();
  });

  it("calls onAccept when the button is clicked", () => {
    const onAccept = vi.fn();
    render(<DisclaimerModal {...defaultProps} onAccept={onAccept} text="Test" />);
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    expect(onAccept).toHaveBeenCalled();
  });
});
