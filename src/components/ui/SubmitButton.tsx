import { Button } from "@/components/ui/Button";
import React from "react";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  children: React.ReactNode;
}

export const SubmitButton = React.memo(function SubmitButton({ loading = false, className, children, ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" size="lg" loading={loading} className={className} {...props}>
      {children}
    </Button>
  );
});

SubmitButton.displayName = "SubmitButton";
