import React from "react";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text" | "nav-link" | "nav-primary" | "nav-secondary" | "nav-muted";
  className?: string;
  "data-testid"?: string;
}

const baseStyles = "inline-block rounded px-4 py-2 text-center transition-colors";

const variantStyles: Record<"primary" | "secondary" | "text" | "nav-link" | "nav-primary" | "nav-secondary" | "nav-muted", string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 hover:opacity-80",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:opacity-80",
  text: "text-[var(--color-gray-800)] hover:underline",
  "nav-link": "text-[var(--gray-text)] hover:text-[var(--primary)] hover:underline text-lg font-bold text-right",
  "nav-primary":
    "px-6 py-3 bg-[var(--primary)] border border-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg rounded-xl shadow-md text-center hover:opacity-80",
  "nav-secondary":
    "px-6 py-3 bg-[var(--card)] border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--light-green)] font-bold text-lg rounded-xl shadow-md text-center hover:opacity-80",
  "nav-muted": "px-6 py-3 text-[var(--gray-text)] hover:text-[var(--primary)] hover:underline text-lg font-bold",
};

export const LinkButton = React.memo(function LinkButton({
  href,
  children,
  variant = "primary",
  className = "",
  "data-testid": dataTestId,
}: LinkButtonProps) {
  return (
    <a href={href} className={`${baseStyles} ${variantStyles[variant]} ${className}`} data-testid={dataTestId}>
      {children}
    </a>
  );
});

LinkButton.displayName = "LinkButton";
