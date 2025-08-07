import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrainingPlanDisplay } from "./TrainingPlanDisplay";
import type { TrainingPlan } from "@/lib/services/training-plan";

const mockTrainingPlan: TrainingPlan = {
  title: "Upper Body Strength Training",
  description: "A comprehensive upper body workout focusing on muscle strengthening",
  warnings: ["Consult with a healthcare provider before starting", "Stop if you feel pain"],
  exercises: [
    {
      id: 1,
      name: "Push-ups",
      description: `
### Warmup
Start with arm circles
Light stretching

### Workout
Standard push-ups
Keep your core engaged
Control the movement

### Cooldown
Hold plank position
Stretch chest muscles
`,
      sets: 3,
      reps: 10,
      rest_time_seconds: 60,
      section_notes: {
        warmup: "Take your time with warm-up movements. Focus on gentle, controlled motions.",
        workout: "Maintain proper form throughout the exercise. Breathe steadily.",
        cooldown: "Allow your muscles to relax completely. Don't rush the cool-down phase.",
      },
    },
    {
      id: 2,
      name: "Pull-ups",
      description: "Grip the bar with hands shoulder-width apart\nPull yourself up until chin clears the bar",
      sets: 3,
      reps: 8,
      rest_time_seconds: 90,
      section_notes: {
        workout: "Focus on controlled movement. Don't swing your body.",
      },
    },
  ],
};

const mockExerciseImagesMap = {
  1: [
    { file_path: "/images/pushup1.jpg", metadata: { purpose: "exercise" } },
    { file_path: "/images/pushup2.jpg", metadata: { purpose: "exercise" } },
    { file_path: "/images/pushup-muscle-test.jpg", metadata: { purpose: "muscle_test" } },
  ],
  2: [
    { file_path: "/images/pullup1.jpg", metadata: { purpose: "exercise" } },
    { file_path: "/images/pullup-muscle-test.jpg", metadata: { purpose: "muscle_test" } },
  ],
};

describe("TrainingPlanDisplay", () => {
  it("renders training plan title and description", () => {
    render(<TrainingPlanDisplay trainingPlan={mockTrainingPlan} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.getByTestId("session-title")).toHaveTextContent("Upper Body Strength Training");
    expect(screen.getByTestId("session-description")).toHaveTextContent("A comprehensive upper body workout focusing on muscle strengthening");
  });

  it("displays warnings when present", () => {
    render(<TrainingPlanDisplay trainingPlan={mockTrainingPlan} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.getByText("Important Safety Information")).toBeInTheDocument();
    expect(screen.getByText("Consult with a healthcare provider before starting")).toBeInTheDocument();
    expect(screen.getByText("Stop if you feel pain")).toBeInTheDocument();
  });

  it("displays section-specific notes when present", () => {
    render(<TrainingPlanDisplay trainingPlan={mockTrainingPlan} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.getByText("💡 Take your time with warm-up movements. Focus on gentle, controlled motions.")).toBeInTheDocument();
    expect(screen.getByText("💡 Maintain proper form throughout the exercise. Breathe steadily.")).toBeInTheDocument();
    expect(screen.getByText("💡 Allow your muscles to relax completely. Don't rush the cool-down phase.")).toBeInTheDocument();
    expect(screen.getByText("💡 Focus on controlled movement. Don't swing your body.")).toBeInTheDocument();
  });

  it("displays section cards with correct styling", () => {
    render(<TrainingPlanDisplay trainingPlan={mockTrainingPlan} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.getByText("Warm-Up")).toBeInTheDocument();
    expect(screen.getByText("Workout")).toBeInTheDocument();
    expect(screen.getByText("Cool-Down")).toBeInTheDocument();

    const sectionCards = screen.getAllByRole("heading", { level: 3 });
    sectionCards.forEach((card) => {
      expect(card).toHaveClass("text-2xl", "font-bold", "text-gray-800");
    });
  });

  it("handles exercise with simple description (no sections)", () => {
    const planWithSimpleDesc: TrainingPlan = {
      ...mockTrainingPlan,
      exercises: [
        {
          id: 3,
          name: "Simple Exercise",
          description: "Simple description without sections",
          sets: 1,
          reps: 1,
          rest_time_seconds: 30,
        },
      ],
    };

    render(<TrainingPlanDisplay trainingPlan={planWithSimpleDesc} exerciseImagesMap={{}} />);

    expect(screen.getByText("Simple Exercise")).toBeInTheDocument();
    expect(screen.getByText("Simple description without sections")).toBeInTheDocument();
    expect(screen.getAllByText("Simple description without sections")).toHaveLength(1);
  });

  it("handles training plan without warnings", () => {
    const planWithoutWarnings: TrainingPlan = {
      ...mockTrainingPlan,
      warnings: undefined,
    };

    render(<TrainingPlanDisplay trainingPlan={planWithoutWarnings} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.queryByText("Important Safety Information")).not.toBeInTheDocument();
  });

  it("handles empty warnings array", () => {
    const planWithEmptyWarnings: TrainingPlan = {
      ...mockTrainingPlan,
      warnings: [],
    };

    render(<TrainingPlanDisplay trainingPlan={planWithEmptyWarnings} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.queryByText("Important Safety Information")).not.toBeInTheDocument();
  });

  it("displays message when no exercises for a section", () => {
    const planWithoutExercises: TrainingPlan = {
      ...mockTrainingPlan,
      exercises: [],
    };

    render(<TrainingPlanDisplay trainingPlan={planWithoutExercises} exerciseImagesMap={{}} />);

    const noExercisesMessages = screen.getAllByText("No exercises for this section");
    expect(noExercisesMessages).toHaveLength(3);
  });
});
