import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LogoutButton } from "./LogoutButton";

// Mock Spinner to avoid rendering its internals
vi.mock("@/components/ui/Spinner", () => ({
  Spinner: () => <span data-testid="spinner">spinner</span>,
}));

// Mock window.location and alert
const originalLocation = window.location;
beforeEach(() => {
  // @ts-ignore
  delete window.location;
  window.location = { href: "" } as any;
  vi.spyOn(window, "alert").mockImplementation(() => {});
});
afterEach(() => {
  window.location = originalLocation;
  vi.restoreAllMocks();
});

describe("LogoutButton", () => {
  it("renders button with text", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls fetch and redirects on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(window.location.href).toBe("/login");
    });
  });

  it("shows spinner and disables button while logging out", async () => {
    let resolveFetch: any;
    vi.stubGlobal("fetch", () => new Promise(res => { resolveFetch = res; }));
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    // finish fetch
    resolveFetch({ ok: true });
    await waitFor(() => expect(window.location.href).toBe("/login"));
  });

  it("shows alert on error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve("fail") }));
    const alertSpy = vi.spyOn(window, "alert");
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/logout error/i));
    });
  });

  it("shows alert with fallback error message when response.text() is empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve("") }));
    const alertSpy = vi.spyOn(window, "alert");
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/logout failed/i));
    });
  });

  it("shows alert with 'Unknown error' if thrown error is not an instance of Error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => { throw "some string error"; }));
    const alertSpy = vi.spyOn(window, "alert");
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/unknown error/i));
    });
  });
}); 