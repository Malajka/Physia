import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputField } from "./InputField";

// Mock ErrorAlert to avoid rendering its internals
vi.mock("@/components/ui/ErrorAlert", () => ({
  ErrorAlert: ({ errors }: { errors: string }) => <div data-testid="error-alert">{errors}</div>,
}));

describe("InputField", () => {
  const baseProps = {
    id: "test-input",
    label: "Test Label",
    value: "",
    onChange: vi.fn(),
  };

  it("renders label and input", () => {
    render(<InputField {...baseProps} />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows required asterisk if required", () => {
    render(<InputField {...baseProps} required />);
    expect(screen.getByText("*", { exact: false })).toBeInTheDocument();
  });

  it("calls onChange when value changes", () => {
    render(<InputField {...baseProps} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(baseProps.onChange).toHaveBeenCalledWith("abc");
  });

  it("shows error after blur if error prop is set", () => {
    render(<InputField {...baseProps} error="Error!" />);
    const input = screen.getByRole("textbox");
    fireEvent.blur(input);
    expect(screen.getByTestId("error-alert")).toHaveTextContent("Error!");
  });

  it("sets accessibility attributes correctly", () => {
    render(<InputField {...baseProps} required error="err" />);
    const input = screen.getByRole("textbox");
    fireEvent.blur(input);
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
  });
});
