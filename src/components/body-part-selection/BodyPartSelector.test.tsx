import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import BodyPartSelector from "./BodyPartSelector";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useBodyParts } from "@/hooks/useBodyParts";
import { useSingleSelection } from "@/hooks/useSingleSelection";
import type { BodyPartButtonProps } from "./BodyPartButton";
import type { NavigationNextButtonProps } from "./NavigationNextButton";
import type { DisclaimerModalProps } from "@/components/common/DisclaimerModal";

vi.mock("@/hooks/useDisclaimer");
vi.mock("@/hooks/useBodyParts");
vi.mock("@/hooks/useSingleSelection");
vi.mock("./BodyPartButton", () => ({
  BodyPartButton: (props: BodyPartButtonProps) => (
    <button data-testid={`body-part-${props.id}`} onClick={() => props.onSelect(props.id)} aria-pressed={props.selected}>
      {props.name}
    </button>
  ),
}));
vi.mock("./NavigationNextButton", () => ({
  NavigationNextButton: ({ selectedBodyPartId }: NavigationNextButtonProps) => (
    <a href={`/next?id=${selectedBodyPartId || ""}`} aria-disabled={!selectedBodyPartId}>
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
vi.mock("@/components/ui", () => ({
  InfoBar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockedUseDisclaimer = useDisclaimer as Mock;
const mockedUseBodyParts = useBodyParts as Mock;
const mockedUseSingleSelection = useSingleSelection as Mock;

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
  mockedUseDisclaimer.mockReturnValue({
    loading: false,
    error: null,
    acceptedAt: "2025-01-01",
    disclaimerText: "",
    accept: vi.fn(),
    ...disclaimer,
  });
  mockedUseBodyParts.mockReturnValue({
    loading: false,
    error: null,
    data: [],
    refetch: vi.fn(),
    ...bodyParts,
  });
  mockedUseSingleSelection.mockReturnValue({
    selected: null,
    toggle: vi.fn(),
    ...selection,
  });
};

describe("BodyPartSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("State Rendering Logic", () => {
    it("should render disclaimer loading state", () => {
      setupMocks({ disclaimer: { loading: true } });
      render(<BodyPartSelector />);
      expect(screen.getByText("Loading disclaimer...")).toBeInTheDocument();
    });

    it("should render disclaimer error state", () => {
      setupMocks({ disclaimer: { error: "Failed to load" } });
      render(<BodyPartSelector />);
      expect(screen.getByText("Disclaimer Error: Failed to load")).toBeInTheDocument();
    });

    it("should render the disclaimer modal if not accepted", () => {
      setupMocks({ disclaimer: { acceptedAt: null } });
      render(<BodyPartSelector />);
      expect(screen.getByText("Disclaimer Text")).toBeInTheDocument();
    });

    it("should render body parts loading state when disclaimer is accepted", () => {
      setupMocks({ bodyParts: { loading: true } });
      render(<BodyPartSelector />);
      expect(screen.getByText("Loading body areas...")).toBeInTheDocument();
    });

    it("should render body parts error state and a retry button", async () => {
      const user = userEvent.setup();
      const refetchFn = vi.fn();
      setupMocks({ bodyParts: { error: "Network error", refetch: refetchFn } });
      render(<BodyPartSelector />);
      expect(screen.getByText("Error loading body parts: Network error")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(refetchFn).toHaveBeenCalledTimes(1);
    });

    it("should render 'no body areas' message when data is empty", () => {
      setupMocks({ bodyParts: { data: [] } });
      render(<BodyPartSelector />);
      expect(screen.getByText("No body areas available.")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call the accept function when disclaimer is accepted", async () => {
      const user = userEvent.setup();
      const acceptFn = vi.fn();
      setupMocks({ disclaimer: { acceptedAt: null, accept: acceptFn } });
      render(<BodyPartSelector />);
      await user.click(screen.getByRole("button", { name: "Accept Disclaimer" }));
      expect(acceptFn).toHaveBeenCalledTimes(1);
    });

    it("should render body parts and handle selection", async () => {
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

      const shoulderButton = screen.getByTestId("body-part-1");
      const kneeButton = screen.getByTestId("body-part-2");

      expect(shoulderButton).toHaveAttribute("aria-pressed", "true");
      expect(kneeButton).toHaveAttribute("aria-pressed", "false");

      await user.click(kneeButton);
      expect(toggleFn).toHaveBeenCalledWith(2);
    });
  });
});
