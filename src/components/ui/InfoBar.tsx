import React from "react";

interface InfoBarProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoBar({ children, className = "" }: InfoBarProps) {
  return <div className={`p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded mb-4 ${className}`}>{children}</div>;
}
