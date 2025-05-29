import { BodyPartButton } from "@/components/body-part-selection/BodyPartButton";
import { DisclaimerModal } from "@/components/common/DisclaimerModal";
import { InfoBar } from "@/components/ui/InfoBar";
import { useBodyParts } from "@/hooks/useBodyParts";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import { useSingleSelection } from "@/hooks/useSingleSelection";
import { useCallback } from "react";
import { NavigationNextButton } from "./NavigationNextButton";

function StatusMessage({ text, error = false, children }: { text: string; error?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`text-center py-8 ${error ? "text-red-600" : ""}`}>
      <p>{text}</p>
      {children}
    </div>
  );
}

export default function BodyPartSelector() {
  const {
    disclaimerText,
    acceptedAt,
    loading: discLoading,
    error: discError,
    accept
  } = useDisclaimer();

  const {
    bodyParts,
    loading: bpLoading,
    error: bpError,
    refetch
  } = useBodyParts({ disclaimerAccepted: acceptedAt });

  const { selected: selectedBodyPartId, toggle } = useSingleSelection<number>();
  const handleSelect = useCallback((id: number) => toggle(id), [toggle]);

  if (discLoading) return <StatusMessage text="Loading disclaimer..." />;
  if (discError) return <StatusMessage text={`Disclaimer Error: ${discError}`} error />;

  if (!acceptedAt) {
    return <DisclaimerModal open onAccept={accept} text={disclaimerText || "Loading disclaimer text..."} />;
  }

  if (bpLoading) return <StatusMessage text="Loading body areas..." />;
  if (bpError)
    return (
      <StatusMessage text={`Error loading body parts: ${bpError}`} error>
        <button onClick={refetch} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </StatusMessage>
    );

  if (!bodyParts || bodyParts.length === 0) {
    return <StatusMessage text="No body areas available." />;
  }

  return (
    <div className="space-y-8">
      <InfoBar>Select max 1 area. Click a selected area again to deselect.</InfoBar>
      <div className="grid grid-cols-2 gap-[15px] justify-items-center">
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