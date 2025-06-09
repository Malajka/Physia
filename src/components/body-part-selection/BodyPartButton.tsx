import { slugify } from "@/lib/utils/slugify";
import { memo } from "react";

interface BodyPartButtonProps {
  id: number;
  name: string;
  selected: boolean;
  onSelect: (id: number) => void;
}

const baseClass =
  "relative overflow-hidden w-full h-48 rounded-lg border flex items-end justify-center p-4 text-center font-medium text-lg uppercase drop-shadow-md transform transition-all ease-in-out duration-500 active:scale-[0.98] hover:scale-[1.02] cursor-pointer";
const selectedClass = "bg-primary border-primary text-white hover:bg-light-green hover:text-primary";
const unselectedClass = "bg-gray-50 border-gray-200 text-black hover:bg-white";

function BodyPartButtonComponent({ id, name, selected, onSelect }: BodyPartButtonProps) {
  if (!name) return null;

  const slug = slugify(name);
  const imageSrc = `/images/body-parts/${slug}.png`;

  const style = {
    backgroundImage: `url(${imageSrc})`,
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      aria-label={`Select ${name}`}
      style={style}
      className={`${baseClass} ${selected ? selectedClass : unselectedClass} bg-cover sm:bg-contain bg-center bg-no-repeat`}
      data-testid={`body-part-${slug}`}
    >
      {!selected && <div className="absolute inset-0 bg-[var(--background)] opacity-35" aria-hidden="true" />}
      <span className={`relative z-10 px-2 py-1 rounded ${selected ? "bg-[var(--background)] text-primary" : "bg-[var(--primary)] text-white"}`}>
        {name}
      </span>
    </button>
  );
}

export const BodyPartButton = memo(BodyPartButtonComponent);
