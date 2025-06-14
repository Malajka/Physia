import { fetchFeedback } from "@/lib/services/session/feedback";
import { render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi, type MockedFunction } from "vitest";
import { FeedbackRating } from "./FeedbackRating";

vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/lib/services/session/feedback", () => ({
  fetchFeedback: vi.fn(),
  submitFeedback: vi.fn(),
}));

const fetchFeedbackMock = fetchFeedback as MockedFunction<typeof fetchFeedback>;

describe("FeedbackRating", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows loading state", () => {
    fetchFeedbackMock.mockReturnValue(new Promise(() => undefined));
    render(<FeedbackRating sessionId={1} />);
    expect(screen.getByText(/loading feedback/i)).toBeInTheDocument();
  });

  it("shows error state", async () => {
    fetchFeedbackMock.mockRejectedValue(new Error("fail"));
    render(<FeedbackRating sessionId={1} />);
    await waitFor(() => {
      expect(screen.getByTestId("feedback-error")).toHaveTextContent("fail");
    });
  });

  it("renders both rating buttons", async () => {
    fetchFeedbackMock.mockResolvedValue({ data: { rating: null, rated_at: null } });
    render(<FeedbackRating sessionId={1} />);
    await waitFor(() => {
      expect(screen.getByTestId("feedback-positive")).toBeInTheDocument();
      expect(screen.getByTestId("feedback-negative")).toBeInTheDocument();
    });
  });
});
