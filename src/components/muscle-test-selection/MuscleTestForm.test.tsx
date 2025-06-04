import type { MuscleTestDto } from "@/types";
import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MuscleTestForm from "./MuscleTestForm";

// Mock Button and MuscleTestItem
vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("./MuscleTestItem", () => ({
  MuscleTestItem: ({
    test,
    value,
    onChange,
    animating,
  }: {
    test: MuscleTestDto;
    value: number;
    onChange: (v: number) => void;
    animating: boolean;
  }) => (
    <div data-testid={`muscle-test-item-${test.id}`}>
      <span>{test.name}</span>
      <input type="range" min={0} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} data-testid={`slider-${test.id}`} />
      {animating && <span data-testid="animating">animating</span>}
    </div>
  ),
}));
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <span data-testid="chevron-left" />,
}));

const muscleTests: MuscleTestDto[] = [
  { id: 1, name: "Test 1", body_part_id: 1, description: "", created_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Test 2", body_part_id: 1, description: "", created_at: "2024-01-01T00:00:00Z" },
];

describe("MuscleTestForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all MuscleTestItem components", () => {
    render(<MuscleTestForm bodyPartId={1} muscleTests={muscleTests} />);
    expect(screen.getByTestId("muscle-test-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("muscle-test-item-2")).toBeInTheDocument();
  });

  it("redirects with correct URL when form is valid", () => {
    const originalLocation = window.location;
    
    Object.defineProperty(window, 'location', {
      value: { href: "" },
      writable: true,
    });

    render(<MuscleTestForm bodyPartId={1} muscleTests={muscleTests} />);
    // Set painIntensity for first test
    fireEvent.change(screen.getByTestId("slider-1"), { target: { value: 5 } });
    fireEvent.click(screen.getByRole("button", { name: /create session/i }));
    expect(window.location.href).toMatch(/\/session\/generate\?bodyPartId=1&tests=/);

    // Restore the original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });
});
