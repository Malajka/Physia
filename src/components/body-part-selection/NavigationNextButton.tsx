import { useCallback } from "react";

interface NavigationNextButtonProps {
  selectedBodyPartId: number | null;
}

export function NavigationNextButton({ selectedBodyPartId }: NavigationNextButtonProps) {
  const isDisabled = selectedBodyPartId == null;
  const handleNext = useCallback(() => {
    if (selectedBodyPartId != null) {
      // navigate to the muscle-tests page
      window.location.pathname = `/muscle-tests/${selectedBodyPartId}`;
    }
  }, [selectedBodyPartId]);

  return (
    <button
      type="button"
      onClick={handleNext}
      disabled={isDisabled}
      className={`px-6 py-2 rounded-md font-medium ${
        isDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      Next
    </button>
  );
}
