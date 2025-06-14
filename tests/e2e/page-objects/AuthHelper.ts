import type { BrowserContext, Page } from "@playwright/test";

declare global {
  interface Window {
    supabase?: {
      auth: {
        signOut: () => Promise<{ error: Error | null }>;
      };
    };

    indexedDB: IDBFactory & {
      databases?(): Promise<IDBDatabaseInfo[]>;
    };
  }
}

interface IDBDatabaseInfo {
  name?: string;
  version?: number;
}

export async function ensureLoggedOut(page: Page, context: BrowserContext): Promise<void> {
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await clearBrowserStorage(page);

    await context.clearCookies();

    await attemptApiLogout(page);

    await attemptSupabaseLogout(page);

    await page.waitForTimeout(500);
  } catch (error) {
    console.error("Error in ensureLoggedOut:", error);
  }
}

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
      } catch {}
    }
  });
}

async function attemptApiLogout(page: Page): Promise<void> {
  try {
    await page.request.post("/api/auth/logout");
  } catch {}
}

async function attemptSupabaseLogout(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.evaluate(async () => {
    if (typeof window.supabase?.auth?.signOut === "function") {
      try {
        await window.supabase.auth.signOut();
        return "success";
      } catch {
        return "error";
      }
    }
    return "not_applicable";
  });
}

export async function logoutViaAPI(page: Page): Promise<void> {
  try {
    await page.request.post("/api/logout");
  } catch {}
}

export const AuthHelper = {
  ensureLoggedOut,
  logoutViaAPI,
};
