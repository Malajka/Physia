import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PasswordField } from "./PasswordField";
import { InputField } from "@/components/ui";

vi.mock("@/components/ui", () => ({
  InputField: vi.fn(),
}));

const MockedInputField = vi.mocked(InputField);

describe("PasswordField", () => {
  const defaultProps = {
    id: "password-field",
    label: "Password",
    "data-testid": "password-input",
  };

  it("should render with password initially hidden", () => {
    render(<PasswordField {...defaultProps} />);

    expect(MockedInputField).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultProps,
        type: "password",
      }),
      expect.anything()
    );

    const showButton = screen.getByRole("button", { name: "Show password" });
    expect(showButton).toBeInTheDocument();
    expect(showButton).toHaveTextContent("Show");
  });

  it("should toggle password visibility on button click", async () => {
    const user = userEvent.setup();
    render(<PasswordField {...defaultProps} />);

    const button = screen.getByRole("button", { name: "Show password" });

    await user.click(button);

    expect(MockedInputField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "text",
      }),
      expect.anything()
    );
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

    await user.click(button);

    expect(MockedInputField).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "password",
      }),
      expect.anything()
    );
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("should forward all relevant props to the underlying InputField", () => {
    const allProps = {
      id: "custom-id",
      name: "custom-name",
      label: "Custom Label",
      required: true,
      placeholder: "Enter something",
      value: "initial-value",
      error: "This is an error",
      forceShowError: true,
      "data-testid": "custom-testid",
    };

    render(<PasswordField {...allProps} />);

    expect(MockedInputField).toHaveBeenCalledWith(
      expect.objectContaining({
        ...allProps,
        type: "password",
      }),
      expect.anything()
    );
  });
});
