import React from "react";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  className?: string;
}

const baseStyles = "inline-block rounded px-4 py-2 text-center transition-colors";

const variantStyles: Record<"primary" | "secondary" | "text", string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  text: "text-[var(--color-gray-800)] hover:underline",
};

export const LinkButton = React.memo(function LinkButton({ href, children, variant = "primary", className = "" }: LinkButtonProps) {
  return (
    <a href={href} className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </a>
  );
});

LinkButton.displayName = "LinkButton";
