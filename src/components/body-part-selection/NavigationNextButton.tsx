import { Button } from "@/components/ui/Button";
import { useCallback } from "react";

interface NavigationNextButtonProps {
  selectedBodyPartId: number | null;
  className?: string;
  onNavigate?: (id: number) => void;
}

export function NavigationNextButton({ selectedBodyPartId, className = "", onNavigate }: NavigationNextButtonProps) {
  const isDisabled = selectedBodyPartId == null;

  const handleNext = useCallback(() => {
    if (selectedBodyPartId != null) {
      if (onNavigate) {
        onNavigate(selectedBodyPartId);
      } else {
        window.location.pathname = `/muscle-tests/${selectedBodyPartId}`;
      }
    }
  }, [selectedBodyPartId, onNavigate]);

  return (
    <Button
      type="button"
      onClick={handleNext}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      size="lg"
      className={className}
      title={isDisabled ? "Select a body part to continue" : "Go to muscle tests"}
      data-testid="body-part-next"
    >
      Next
    </Button>
  );
}
