import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubmitButton } from "./SubmitButton";

describe("SubmitButton", () => {
  it("renders children", () => {
    render(<SubmitButton>Send</SubmitButton>);
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("has type submit", () => {
    render(<SubmitButton>Send</SubmitButton>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "submit");
  });

  it("shows loading text and disables when loading", () => {
    render(<SubmitButton loading>Send</SubmitButton>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/processing/i);
  });

  it("forwards onClick and className props", () => {
    const onClick = vi.fn();
    render(
      <SubmitButton onClick={onClick} className="custom-class">
        Go
      </SubmitButton>
    );
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
    expect(btn.className).toMatch(/custom-class/);
  });
});
