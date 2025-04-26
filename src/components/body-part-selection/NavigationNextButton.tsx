interface NavigationNextButtonProps {
  selectedBodyPartId: number | null;
}

export function NavigationNextButton({ selectedBodyPartId }: NavigationNextButtonProps) {
  const handleNext = () => {
    if (selectedBodyPartId) {
      const origin = window.location.origin;
      window.location.href = `${origin}/muscle-tests/${selectedBodyPartId}`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleNext}
      disabled={selectedBodyPartId === null}
      className={`
        px-6 py-2 rounded-md font-medium
        ${selectedBodyPartId === null ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}
      `}
      aria-disabled={selectedBodyPartId === null}
    >
      Next
    </button>
  );
}
