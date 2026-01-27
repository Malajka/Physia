import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders a pulsing medical icon", () => {
    const { container } = render(<Spinner />);
    const spinnerContainer = container.querySelector("div");
    const svg = container.querySelector("svg");

    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveClass("physio-spinner-container");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("physio-pulse-icon");
  });

  it("applies additional className and props", () => {
    const { container } = render(<Spinner className="extra-class" data-testid="spinner" />);
    const div = container.querySelector("div");

    expect(div).toHaveClass("physio-spinner-container");
    expect(div).toHaveClass("extra-class");
    expect(div).toHaveAttribute("data-testid", "spinner");
  });

  it("contains two pulsing circles", () => {
    const { container } = render(<Spinner />);
    const circles = container.querySelectorAll("circle");

    expect(circles).toHaveLength(2);
    expect(circles[0]).toHaveAttribute("r", "30");
    expect(circles[1]).toHaveAttribute("r", "24");
  });
});
