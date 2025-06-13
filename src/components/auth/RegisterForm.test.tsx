import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./RegisterForm";
import { useRegister } from "@/hooks/useRegister";

vi.mock("@/hooks/useRegister");
const mockedUseRegister = vi.mocked(useRegister);

describe("RegisterForm", () => {
  const mockSubmitRegistration = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseRegister.mockReturnValue({
      registrationSuccess: false,
      error: null,
      submitRegistration: mockSubmitRegistration,
    });
  });

  it("should render the registration form correctly", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByTestId("register-email")).toBeInTheDocument();
    expect(screen.getByTestId("register-password")).toBeInTheDocument();
    expect(screen.getByTestId("register-passwordConfirm")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  });

  it("should call submitRegistration with form data on submit", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const emailInput = screen.getByTestId("register-email");
    const passwordInput = screen.getByTestId("register-password");
    const passwordConfirmInput = screen.getByTestId("register-passwordConfirm");
    const submitButton = screen.getByTestId("register-submit");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(passwordConfirmInput, "password123");
    await user.click(submitButton);

    expect(mockSubmitRegistration).toHaveBeenCalledTimes(1);
  });

  it("should display an error message from the hook", () => {
    mockedUseRegister.mockReturnValue({
      registrationSuccess: false,
      error: "Email already in use",
      submitRegistration: mockSubmitRegistration,
    });
    render(<RegisterForm />);
    expect(screen.getByText("Email already in use")).toBeInTheDocument();
  });

  it("should display the initialError prop if provided", () => {
    render(<RegisterForm initialError="An initial error occurred" />);
    expect(screen.getByText("An initial error occurred")).toBeInTheDocument();
  });

  it("should render the success view when registration is successful", () => {
    mockedUseRegister.mockReturnValue({
      registrationSuccess: true,
      error: null,
      submitRegistration: mockSubmitRegistration,
    });
    render(<RegisterForm />);

    expect(screen.getByRole("heading", { name: "Registration Successful!" })).toBeInTheDocument();
    expect(screen.getByText("Thank you for registering!")).toBeInTheDocument();

    const link = screen.getByTestId("create-new-session-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/body-parts");

    expect(screen.queryByRole("button", { name: "Register" })).not.toBeInTheDocument();
  });
});
