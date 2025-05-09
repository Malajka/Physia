import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkButton } from "./LinkButton";

describe("LinkButton", () => {
  it("renders children and correct href", () => {
    render(<LinkButton href="/test">Go</LinkButton>);
    const link = screen.getByRole("link", { name: /go/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("forwards className prop", () => {
    render(
      <LinkButton href="#" className="extra-class">
        X
      </LinkButton>
    );
    const link = screen.getByRole("link");
    expect(link.className).toMatch(/extra-class/);
  });
});
