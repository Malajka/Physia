import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";
import { AuthForm } from "./AuthForm";
import { handleLoginSubmit } from "@/lib/services/auth";

vi.mock("./AuthForm");
vi.mock("@/lib/services/auth");

const MockedAuthForm = vi.mocked(AuthForm);

describe("LoginForm", () => {
  it("should render AuthForm with correct login-specific props and fields", () => {
    MockedAuthForm.mockImplementation(({ children, ...props }) => (
      <form data-testid="auth-form-mock" {...props}>
        {children}
      </form>
    ));

    render(<LoginForm />);

    expect(MockedAuthForm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Log In",
        onSubmit: handleLoginSubmit,
        submitText: "Log In",
        errors: null,
      }),
      expect.anything()
    );

    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
  });

  it("should correctly pass the initialError prop to AuthForm", () => {
    const errorMessage = "Invalid credentials";
    render(<LoginForm initialError={errorMessage} />);

    expect(MockedAuthForm).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: errorMessage,
      }),
      expect.anything()
    );
  });
});
