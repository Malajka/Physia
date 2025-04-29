import { cn } from "../../lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return <div className={cn("animate-spin rounded-full border-4 border-t-transparent border-primary h-8 w-8", className)} {...props} />;
}
