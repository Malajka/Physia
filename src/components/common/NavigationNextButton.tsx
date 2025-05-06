interface NavigationNextButtonProps {
  selectedBodyPartId: number | null;
}

export function NavigationNextButton({ selectedBodyPartId }: NavigationNextButtonProps) {
  const handleNext = () => {
    if (selectedBodyPartId) {
      window.location.href = `/muscle-tests/${selectedBodyPartId}`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleNext}
      disabled={selectedBodyPartId === null}
      className={`px-6 py-2 rounded-xl shadow-md transition-colors bg-[var(--primary)] border border-[var(--primary)] text-[var(--primary-foreground)] cursor-pointer ${
        selectedBodyPartId === null ? "opacity-50" : ""
      }`}
      aria-disabled={selectedBodyPartId === null}
    >
      Next
    </button>
  );
}
