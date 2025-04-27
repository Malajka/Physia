import { NavigationNextButton } from "../common/NavigationNextButton";
import { useBodyParts } from "../hooks/useBodyParts";
import { useSingleSelection } from "../hooks/useSingleSelection";
import { BodyPartButton } from "./BodyPartButton";

export default function BodyPartSelector() {
  const { bodyParts, loading, error: fetchError, refetch } = useBodyParts();
  const { selected: selectedBodyPartId, toggle: handleSelect } = useSingleSelection<number>();

  const handleRefresh = () => refetch();

  if (loading) {
    return <div className="text-center py-8">Loading body areas...</div>;
  }

  if (fetchError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{fetchError}</p>
        <button onClick={handleRefresh} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  if (bodyParts.length === 0) {
    return <div className="text-center py-8">No body areas available</div>;
  }

  return (
    <div className="space-y-8">
      <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded mb-4">
        Select max 1 area. Click a selected area again to deselect.
      </div>

      <div className="grid grid-cols-2 gap-4">
        {bodyParts.map((bodyPart) => (
          <BodyPartButton
            key={bodyPart.id}
            id={bodyPart.id}
            name={bodyPart.name}
            selected={selectedBodyPartId === bodyPart.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <NavigationNextButton selectedBodyPartId={selectedBodyPartId} />
      </div>
    </div>
  );
}
