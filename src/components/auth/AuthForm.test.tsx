import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "./AuthForm";
import { useAuthForm } from "@/hooks/useAuthForm";

vi.mock("@/hooks/useAuthForm");
const mockedUseAuthForm = vi.mocked(useAuthForm);

describe("AuthForm", () => {
  const mockHandleSubmit = vi.fn((e) => e.preventDefault());

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuthForm.mockReturnValue({
      loading: false,
      errors: [],
      handleSubmit: mockHandleSubmit,
    });
  });

  it("should render correctly with initial props", () => {
    render(
      <AuthForm title="Test Title" onSubmit={vi.fn()} submitText="Submit Me">
        <input data-testid="child-input" />
      </AuthForm>
    );

    expect(screen.getByRole("heading", { name: "Test Title" })).toBeInTheDocument();
    expect(screen.getByTestId("child-input")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Me" })).not.toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should call handleSubmit on form submission", async () => {
    const user = userEvent.setup();
    render(
      <AuthForm title="Test" onSubmit={vi.fn()} submitText="Submit" submitTestId="submit-btn">
        <div />
      </AuthForm>
    );

    await user.click(screen.getByTestId("submit-btn"));

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should display a loading state and disable the button", () => {
    mockedUseAuthForm.mockReturnValue({
      loading: true,
      errors: [],
      handleSubmit: mockHandleSubmit,
    });

    render(
      <AuthForm title="Test" onSubmit={vi.fn()} submitText="Submit" submitTestId="submit-btn">
        <div />
      </AuthForm>
    );

    const submitButton = screen.getByTestId("submit-btn");
    expect(submitButton).toBeDisabled();

    const buttonWithLoadingText = screen.getByRole("button", { name: "Processing..." });
    expect(buttonWithLoadingText).toBeInTheDocument();
  });

  it("should display errors returned from the useAuthForm hook", () => {
    mockedUseAuthForm.mockReturnValue({
      loading: false,
      errors: ["Invalid email", "Password is too short"],
      handleSubmit: mockHandleSubmit,
    });

    render(
      <AuthForm title="Test" onSubmit={vi.fn()} submitText="Submit">
        <div />
      </AuthForm>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.getByText("Password is too short")).toBeInTheDocument();
  });

  it("should pass initialErrors to the useAuthForm hook", () => {
    const initialError = "An initial error from props";
    render(
      <AuthForm title="Test" onSubmit={vi.fn()} submitText="Submit" errors={initialError}>
        <div />
      </AuthForm>
    );

    expect(mockedUseAuthForm).toHaveBeenCalledWith(expect.any(Function), initialError);
  });
});
