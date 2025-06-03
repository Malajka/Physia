import { cn } from "@/lib/utils";
import * as React from "react";

export interface ModalProps {
  /** Controls visibility of the modal */
  open: boolean;
  /** Callback when the modal requests to close (e.g. backdrop click or Escape) */
  onClose: () => void;
  /** Optional title shown at the top */
  title?: React.ReactNode;
  /** Main body content of the modal */
  children: React.ReactNode;
  /** Optional footer area for actions */
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer }) => {
  // Close on Escape key
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal content */}
      <div role="dialog" aria-modal="true" className={cn("relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full")}>
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        <div className="mb-4">{children}</div>
        {footer && <div className="flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};
