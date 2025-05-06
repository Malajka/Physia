import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { JSON_HEADERS } from "@/lib/utils/api";
import React, { useCallback, useState } from "react";

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton = React.memo(function LogoutButton({ className = "" }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: JSON_HEADERS,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Logout failed (status: ${response.status})`);
      }

      window.location.href = "/login";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      window.alert(`Logout error: ${message}`);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  return (
    <Button variant="ghost" size="default" onClick={handleLogout} disabled={isLoggingOut} aria-busy={isLoggingOut} className={cn(className)}>
      {isLoggingOut ? <Spinner className="h-4 w-4" /> : null}
      {isLoggingOut ? "Logging out..." : "Log out"}
    </Button>
  );
});

LogoutButton.displayName = "LogoutButton";
