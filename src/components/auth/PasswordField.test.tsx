import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PasswordField } from "./PasswordField";

describe("PasswordField", () => {
  it("renders input of type password and label", () => {
    render(<PasswordField id="pass" name="password" label="Password" placeholder="Your password" />);
    const input = screen.getByPlaceholderText(/your password/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByLabelText(/^password$/i, { selector: 'input' })).toBeInTheDocument();
  });

  it("toggles password visibility on button click", () => {
    render(<PasswordField id="pass" name="password" label="Password" placeholder="Your password" />);
    const input = screen.getByPlaceholderText(/your password/i);
    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute("type", "text");
    expect(toggleBtn).toHaveAccessibleName(/hide password/i);
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute("type", "password");
  });

  it("calls onChange when value changes", () => {
    const onChange = vi.fn();
    render(<PasswordField id="pass" name="password" label="Password" placeholder="Your password" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/your password/i);
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledWith("abc");
  });
}); 