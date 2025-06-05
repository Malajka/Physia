import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BodyPartButton } from "./BodyPartButton";

describe("BodyPartButton", () => {
  const defaultProps = {
    id: 1,
    name: "Shoulder",
    selected: false,
    onSelect: vi.fn(),
  };

  it("renders the body part name", () => {
    render(<BodyPartButton {...defaultProps} />);
    expect(screen.getByText("Shoulder")).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const onSelect = vi.fn();
    render(<BodyPartButton {...defaultProps} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("sets aria-pressed according to selected", () => {
    const { rerender } = render(<BodyPartButton {...defaultProps} selected={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    rerender(<BodyPartButton {...defaultProps} selected={true} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("sets aria-label with the body part name", () => {
    render(<BodyPartButton {...defaultProps} name="Knee" />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Select Knee");
  });

  it("applies the correct CSS class depending on selected", () => {
    const { rerender } = render(<BodyPartButton {...defaultProps} selected={false} />);
    expect(screen.getByRole("button").className).toMatch(/bg-gray-50/);
    rerender(<BodyPartButton {...defaultProps} selected={true} />);
    expect(screen.getByRole("button").className).toMatch(/bg-primary/);
  });

  it("renders nothing if name is not provided", () => {
    const { container } = render(<BodyPartButton {...defaultProps} name={""} />);
    expect(container).toBeEmptyDOMElement();
  });
});
