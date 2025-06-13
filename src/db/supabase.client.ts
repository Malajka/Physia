// src/db/supabase.client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Use PUBLIC_ prefixed variables that Astro safely exposes to the frontend
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Add protection in case variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or Anon Key is missing in client-side environment variables. Check your .env file and ensure they have the PUBLIC_ prefix."
  );
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClient = typeof supabaseClient;
