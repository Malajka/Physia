// src/middleware/index.test.ts

import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

// Removed vi.mock from here as it's replaced by configuration in vite.config.ts

import { handleAuthRedirects, handleDisclaimerCheck, handleProtectedRoute } from "./index";

const mockUserWithoutDisclaimer: Partial<User> = {
  user_metadata: {},
};

describe("Middleware logic", () => {
  describe("handleAuthRedirects", () => {
    it("redirects authenticated user from /login", () => {
      const res = handleAuthRedirects("/login", true);
      expect(res).toBeInstanceOf(Response);
      expect(res?.status).toBe(302);
      expect(res?.headers.get("Location")).toBe("/sessions");
    });
  });

  describe("handleProtectedRoute", () => {
    it("redirects unauthenticated user from protected UI route", () => {
      const res = handleProtectedRoute("/sessions", false);
      expect(res).toBeInstanceOf(Response);
      expect(res?.status).toBe(302);
      expect(res?.headers.get("Location")).toBe("/login");
    });
  });

  describe("handleDisclaimerCheck", () => {
    it("redirects if disclaimer not accepted", () => {
      const res = handleDisclaimerCheck("/sessions", mockUserWithoutDisclaimer as User);
      expect(res).toBeInstanceOf(Response);
      expect(res?.status).toBe(302);
      expect(res?.headers.get("Location")).toBe("/body-parts");
    });
  });
});
