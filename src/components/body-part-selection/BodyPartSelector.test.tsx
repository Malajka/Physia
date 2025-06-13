// src/components/body-part-selection/BodyPartSelector.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import BodyPartSelector from "./BodyPartSelector";

// --- TYPE IMPORTS ---
// We import the actual prop types from the components we are mocking.
import type { BodyPartButtonProps } from "./BodyPartButton";
import type { NavigationNextButtonProps } from "./NavigationNextButton";
import type { DisclaimerModalProps } from "@/components/common/DisclaimerModal";

// --- MOCKS ---
vi.mock("@/hooks/useDisclaimer");
vi.mock("@/hooks/useBodyParts");
vi.mock("@/hooks/useSingleSelection");

// The mocks now use the imported types, providing full type safety and eliminating 'any'.
vi.mock("./BodyPartButton", () => ({
  BodyPartButton: (props: BodyPartButtonProps) => (
    <button onClick={() => props.onSelect(props.id)} aria-pressed={props.selected}>
      {props.name}
    </button>
  ),
}));
vi.mock("./NavigationNextButton", () => ({
  NavigationNextButton: ({ selectedBodyPartId }: NavigationNextButtonProps) => (
    <a href={`/next?id=${selectedBodyPartId}`} aria-disabled={!selectedBodyPartId}>
      Next
    </a>
  ),
}));
vi.mock("@/components/common/DisclaimerModal", () => ({
  DisclaimerModal: ({ onAccept }: DisclaimerModalProps) => (
    <div>
      <p>Disclaimer Text</p>
      <button onClick={onAccept}>Accept Disclaimer</button>
    </div>
  ),
}));
vi.mock("@/components/ui/InfoBar", () => ({
  InfoBar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useBodyParts } from "@/hooks/useBodyParts";
import { useSingleSelection } from "@/hooks/useSingleSelection";

// --- MOCK SETUP ---
const mockUseDisclaimer = useDisclaimer as Mock;
const mockUseBodyParts = useBodyParts as Mock;
const mockUseSingleSelection = useSingleSelection as Mock;

// The helper function is now also strongly typed using TypeScript's utility types.
type DisclaimerState = Partial<ReturnType<typeof useDisclaimer>>;
type BodyPartsState = Partial<ReturnType<typeof useBodyParts>>;
type SelectionState = Partial<ReturnType<typeof useSingleSelection>>;

const setupMocks = ({
  disclaimer = {},
  bodyParts = {},
  selection = {},
}: {
  disclaimer?: DisclaimerState;
  bodyParts?: BodyPartsState;
  selection?: SelectionState;
}) => {
  mockUseDisclaimer.mockReturnValue({ loading: false, error: null, acceptedAt: "2025-01-01", accept: vi.fn(), ...disclaimer });
  mockUseBodyParts.mockReturnValue({ loading: false, error: null, data: [], refetch: vi.fn(), ...bodyParts });
  mockUseSingleSelection.mockReturnValue({ selected: null, toggle: vi.fn(), ...selection });
};

// --- TEST SUITE ---
describe("BodyPartSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show the disclaimer modal if it has not been accepted", async () => {
    const user = userEvent.setup();
    const acceptFn = vi.fn();
    setupMocks({ disclaimer: { acceptedAt: null, accept: acceptFn } });

    render(<BodyPartSelector />);

    const acceptButton = screen.getByRole("button", { name: /accept disclaimer/i });
    await user.click(acceptButton);

    expect(acceptFn).toHaveBeenCalledTimes(1);
  });

  it("should render body parts and handle selection when data is available", async () => {
    const user = userEvent.setup();
    const toggleFn = vi.fn();
    setupMocks({
      bodyParts: {
        data: [
          { id: 1, name: "Shoulder" },
          { id: 2, name: "Knee" },
        ],
      },
      selection: { selected: 1, toggle: toggleFn },
    });

    render(<BodyPartSelector />);

    const shoulderButton = screen.getByRole("button", { name: "Shoulder" });
    const kneeButton = screen.getByRole("button", { name: "Knee" });

    expect(shoulderButton).toHaveAttribute("aria-pressed", "true");
    await user.click(kneeButton);
    expect(toggleFn).toHaveBeenCalledWith(2);
  });
});
