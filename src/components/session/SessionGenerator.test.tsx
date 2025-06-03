import { startSessionGeneration } from "@/lib/services/session/generation";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionGenerator } from "./SessionGenerator";

vi.mock("@/lib/services/session/generation", () => ({
  startSessionGeneration: vi.fn(),
}));

const mockStartSessionGeneration = startSessionGeneration as unknown as ReturnType<typeof vi.fn>;

describe("SessionGenerator", () => {
  const defaultProps = { bodyPartId: 1, tests: [{ muscle_test_id: 1, pain_intensity: 5 }] };
  let originalLocation: Location;

  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-expect-error - Mocking window.location for testing
    originalLocation = window.location;
    // @ts-expect-error - Need to delete window.location to mock it
    delete window.location;
    // @ts-expect-error - Setting up mock window.location object
    window.location = { href: "" };
  });

  afterEach(() => {
    // @ts-expect-error - Restoring original window.location after test
    window.location = originalLocation;
  });

  it("renders the button", () => {
    render(<SessionGenerator {...defaultProps} />);
    expect(screen.getByRole("button", { name: /generate training session/i })).toBeInTheDocument();
  });

  it("shows loading state when clicked", async () => {
    mockStartSessionGeneration.mockReturnValue(new Promise(() => undefined));
    render(<SessionGenerator {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  it("shows error state if generation fails", async () => {
    mockStartSessionGeneration.mockResolvedValue({ error: "fail" });
    render(<SessionGenerator {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText(/fail/)).toBeInTheDocument();
    });
  });

  it("redirects to session page on success", async () => {
    mockStartSessionGeneration.mockResolvedValue({ id: 123 });
    render(<SessionGenerator {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      // @ts-expect-error - Accessing mocked window.location.href property
      expect(window.location.href).toBe("/sessions/123");
    });
  });
});
