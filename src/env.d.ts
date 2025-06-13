/// <reference path="../.astro/types.d.ts" />

// Import types for Supabase client and user, and your auto-generated DB types
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types"; // Verify this path is correct

declare global {
  namespace App {
    interface Locals {
      // Defines the Supabase client with your specific database types for full type safety.
      supabase: SupabaseClient<Database>;
      // Defines the user object, which can be a User or null.
      user: User | null;
    }
  }

  // Your existing environment variable definitions are correct.
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
