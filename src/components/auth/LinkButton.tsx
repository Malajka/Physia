interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  className?: string;
}

export const LinkButton = ({ href, children, variant = "primary", className = "" }: LinkButtonProps) => {
  const baseStyles = "inline-block rounded px-4 py-2 text-center transition-colors";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    text: "text-blue-600 hover:text-blue-800 hover:underline",
  };

  return (
    <a href={href} className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </a>
  );
};
