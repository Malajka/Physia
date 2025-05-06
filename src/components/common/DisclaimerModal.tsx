import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import * as React from "react";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
  /** The dynamic disclaimer text to display */
  text: string;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ open, onAccept, text }) => (
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
    <div className="whitespace-pre-line text-sm mb-4">{text}</div>
    <ul className="list-disc list-inside text-sm space-y-2">
      <li>Consult a healthcare professional before performing any exercises.</li>
      <li>Stop immediately if you experience pain or discomfort.</li>
      <li>These exercises are suggestions, not personalized medical advice.</li>
    </ul>
  </Modal>
);
