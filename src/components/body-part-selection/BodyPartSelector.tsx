import { useEffect, useState } from "react";
import type { BodyPartDto } from "../../types";
import { NavigationNextButton } from "../common/NavigationNextButton";
import { BodyPartButton } from "./BodyPartButton";

export default function BodyPartSelector() {
  const [bodyParts, setBodyParts] = useState<BodyPartDto[]>([]);
  const [selectedBodyPartId, setSelectedBodyPartId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchBodyParts();
  }, []);

  const fetchBodyParts = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const response = await fetch("/api/body_parts");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch body parts");
      }

      const data = await response.json();
      setBodyParts(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "An error occurred while fetching body parts");
      console.error("Error fetching body parts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: number) => {
    if (selectedBodyPartId !== null && selectedBodyPartId !== id) {
      setError("Select max 1 area");
      return;
    }

    setSelectedBodyPartId(selectedBodyPartId === id ? null : id);
    setError(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading body areas...</div>;
  }

  if (fetchError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{fetchError}</p>
        <button onClick={fetchBodyParts} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
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
      {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

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
