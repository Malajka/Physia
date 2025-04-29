import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton = ({ className = "" }: LogoutButtonProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      // Redirect to login page after successful logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`text-gray-700 hover:text-blue-600 hover:underline ${className} ${
        isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoggingOut ? "Logging out..." : "Log out"}
    </button>
  );
}; 