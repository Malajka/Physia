import React from "react";
import { cn } from "@/lib/utils";

export function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("physio-spinner-container", className)} {...props}>
      <svg className="physio-pulse-icon" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.2" />
        <circle cx="32" cy="32" r="24" stroke="#1ea39a" strokeWidth="3" fill="none" opacity="0.4" />
      </svg>
      <style>{`
        .physio-spinner-container {
          display: inline-block;
        }
        .physio-pulse-icon {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
