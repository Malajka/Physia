// AuthHelper.ts - Authentication helper for E2E tests
import type { BrowserContext, Page } from "@playwright/test";

declare global {
  interface Window {
    supabase?: {
      auth: {
        signOut: () => Promise<{ error: Error | null }>;
      };
    };
    // Add definition for indexedDB.databases() if not globally available
    indexedDB: IDBFactory & {
      databases?(): Promise<IDBDatabaseInfo[]>;
    };
  }
}

interface IDBDatabaseInfo {
  name?: string;
  version?: number;
}

/**
 * Ensures the user is logged out by clearing all storage and calling logout APIs
 * @param page - Playwright page instance
 * @param context - Playwright browser context
 */
export async function ensureLoggedOut(page: Page, context: BrowserContext): Promise<void> {
  try {
    // Navigate to home page to ensure proper context for scripts
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Clear all browser storage
    await clearBrowserStorage(page);

    // Clear cookies and wait for completion
    await context.clearCookies();

    // Attempt API logout
    await attemptApiLogout(page);

    // Attempt Supabase logout
    await attemptSupabaseLogout(page);

    // Additional wait to ensure all cleanup operations complete
    await page.waitForTimeout(500);
  } catch (error) {
    console.error("Error in ensureLoggedOut:", error);
    // Consider throwing error if logout is critical for test correctness
    // throw error;
  }
}

/**
 * Clears all browser storage including localStorage, sessionStorage, and IndexedDB
 * @param page - Playwright page instance
 */
async function clearBrowserStorage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();

    if ("indexedDB" in window && typeof window.indexedDB.databases === "function") {
      try {
        const dbs = await window.indexedDB.databases();
        for (const db of dbs) {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        }
      } catch {
        // IndexedDB clearing failed - this is non-critical for tests
      }
    }
  });
}

/**
 * Attempts to logout via API endpoint
 * @param page - Playwright page instance
 */
async function attemptApiLogout(page: Page): Promise<void> {
  try {
    await page.request.post("/api/auth/logout");
  } catch {
    // API auth logout attempt failed or endpoint not found (non-critical)
  }
}

/**
 * Attempts to logout via Supabase client
 * @param page - Playwright page instance
 */
async function attemptSupabaseLogout(page: Page): Promise<void> {
  // Navigate to home page again if previous actions changed the page
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.evaluate(async () => {
    if (typeof window.supabase?.auth?.signOut === "function") {
      try {
        await window.supabase.auth.signOut();
        return "success";
      } catch {
        // Supabase signOut error occurred
        return "error";
      }
    }
    return "not_applicable";
  });
}

/**
 * Legacy function for API logout - kept for backward compatibility
 * @param page - Playwright page instance
 */
export async function logoutViaAPI(page: Page): Promise<void> {
  try {
    await page.request.post("/api/logout");
  } catch {
    // API logout error (expected or non-critical)
  }
}

// Legacy class export for backward compatibility
export const AuthHelper = {
  ensureLoggedOut,
  logoutViaAPI,
};
