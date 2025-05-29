import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import * as React from "react";

export interface DisclaimerModalProps {
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
        <Button onClick={onAccept} data-testid="accept-disclaimer" className="flex justify-center mx-auto">
          I Accept
        </Button>
      </div>
    }
  >
    <div className="whitespace-pre-line text-sm mb-4">{text}</div>
  </Modal>
);
