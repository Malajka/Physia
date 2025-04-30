import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { AcceptDisclaimerResponseDto, DisclaimersContentDto } from "../../types";
import { NavigationNextButton } from "../common/NavigationNextButton";
import { useBodyParts } from "../hooks/useBodyParts";
import { useSingleSelection } from "../hooks/useSingleSelection";
import { BodyPartButton } from "./BodyPartButton";

export default function BodyPartSelector() {
  // Hooks must be called unconditionally
  const [disclaimerText, setDisclaimerText] = useState<string>("");
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [discLoading, setDiscLoading] = useState<boolean>(true);
  const [discError, setDiscError] = useState<string | null>(null);
  const { bodyParts, loading: bpLoading, error: bpError, refetch } = useBodyParts();
  const { selected: selectedBodyPartId, toggle: handleSelect } = useSingleSelection<number>();

  // Fetch disclaimer text and acceptance status
  useEffect(() => {
    async function loadDisclaimer() {
      try {
        const res = await fetch("/api/disclaimers", { credentials: "same-origin" });
        if (!res.ok) throw new Error(res.statusText);
        const data = (await res.json()) as DisclaimersContentDto & { accepted_at?: string | null };
        setDisclaimerText(data.text);
        setAcceptedAt(data.accepted_at ?? null);
      } catch (e) {
        setDiscError(e instanceof Error ? e.message : String(e));
      } finally {
        setDiscLoading(false);
      }
    }
    loadDisclaimer();
  }, []);

  // Handler to accept disclaimer via API
  const handleAccept = async () => {
    try {
      const res = await fetch("/api/disclaimers", { method: "POST", credentials: "same-origin" });
      if (!res.ok) throw new Error(res.statusText);
      const data = (await res.json()) as AcceptDisclaimerResponseDto;
      setAcceptedAt(data.accepted_at);
    } catch (e) {
      setDiscError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleRefresh = () => refetch();

  // Show loading or error for disclaimer fetch
  if (discLoading) {
    return <div className="text-center py-8">Loading disclaimer...</div>;
  }
  if (discError) {
    return <div className="text-center py-8 text-red-600">{discError}</div>;
  }

  // Show disclaimer modal until accepted
  if (!acceptedAt) {
    return (
      <Modal
        open={true}
        onClose={() => {
          /* Prevent closing without acceptance */
        }}
        title="Medical Disclaimer"
        footer={
          <div className="flex justify-center w-full">
            <Button onClick={handleAccept}>I Accept</Button>
          </div>
        }
      >
        <div className="whitespace-pre-line text-sm mb-4">{disclaimerText}</div>
      </Modal>
    );
  }

  // After acceptance, show body part selection UI
  if (bpLoading) {
    return <div className="text-center py-8">Loading body areas...</div>;
  }

  if (bpError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{bpError}</p>
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
