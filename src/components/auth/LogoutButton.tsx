import { Button, Spinner } from "@/components/ui";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton = function LogoutButton({ className = "" }: LogoutButtonProps) {
  const { isLoggingOut, logout } = useLogout();

  return (
    <Button
      variant="default"
      size="default"
      onClick={logout}
      disabled={isLoggingOut}
      aria-busy={isLoggingOut}
      className={cn(className)}
      data-testid="logout-button"
    >
      {isLoggingOut ? <Spinner className="h-4 w-4" /> : null}
      {isLoggingOut ? "Logging out..." : "Log out"}
    </Button>
  );
};
