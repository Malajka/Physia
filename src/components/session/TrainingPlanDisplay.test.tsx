import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrainingPlanDisplay } from "./TrainingPlanDisplay";

const mockTrainingPlan = {
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
      notes: "Modify by doing knee push-ups if needed",
    },
    {
      id: 2,
      name: "Pull-ups",
      description: "Grip the bar with hands shoulder-width apart\nPull yourself up until chin clears the bar",
      sets: 3,
      reps: 8,
      rest_time_seconds: 90,
      notes: undefined,
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

  it("renders exercise details correctly", () => {
    render(<TrainingPlanDisplay trainingPlan={mockTrainingPlan} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.getAllByTestId("session-exercise-1")).toHaveLength(3); // appears in 3 sections
    expect(screen.getByTestId("session-exercise-2")).toBeInTheDocument();

    expect(screen.getAllByText("Push-ups")).toHaveLength(3); // appears in 3 sections
    expect(screen.getByText("Pull-ups")).toBeInTheDocument();

    expect(screen.getAllByText("3 sets").length).toBeGreaterThanOrEqual(3); // appears multiple times
    expect(screen.getAllByText("10 reps")).toHaveLength(3); // only push-ups has 10 reps
    expect(screen.getAllByText("60s rest")).toHaveLength(3); // only push-ups has 60s rest
  });

  it("displays exercise notes when present", () => {
    render(<TrainingPlanDisplay trainingPlan={mockTrainingPlan} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.getAllByText("Modify by doing knee push-ups if needed")).toHaveLength(3); // appears in 3 sections
  });

  it("renders only exercise images (filtering out muscle test images)", () => {
    render(<TrainingPlanDisplay trainingPlan={mockTrainingPlan} exerciseImagesMap={mockExerciseImagesMap} />);

    const images = screen.getAllByRole("img");
    // Push-ups appears in 3 sections (warmup, workout, cooldown) with 2 images each = 6 images
    // Pull-ups appears in 1 section with 1 image = 1 image
    // Total: 7 images
    expect(images.length).toBe(7);

    // Check that only exercise images are present
    const pushupImages = images.filter((img) => img.getAttribute("src")?.includes("pushup"));
    const pullupImages = images.filter((img) => img.getAttribute("src")?.includes("pullup"));

    // Push-ups: 2 unique images × 3 sections = 6 images
    expect(pushupImages.length).toBe(6);
    // Pull-ups: 1 unique image × 1 section = 1 image
    expect(pullupImages.length).toBe(1);

    // Verify no muscle test images are present
    const muscleTestImages = images.filter((img) => img.getAttribute("src")?.includes("muscle-test"));
    expect(muscleTestImages.length).toBe(0);
  });

  it("displays section cards with correct styling", () => {
    render(<TrainingPlanDisplay trainingPlan={mockTrainingPlan} exerciseImagesMap={mockExerciseImagesMap} />);

    // Check section titles
    expect(screen.getByText("Warm-Up")).toBeInTheDocument();
    expect(screen.getByText("Workout")).toBeInTheDocument();
    expect(screen.getByText("Cool-Down")).toBeInTheDocument();

    // Check for section-specific styling classes
    const sectionCards = screen.getAllByRole("heading", { level: 3 });
    sectionCards.forEach((card) => {
      expect(card).toHaveClass("text-2xl", "font-bold", "text-gray-800");
    });
  });

  it("handles empty exercise descriptions", () => {
    const planWithEmptyDesc = {
      ...mockTrainingPlan,
      exercises: [
        {
          id: 3,
          name: "Empty Exercise",
          description: "Simple description without sections",
          sets: 1,
          reps: 1,
          rest_time_seconds: 30,
          notes: undefined,
        },
      ],
    };

    render(<TrainingPlanDisplay trainingPlan={planWithEmptyDesc} exerciseImagesMap={{}} />);

    expect(screen.getByText("Empty Exercise")).toBeInTheDocument();
    expect(screen.getAllByText("Simple description without sections")).toHaveLength(2); // appears in 2 sections
  });

  it("handles training plan without warnings", () => {
    const planWithoutWarnings = {
      ...mockTrainingPlan,
      warnings: undefined,
    };

    render(<TrainingPlanDisplay trainingPlan={planWithoutWarnings} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.queryByText("Important Safety Information")).not.toBeInTheDocument();
  });

  it("handles empty warnings array", () => {
    const planWithEmptyWarnings = {
      ...mockTrainingPlan,
      warnings: [],
    };

    render(<TrainingPlanDisplay trainingPlan={planWithEmptyWarnings} exerciseImagesMap={mockExerciseImagesMap} />);

    expect(screen.queryByText("Important Safety Information")).not.toBeInTheDocument();
  });

  it("displays message when no exercises for a section", () => {
    const planWithoutSections = {
      ...mockTrainingPlan,
      exercises: [],
    };

    render(<TrainingPlanDisplay trainingPlan={planWithoutSections} exerciseImagesMap={{}} />);

    const noExercisesMessages = screen.getAllByText("No exercises for this section");
    expect(noExercisesMessages).toHaveLength(3); // One for each section
  });
});
