import type { AuthFormSubmitResult } from "@/hooks/useAuthForm";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AuthForm } from "./AuthForm";

// Mock hook useAuthForm
vi.mock("@/lib/hooks/useAuthForm", () => {
  return {
    useAuthForm: (onSubmit: (formData: FormData) => Promise<AuthFormSubmitResult>, initialErrors: string[] | string | null) => ({
      loading: false,
      errors: initialErrors,
      handleSubmit: (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new window.FormData(e.currentTarget);
        onSubmit(formData);
      },
    }),
  };
});

describe("AuthForm", () => {
  it("renders title and children", () => {
    render(
      <AuthForm title="Logowanie" onSubmit={vi.fn()} submitText="Zaloguj">
        <input name="email" />
      </AuthForm>
    );
    expect(screen.getByText("Logowanie")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zaloguj/i })).toBeInTheDocument();
  });

  it("renders errors if provided", () => {
    render(
      <AuthForm title="Tytuł" onSubmit={vi.fn()} submitText="Wyślij" errors={["Błąd 1", "Błąd 2"]}>
        <input name="test" />
      </AuthForm>
    );
    expect(screen.getByText("Błąd 1")).toBeInTheDocument();
    expect(screen.getByText("Błąd 2")).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true });
    render(
      <AuthForm title="Tytuł" onSubmit={onSubmit} submitText="Wyślij">
        <input name="test" defaultValue="abc" />
      </AuthForm>
    );
    fireEvent.submit(screen.getByTestId("auth-form"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
