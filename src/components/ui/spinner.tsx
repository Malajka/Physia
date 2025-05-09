import { cn } from "@/lib/utils";

export function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-spin rounded-full border-4 border-t-transparent border-primary h-8 w-8", className)} {...props} />;
}
