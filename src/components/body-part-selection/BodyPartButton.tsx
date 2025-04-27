interface BodyPartButtonProps {
  id: number;
  name: string;
  selected: boolean;
  onSelect: (id: number) => void;
}

export function BodyPartButton({ id, name, selected, onSelect }: BodyPartButtonProps) {
  const baseClasses =
    "w-full p-6 rounded-lg border flex flex-col items-center justify-center gap-4 transition-colors duration-200 bg-gray-50 hover:bg-gray-100 border-gray-200";
  return (
    <>
      <style>{`
        .body-part-button[aria-pressed="true"] {
          background-color: #059669;
          border-color: #047857;
          color: #ffffff ;
        }
      `}</style>
      <button type="button" onClick={() => onSelect(id)} className={`body-part-button ${baseClasses}`} aria-pressed={selected}>
        {/* Placeholder icon - replace with actual SVG icons */}
        <div className={selected ? "w-16 h-16 text-white" : "w-16 h-16 text-gray-400"}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <span className="font-medium text-lg">{name}</span>
      </button>
    </>
  );
}
