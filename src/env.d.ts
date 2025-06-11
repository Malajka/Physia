/// <reference types="astro/client" />

import type { SupabaseClient } from "./db/supabase.client";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_PUBLIC_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_USE_MOCK: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
