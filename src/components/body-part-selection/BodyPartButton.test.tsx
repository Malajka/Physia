import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BodyPartButton } from "./BodyPartButton";

// Mock the slugify utility to isolate the component. This makes the test
// more predictable and focused only on the BodyPartButton's logic.
vi.mock("@/lib/utils/slugify", () => ({
  slugify: (name: string) => `mock-slug-for-${name.toLowerCase()}`,
}));

describe("BodyPartButton", () => {
  const onSelectMock = vi.fn();

  const defaultProps = {
    id: 1,
    name: "Shoulder",
    selected: false,
    onSelect: onSelectMock,
  };

  // Ensure mocks are reset before each test for isolation
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly in an unselected state", () => {
    render(<BodyPartButton {...defaultProps} selected={false} />);

    const button = screen.getByRole("button", { name: /select shoulder/i });

    expect(button).toBeInTheDocument();
    expect(screen.getByText("Shoulder")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
    // We verify the background image is set, which implicitly tests slugify's usage
    expect(button).toHaveStyle("background-image: url(/images/body-parts/mock-slug-for-shoulder.png)");
  });

  it("should render correctly in a selected state", () => {
    render(<BodyPartButton {...defaultProps} selected={true} />);

    const button = screen.getByRole("button", { name: /select shoulder/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");

    // Instead of testing for CSS classes, we test for a perceivable outcome.
    // In this case, the selected button should have a different text style.
    const nameSpan = screen.getByText("Shoulder");
    expect(nameSpan.className).toContain("text-primary");
  });

  it("should call onSelect with the correct id when clicked", async () => {
    const user = userEvent.setup();
    render(<BodyPartButton {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /select shoulder/i }));

    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onSelectMock).toHaveBeenCalledWith(defaultProps.id);
  });

  it("should render nothing if the name prop is empty", () => {
    const { container } = render(<BodyPartButton {...defaultProps} name="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
