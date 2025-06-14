import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BodyPartButton } from "./BodyPartButton";

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly in an unselected state", () => {
    render(<BodyPartButton {...defaultProps} selected={false} />);

    const button = screen.getByRole("button", { name: /select shoulder/i });

    expect(button).toBeInTheDocument();
    expect(screen.getByText("Shoulder")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");

    expect(button).toHaveStyle("background-image: url(/images/body-parts/mock-slug-for-shoulder.png)");
  });

  it("should render correctly in a selected state", () => {
    render(<BodyPartButton {...defaultProps} selected={true} />);

    const button = screen.getByRole("button", { name: /select shoulder/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");

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
