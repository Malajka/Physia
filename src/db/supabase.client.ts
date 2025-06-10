import { createClient } from "@supabase/supabase-js";
import type { APIContext } from "astro";

import type { Database } from "./database.types";

// Function to create Supabase client at request time
export function createSupabaseClient(context?: APIContext) {
  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;

  if (context) {
    // Runtime access via Cloudflare Pages context
    const runtime = (context.locals as unknown as { runtime?: { env?: Record<string, string> } })?.runtime;
    supabaseUrl = runtime?.env?.SUPABASE_URL;
    supabaseAnonKey = runtime?.env?.SUPABASE_PUBLIC_KEY;
  } else {
    // Build-time access via import.meta.env
    supabaseUrl = import.meta.env.SUPABASE_URL;
    supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`);
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// For runtime usage, we create a fresh client each time with context
export function getSupabaseClient(context?: APIContext) {
  return createSupabaseClient(context);
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
