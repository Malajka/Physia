import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders a div with the correct classes", () => {
    const { container } = render(<Spinner />);
    const div = container.querySelector("div");
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass("animate-spin");
    expect(div).toHaveClass("rounded-full");
    expect(div).toHaveClass("border-4");
    expect(div).toHaveClass("border-primary");
    expect(div).toHaveClass("h-8");
    expect(div).toHaveClass("w-8");
  });

  it("applies additional className and props", () => {
    const { container } = render(<Spinner className="w-12 h-12" data-testid="spinner" />);
    const div = container.querySelector("div");
    expect(div).toHaveClass("w-12");
    expect(div).toHaveClass("h-12");
    expect(div).toHaveAttribute("data-testid", "spinner");
  });
});
