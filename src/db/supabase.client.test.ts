// src/db/supabase.client.test.ts

import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the entire @supabase/supabase-js module
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

describe("Supabase Client (supabase.client.ts)", () => {
  // Get the mocked function to track it in tests
  let createClient: Mock;

  beforeEach(async () => {
    // IMPORTANT: Clear module cache before each test
    // This allows us to import supabase.client.ts multiple times under different conditions
    vi.resetModules();

    // Reset spies to ensure clean call counters for each test
    vi.clearAllMocks();

    // Import the mocked `createClient` function to assign it to our variable
    const { createClient: mockCreateClient } = await import("@supabase/supabase-js");
    createClient = mockCreateClient as Mock;
  });

  it("powinien zainicjalizować klienta Supabase, gdy zmienne środowiskowe są ustawione", async () => {
    const mockUrl = "https://test.supabase.co";
    const mockKey = "test_anon_key";

    // Set fake environment variables for this test
    vi.stubEnv("PUBLIC_SUPABASE_URL", mockUrl);
    vi.stubEnv("PUBLIC_SUPABASE_ANON_KEY", mockKey);

    // Dynamically import the module - at this point its code executes
    await import("./supabase.client");

    // Check if createClient was called exactly once
    expect(createClient).toHaveBeenCalledTimes(1);

    // Check if it was called with correct variables
    expect(createClient).toHaveBeenCalledWith(mockUrl, mockKey);
  });

  it("powinien rzucić błąd, gdy brakuje zmiennych środowiskowych", async () => {
    // Ensure variables are empty
    vi.stubEnv("PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("PUBLIC_SUPABASE_ANON_KEY", "");

    // Define function that attempts to import the module
    const importModule = async () => await import("./supabase.client");

    // Expect the import attempt to be rejected (error)
    // Also check if the error message matches the expected one
    await expect(importModule).rejects.toThrow(
      "Supabase URL or Anon Key is missing in client-side environment variables. Check your .env file and ensure they have the PUBLIC_ prefix."
    );

    // Finally, ensure that in this case the client was NOT created
    expect(createClient).not.toHaveBeenCalled();
  });
});
