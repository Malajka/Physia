/// <reference path="../.astro/types.d.ts" />
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare module "@tailwindcss/vite" {
  const plugin: () => unknown;
  export default plugin;
}

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;

      user: User | null;
    }
  }

  interface ImportMetaEnv {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_PUBLIC_KEY: string;
    readonly OPENROUTER_API_KEY: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly E2E_PASSWORD: string;
    readonly E2E_USERNAME: string;
    readonly E2E_USERNAME_ID: string;
    readonly OPENROUTER_USE_MOCK: string;
    readonly PUBLIC_SUPABASE_URL: string;
    readonly PUBLIC_SUPABASE_ANON_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
