import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InfoBar } from "./InfoBar";


describe("InfoBar", () => {
  it("renders children", () => {
    const { getByText } = render(<InfoBar>Info content</InfoBar>);
    expect(getByText("Info content")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    const { container } = render(<InfoBar>Test</InfoBar>);
    const div = container.querySelector("div");
    expect(div).toHaveClass("p-4");
    expect(div).toHaveClass("bg-blue-50");
    expect(div).toHaveClass("border-blue-200");
    expect(div).toHaveClass("text-blue-700");
    expect(div).toHaveClass("rounded");
    expect(div).toHaveClass("mb-4");
  });

  it("applies custom className", () => {
    const { container } = render(<InfoBar className="custom-class">Test</InfoBar>);
    const div = container.querySelector("div");
    expect(div).toHaveClass("custom-class");
  });
}); 