import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import BodyPartSelector from "./BodyPartSelector";

// Mock child components
vi.mock("./BodyPartButton", () => ({
  BodyPartButton: ({
    id,
    name,
    selected,
    onSelect,
  }: React.ComponentProps<"button"> & { id: number; name: string; selected: boolean; onSelect: (id: number) => void }) => (
    <button data-testid={`body-part-btn-${id}`} aria-pressed={selected} onClick={() => onSelect(id)}>
      {name}
    </button>
  ),
}));
vi.mock("./NavigationNextButton", () => ({
  NavigationNextButton: ({ selectedBodyPartId }: { selectedBodyPartId: number }) => (
    <button data-testid="next-btn" disabled={!selectedBodyPartId}>
      Next
    </button>
  ),
}));
vi.mock("@/components/ui/InfoBar", () => ({
  InfoBar: ({ children }: { children: React.ReactNode }) => <div data-testid="info-bar">{children}</div>,
}));
vi.mock("@/components/common/DisclaimerModal", () => ({
  DisclaimerModal: ({ open, onAccept, text }: { open: boolean; onAccept: () => void; text: string }) =>
    open ? (
      <div data-testid="disclaimer-modal">
        <span>{text}</span>
        <button onClick={onAccept}>Accept</button>
      </div>
    ) : null,
}));

// Mock hooks
vi.mock("../../lib/hooks/useDisclaimer");
vi.mock("@/components/hooks/useBodyParts");
vi.mock("@/components/hooks/useSingleSelection");

import { useBodyParts } from "@/components/hooks/useBodyParts";
import { useSingleSelection } from "@/components/hooks/useSingleSelection";
import { useDisclaimer } from "../../lib/hooks/useDisclaimer";

const mockDisclaimer = useDisclaimer as Mock;
const mockBodyParts = useBodyParts as Mock;
const mockSingleSelection = useSingleSelection as Mock;

describe("BodyPartSelector (minimal)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDisclaimer.mockReset();
    mockBodyParts.mockReset();
    mockSingleSelection.mockReset();
  });

  it("renders body part buttons and handles selection", () => {
    mockDisclaimer.mockReturnValue({ disclaimerText: "", acceptedAt: "2024-01-01", loading: false, error: null, accept: vi.fn() });
    mockBodyParts.mockReturnValue({
      bodyParts: [
        { id: 1, name: "Shoulder" },
        { id: 2, name: "Knee" },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    const toggle = vi.fn();
    mockSingleSelection.mockReturnValue({ selected: 2, toggle });
    render(<BodyPartSelector />);
    expect(screen.getByTestId("body-part-btn-1")).toHaveTextContent("Shoulder");
    fireEvent.click(screen.getByTestId("body-part-btn-1"));
    expect(toggle).toHaveBeenCalledWith(1);
  });

  it("renders InfoBar and Next button", () => {
    mockDisclaimer.mockReturnValue({ disclaimerText: "", acceptedAt: "2024-01-01", loading: false, error: null, accept: vi.fn() });
    mockBodyParts.mockReturnValue({ bodyParts: [{ id: 1, name: "Shoulder" }], loading: false, error: null, refetch: vi.fn() });
    mockSingleSelection.mockReturnValue({ selected: 1, toggle: vi.fn() });
    render(<BodyPartSelector />);
    expect(screen.getByTestId("info-bar")).toBeInTheDocument();
    expect(screen.getByTestId("next-btn")).toBeInTheDocument();
    expect(screen.getByTestId("next-btn")).not.toBeDisabled();
  });
});

describe("BodyPartSelector edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDisclaimer.mockReset();
    mockBodyParts.mockReset();
    mockSingleSelection.mockReset();
  });

  it("shows disclaimer modal when not accepted", () => {
    mockDisclaimer.mockReturnValue({ disclaimerText: "Test disclaimer", acceptedAt: null, loading: false, error: null, accept: vi.fn() });
    mockBodyParts.mockReturnValue({ bodyParts: [], loading: false, error: null, refetch: vi.fn() });
    mockSingleSelection.mockReturnValue({ selected: null, toggle: vi.fn() });
    render(<BodyPartSelector />);
    expect(screen.getByTestId("disclaimer-modal")).toBeInTheDocument();
    expect(screen.getByText("Test disclaimer")).toBeInTheDocument();
  });

  it("shows loading disclaimer message", () => {
    mockDisclaimer.mockReturnValue({ disclaimerText: "", acceptedAt: null, loading: true, error: null, accept: vi.fn() });
    mockBodyParts.mockReturnValue({ bodyParts: [], loading: false, error: null, refetch: vi.fn() });
    mockSingleSelection.mockReturnValue({ selected: null, toggle: vi.fn() });
    render(<BodyPartSelector />);
    expect(screen.getByText(/Loading disclaimer/i)).toBeInTheDocument();
  });

  it("shows disclaimer error message", () => {
    mockDisclaimer.mockReturnValue({ disclaimerText: "", acceptedAt: null, loading: false, error: "Disclaimer error", accept: vi.fn() });
    mockBodyParts.mockReturnValue({ bodyParts: [], loading: false, error: null, refetch: vi.fn() });
    mockSingleSelection.mockReturnValue({ selected: null, toggle: vi.fn() });
    render(<BodyPartSelector />);
    expect(screen.getByText("Disclaimer error")).toBeInTheDocument();
  });

  it("shows loading body parts message", () => {
    mockDisclaimer.mockReturnValue({ disclaimerText: "", acceptedAt: "2024-01-01", loading: false, error: null, accept: vi.fn() });
    mockBodyParts.mockReturnValue({ bodyParts: [], loading: true, error: null, refetch: vi.fn() });
    mockSingleSelection.mockReturnValue({ selected: null, toggle: vi.fn() });
    render(<BodyPartSelector />);
    expect(screen.getByText(/Loading body areas/i)).toBeInTheDocument();
  });

  it("shows body parts error and retry button", () => {
    const refetch = vi.fn();
    mockDisclaimer.mockReturnValue({ disclaimerText: "", acceptedAt: "2024-01-01", loading: false, error: null, accept: vi.fn() });
    mockBodyParts.mockReturnValue({ bodyParts: [], loading: false, error: "Body parts error", refetch });
    mockSingleSelection.mockReturnValue({ selected: null, toggle: vi.fn() });
    render(<BodyPartSelector />);
    expect(screen.getByText("Body parts error")).toBeInTheDocument();
    const retryBtn = screen.getByText("Retry");
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(refetch).toHaveBeenCalled();
  });

  it("shows message when no body parts are available", () => {
    mockDisclaimer.mockReturnValue({ disclaimerText: "", acceptedAt: "2024-01-01", loading: false, error: null, accept: vi.fn() });
    mockBodyParts.mockReturnValue({ bodyParts: [], loading: false, error: null, refetch: vi.fn() });
    mockSingleSelection.mockReturnValue({ selected: null, toggle: vi.fn() });
    render(<BodyPartSelector />);
    expect(screen.getByText(/No body areas available/i)).toBeInTheDocument();
  });
});
