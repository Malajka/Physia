import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a div with the correct classes", () => {
    const { container } = render(<Skeleton />);
    const div = container.querySelector("div");
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass("animate-pulse");
    expect(div).toHaveClass("rounded-md");
    expect(div).toHaveClass("bg-muted");
  });

  it("applies additional className and props", () => {
    const { container } = render(<Skeleton className="w-10 h-10" data-testid="skeleton" />);
    const div = container.querySelector("div");
    expect(div).toHaveClass("w-10");
    expect(div).toHaveClass("h-10");
    expect(div).toHaveAttribute("data-testid", "skeleton");
  });
});
