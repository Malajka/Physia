import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorAlert } from "./ErrorAlert";

describe("ErrorAlert", () => {
  it("renders nothing if errors is null", () => {
    const { container } = render(<ErrorAlert errors={null} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    expect(alert).toBeEmptyDOMElement();
  });

  it("renders a single error string", () => {
    render(<ErrorAlert errors="Oops!" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Oops!", { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("renders multiple errors as a list", () => {
    render(<ErrorAlert errors={["A", "B"]} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText(/errors/i)).toBeInTheDocument();
  });

  it("renders with custom render function", () => {
    render(<ErrorAlert errors={["A"]} render={(e) => <span data-testid="custom">{e}!</span>} />);
    expect(screen.getByTestId("custom")).toHaveTextContent("A!");
  });

  it("sets role and aria-live for accessibility", () => {
    render(<ErrorAlert errors="err" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });
});
