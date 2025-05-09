import type { MuscleTestDto } from "@/types";
import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { MuscleTestItem } from "./MuscleTestItem";

// Mock Slider
vi.mock("@/components/ui/Slider", () => ({
  Slider: ({
    id,
    min,
    max,
    step,
    value,
    onValueChange,
    ...props
  }: {
    id: string;
    min: number;
    max: number;
    step: number;
    value: number[];
    onValueChange: (v: number[]) => void;
  } & React.HTMLAttributes<HTMLDivElement>) => (
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      data-testid="slider"
      {...props}
    />
  ),
}));

const test: MuscleTestDto = {
  id: 1,
  name: "Test Name",
  description: "Test description",
  body_part_id: 1,
  created_at: "2024-01-01T00:00:00Z",
};

describe("MuscleTestItem", () => {
  it("renders test name and description", () => {
    render(<MuscleTestItem test={test} value={3} onChange={vi.fn()} animating={false} />);
    expect(screen.getByText("Test Name")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("displays the current pain value", () => {
    render(<MuscleTestItem test={test} value={7} onChange={vi.fn()} animating={false} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("calls onChange when slider value changes", () => {
    const onChange = vi.fn();
    render(<MuscleTestItem test={test} value={2} onChange={onChange} animating={false} />);
    fireEvent.change(screen.getByTestId("slider"), { target: { value: 5 } });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("applies correct color for pain value", () => {
    const { rerender } = render(<MuscleTestItem test={test} value={2} onChange={vi.fn()} animating={false} />);
    let valueSpan = screen.getByText("2");
    expect(valueSpan).toHaveStyle({ color: "#10b981" }); // green

    rerender(<MuscleTestItem test={test} value={5} onChange={vi.fn()} animating={false} />);
    valueSpan = screen.getByText("5");
    expect(valueSpan).toHaveStyle({ color: "#fbbf24" }); // yellow

    rerender(<MuscleTestItem test={test} value={9} onChange={vi.fn()} animating={false} />);
    valueSpan = screen.getByText("9");
    expect(valueSpan).toHaveStyle({ color: "#ef4444" }); // red
  });

  it("applies animation class when animating is true", () => {
    render(<MuscleTestItem test={test} value={3} onChange={vi.fn()} animating={true} />);
    const valueSpan = screen.getByText("3");
    expect(valueSpan.className).toMatch(/animate-pulse/);
  });

  it("slider has correct attributes and value", () => {
    render(<MuscleTestItem test={test} value={4} onChange={vi.fn()} animating={false} />);
    const slider = screen.getByTestId("slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "10");
    expect(slider).toHaveAttribute("step", "1");
    expect(slider).toHaveValue("4");
  });
});
