import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoutButton } from "./LogoutButton";

const mockUseLogoutReturn = {
  isLoggingOut: false,
  logout: vi.fn(),
};

vi.mock("@/hooks/useLogout", () => ({
  useLogout: () => mockUseLogoutReturn,
}));

vi.mock("@/components/ui/Spinner", () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogoutReturn.isLoggingOut = false;
  });

  it("should render in the default state", () => {
    render(<LogoutButton />);

    const button = screen.getByRole("button", { name: /log out/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("should render in the loading state when isLoggingOut is true", () => {
    mockUseLogoutReturn.isLoggingOut = true;
    render(<LogoutButton />);

    const button = screen.getByRole("button", { name: /logging out/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should call the logout function from the hook when clicked", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);
    const button = screen.getByRole("button", { name: /log out/i });

    await user.click(button);

    expect(mockUseLogoutReturn.logout).toHaveBeenCalledTimes(1);
  });
});
