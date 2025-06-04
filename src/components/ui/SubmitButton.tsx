import React from "react";
import { Button } from "./Button";

interface SubmitButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "data-testid"?: string;
}

export const SubmitButton = React.memo(function SubmitButton({ loading = false, className, children, ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" size="lg" loading={loading} className={className} {...props}>
      {children}
    </Button>
  );
});

SubmitButton.displayName = "SubmitButton";
