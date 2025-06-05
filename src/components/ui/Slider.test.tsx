import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider";

// Helper to get the thumb element
const getThumb = () => document.querySelector(".slider-thumb") as HTMLElement;

describe("Slider", () => {
  it("renders without crashing", () => {
    render(<Slider value={[5]} />);
    expect(getThumb()).toBeInTheDocument();
  });

  it("calls onValueChange when value changes", async () => {
    const onValueChange = vi.fn();
    render(<Slider value={[2]} onValueChange={onValueChange} />);
    // Simulate keyboard interaction (Radix handles arrow keys)
    const thumb = getThumb();
    thumb.focus();
    await userEvent.keyboard("{arrowright}");
    // We can't simulate drag easily, but Radix should call onValueChange on key events
    // So we check that the callback is called (may need to adjust depending on Radix version)
    expect(onValueChange).toHaveBeenCalled();
  });

  it("thumb is green for value <= 3", () => {
    render(<Slider value={[2]} />);
    const thumb = getThumb();
    expect(thumb).toHaveStyle({ backgroundColor: "#10b981" });
  });

  it("thumb is yellow for value 4-6", () => {
    render(<Slider value={[5]} />);
    const thumb = getThumb();
    expect(thumb).toHaveStyle({ backgroundColor: "#fbbf24" });
  });

  it("thumb is red for value > 6", () => {
    render(<Slider value={[8]} />);
    const thumb = getThumb();
    expect(thumb).toHaveStyle({ backgroundColor: "#ef4444" });
  });
});
