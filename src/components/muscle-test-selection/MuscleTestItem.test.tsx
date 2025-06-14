import type { MuscleTestDto } from "@/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MuscleTestItem } from "./MuscleTestItem";

vi.mock("@/components/ui/Slider", () => ({
  Slider: ({
    id,
    min,
    max,
    step,
    value,
    onValueChange,
    "data-testid": testId,
    ...props
  }: {
    id: string;
    min: number;
    max: number;
    step: number;
    value: number[];
    onValueChange: (v: number[]) => void;
    "data-testid"?: string;
  }) => (
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      data-testid={testId}
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
    fireEvent.change(screen.getByTestId("slider-1"), { target: { value: 5 } });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("applies correct color for pain value", () => {
    const { rerender } = render(<MuscleTestItem test={test} value={2} onChange={vi.fn()} animating={false} />);
    let valueSpan = screen.getByText("2");
    expect(valueSpan).toHaveStyle({ color: "#10b981" });

    rerender(<MuscleTestItem test={test} value={5} onChange={vi.fn()} animating={false} />);
    valueSpan = screen.getByText("5");
    expect(valueSpan).toHaveStyle({ color: "#fbbf24" });

    rerender(<MuscleTestItem test={test} value={9} onChange={vi.fn()} animating={false} />);
    valueSpan = screen.getByText("9");
    expect(valueSpan).toHaveStyle({ color: "#ef4444" });
  });

  it("applies animation class when animating is true", () => {
    render(<MuscleTestItem test={test} value={3} onChange={vi.fn()} animating={true} />);
    const valueSpan = screen.getByText("3");
    expect(valueSpan.className).toMatch(/animate-pulse/);
  });

  it("slider has correct attributes and value", () => {
    render(<MuscleTestItem test={test} value={4} onChange={vi.fn()} animating={false} />);
    const slider = screen.getByTestId("slider-1");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "10");
    expect(slider).toHaveAttribute("step", "1");
    expect(slider).toHaveValue("4");
  });

  it("displays formatted instructions with steps", () => {
    const testWithSteps = {
      ...test,
      description: `
### Steps
1. Place your hand on the table
2. Apply gentle pressure
3. Hold for 10 seconds
`,
    };
    render(<MuscleTestItem test={testWithSteps} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("Instructions")).toBeInTheDocument();
    expect(screen.getByText("Place your hand on the table")).toBeInTheDocument();
    expect(screen.getByText("Apply gentle pressure")).toBeInTheDocument();
    expect(screen.getByText("Hold for 10 seconds")).toBeInTheDocument();
  });

  it("displays warnings section when present", () => {
    const testWithWarnings = {
      ...test,
      description: `
### Warning
Do not apply excessive pressure
Stop if you feel pain
`,
    };
    render(<MuscleTestItem test={testWithWarnings} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("Important")).toBeInTheDocument();
    expect(screen.getByText("Do not apply excessive pressure")).toBeInTheDocument();
    expect(screen.getByText("Stop if you feel pain")).toBeInTheDocument();
  });

  it("displays info section when present", () => {
    const testWithInfo = {
      ...test,
      description: `
### Info
You may feel a slight tingling
This is normal and expected
`,
    };
    render(<MuscleTestItem test={testWithInfo} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("What to expect")).toBeInTheDocument();
    expect(screen.getByText("You may feel a slight tingling")).toBeInTheDocument();
    expect(screen.getByText("This is normal and expected")).toBeInTheDocument();
  });

  it("displays notes section when present", () => {
    const testWithNotes = {
      ...test,
      description: `
### Note
Remember to breathe normally
Keep your posture straight
`,
    };
    render(<MuscleTestItem test={testWithNotes} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("Remember")).toBeInTheDocument();
    expect(screen.getByText("Remember to breathe normally")).toBeInTheDocument();
    expect(screen.getByText("Keep your posture straight")).toBeInTheDocument();
  });

  it("handles description without section markers", () => {
    const testWithSimpleDesc = {
      ...test,
      description: "Simple description without sections\nSecond line of text",
    };
    render(<MuscleTestItem test={testWithSimpleDesc} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("What to expect")).toBeInTheDocument();
    expect(screen.getByText("Simple description without sections")).toBeInTheDocument();
    expect(screen.getByText("Second line of text")).toBeInTheDocument();
  });

  it("displays fallback description when no sections are present", () => {
    const testWithFallback = {
      ...test,
      description: "This is a fallback description",
    };
    render(<MuscleTestItem test={testWithFallback} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("This is a fallback description")).toBeInTheDocument();
  });

  it("handles null description gracefully", () => {
    const testWithNullDesc = {
      ...test,
      description: null,
    };
    render(<MuscleTestItem test={testWithNullDesc} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("Test Name")).toBeInTheDocument();
  });

  it("removes bullet points and numbers from content", () => {
    const testWithBullets = {
      ...test,
      description: `
### Steps
• First bullet point
- Second dash point
1. Numbered point
`,
    };
    render(<MuscleTestItem test={testWithBullets} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("First bullet point")).toBeInTheDocument();
    expect(screen.getByText("Second dash point")).toBeInTheDocument();
    expect(screen.getByText("Numbered point")).toBeInTheDocument();
  });

  it("handles alternative section names", () => {
    const testWithAltNames = {
      ...test,
      description: `
### Instructions
Follow these steps

### Important
This is important

### Expect
You might feel this

### Remember
Don't forget this
`,
    };
    render(<MuscleTestItem test={testWithAltNames} value={3} onChange={vi.fn()} animating={false} />);

    expect(screen.getByText("Instructions")).toBeInTheDocument();
    expect(screen.getByText("Follow these steps")).toBeInTheDocument();
    expect(screen.getByText("Important")).toBeInTheDocument();
    expect(screen.getByText("This is important")).toBeInTheDocument();
    expect(screen.getByText("What to expect")).toBeInTheDocument();
    expect(screen.getByText("You might feel this")).toBeInTheDocument();
    expect(screen.getByText("Remember")).toBeInTheDocument();
    expect(screen.getByText("Don't forget this")).toBeInTheDocument();
  });
});
