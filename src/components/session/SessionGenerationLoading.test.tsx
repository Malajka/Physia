import { useSessionGeneration } from "@/hooks/useSessionGeneration";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { SessionGenerationLoading } from "./SessionGenerationLoading";

// Mock UI components
vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => {
    return <button {...props}>{children}</button>;
  },
}));
vi.mock("@/components/ui/Skeleton", () => ({
  Skeleton: (props: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="skeleton" {...props} />,
}));
vi.mock("@/components/ui/Spinner", () => ({
  Spinner: (props: React.HTMLAttributes<HTMLDivElement>) => <div data-testid="spinner" {...props} />,
}));

// Mock useSessionGeneration - FIXED: correct path
vi.mock("@/hooks/useSessionGeneration", () => ({
  useSessionGeneration: vi.fn(),
}));

const useSessionGenerationMock = vi.mocked(useSessionGeneration);

describe("SessionGenerationLoading", () => {
  it("shows loading skeleton and status message", () => {
    useSessionGenerationMock.mockReturnValue({
      statusMessage: "Generating...",
      error: null,
      retry: vi.fn(),
      isLoading: true,
      startGeneration: vi.fn(),
      sessionDetail: null,
    });
    render(<SessionGenerationLoading bodyPartId={1} tests={[{ muscle_test_id: 1, pain_intensity: 5 }]} />);
    expect(screen.getByText(/generating your training plan/i)).toBeInTheDocument();
    expect(screen.getByText("Generating...")).toBeInTheDocument();
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("shows error display when error is present", () => {
    useSessionGenerationMock.mockReturnValue({
      statusMessage: "",
      error: "Something went wrong",
      retry: vi.fn(),
      isLoading: false,
      startGeneration: vi.fn(),
      sessionDetail: null,
    });
    render(<SessionGenerationLoading bodyPartId={1} tests={[{ muscle_test_id: 1, pain_intensity: 5 }]} />);
    expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
