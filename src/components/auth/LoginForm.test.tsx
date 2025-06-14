import { handleLoginSubmit } from "@/lib/services/auth";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthForm } from "./AuthForm";
import { LoginForm } from "./LoginForm";

vi.mock("./AuthForm");
vi.mock("@/lib/services/auth");

const MockedAuthForm = vi.mocked(AuthForm);

describe("LoginForm", () => {
  it("should render AuthForm with correct login-specific props and fields", () => {
    MockedAuthForm.mockImplementation(({ children, ...props }) => {
      const { onSubmit, ...formProps } = props;
      return (
        <form
          data-testid="auth-form-mock"
          {...formProps}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(new FormData(e.currentTarget));
          }}
        >
          {children}
        </form>
      );
    });

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
