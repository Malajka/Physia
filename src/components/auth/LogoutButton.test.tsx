import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoutButton } from "./LogoutButton";

// Mock the useLogout hook
vi.mock("@/hooks/useLogout", () => ({
  useLogout: vi.fn(),
}));

// Mock Spinner component
vi.mock("@/components/ui/Spinner", () => ({
  Spinner: (props: any) => <span data-testid="spinner" {...props}>spinner</span>,
}));

describe("LogoutButton", () => {
  const getUseLogoutMock = async () => {
    const { useLogout } = await import("@/hooks/useLogout");
    return useLogout as any;
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("UI Rendering", () => {
    it("renders button with correct text when not loading", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      
      const button = screen.getByTestId("logout-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Log out");
      expect(button).not.toBeDisabled();
    });

    it("renders button with loading state", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: true,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      
      const button = screen.getByTestId("logout-button");
      expect(button).toHaveTextContent("Logging out...");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("applies custom className", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton className="custom-class" />);
      
      const button = screen.getByTestId("logout-button");
      expect(button).toHaveClass("custom-class");
    });

    it("has correct button attributes", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      
      const button = screen.getByTestId("logout-button");
      expect(button).toHaveAttribute("data-testid", "logout-button");
      expect(button).toHaveRole("button");
    });
  });

  describe("Loading States", () => {
    it("shows spinner only when loading", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: true,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("does not show spinner when not loading", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    it("sets aria-busy attribute when loading", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: true,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      expect(screen.getByTestId("logout-button")).toHaveAttribute("aria-busy", "true");
    });

    it("sets aria-busy attribute when not loading", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      expect(screen.getByTestId("logout-button")).toHaveAttribute("aria-busy", "false");
    });
  });

  describe("Interaction", () => {
    it("calls logout function when clicked", async () => {
      const useLogoutMock = await getUseLogoutMock();
      const mockLogout = vi.fn();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: mockLogout,
      });

      render(<LogoutButton />);
      
      const button = screen.getByTestId("logout-button");
      button.click();
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("does not call logout when disabled/loading", async () => {
      const useLogoutMock = await getUseLogoutMock();
      const mockLogout = vi.fn();
      useLogoutMock.mockReturnValue({
        isLoggingOut: true,
        error: null,
        logout: mockLogout,
      });

      render(<LogoutButton />);
      
      const button = screen.getByTestId("logout-button");
      expect(button).toBeDisabled();
      
      // Try to click disabled button
      button.click();
      
      // Should not be called because button is disabled
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });

  describe("Hook Integration", () => {
    it("integrates with useLogout hook", async () => {
      const useLogoutMock = await getUseLogoutMock();
      const mockLogout = vi.fn();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: "Some error",
        logout: mockLogout,
      });

      render(<LogoutButton />);
      
      expect(useLogoutMock).toHaveBeenCalled();
      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    });

    it("displays different states based on hook values", async () => {
      const useLogoutMock = await getUseLogoutMock();
      const mockLogout = vi.fn();
      
      // Test loading state
      useLogoutMock.mockReturnValue({
        isLoggingOut: true,
        error: null,
        logout: mockLogout,
      });

      const { unmount } = render(<LogoutButton />);
      expect(screen.getByTestId("logout-button")).toHaveTextContent("Logging out...");
      unmount();

      // Test normal state  
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: mockLogout,
      });

      render(<LogoutButton />);
      expect(screen.getByTestId("logout-button")).toHaveTextContent("Log out");
    });
  });

  describe("Component Props", () => {
    it("handles empty className", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton className="" />);
      
      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    });

    it("handles undefined className", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      
      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: false,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      
      const button = screen.getByTestId("logout-button");
      expect(button).toHaveRole("button");
      expect(button).toHaveAttribute("aria-busy");
    });

    it("is accessible when loading", async () => {
      const useLogoutMock = await getUseLogoutMock();
      useLogoutMock.mockReturnValue({
        isLoggingOut: true,
        error: null,
        logout: vi.fn(),
      });

      render(<LogoutButton />);
      
      const button = screen.getByTestId("logout-button");
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toBeDisabled();
    });
  });
}); 