import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import * as React from "react";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ open, onAccept }) => (
  <Modal
    open={open}
    onClose={() => {
      /* Prevent closing without acceptance */
    }}
    title="Medical Disclaimer"
    footer={
      <div className="flex justify-between items-center w-full">
        <Button onClick={onAccept}>I Accept</Button>
      </div>
    }
  >
    <p className="mb-4">
      Please read and accept our medical disclaimer before proceeding. By accepting, you acknowledge that this service does not replace professional
      medical advice and that you assume all responsibility for your actions.
    </p>
    <ul className="list-disc list-inside text-sm space-y-2">
      <li>Consult a healthcare professional before performing any exercises.</li>
      <li>Stop immediately if you experience pain or discomfort.</li>
      <li>These exercises are suggestions, not personalized medical advice.</li>
    </ul>
  </Modal>
);
