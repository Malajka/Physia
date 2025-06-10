import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Function to create Supabase client at request time
export function createSupabaseClient() {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY;

  // Debug logging for production
  console.log("Creating Supabase client with:", {
    SUPABASE_URL: supabaseUrl ? "✓ present" : "✗ missing",
    SUPABASE_PUBLIC_KEY: supabaseAnonKey ? "✓ present" : "✗ missing",
    DEV: import.meta.env.DEV,
    NODE_ENV: import.meta.env.NODE_ENV,
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`);
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Keep the old export for backward compatibility (but it will throw an error)
export const supabaseClient = createSupabaseClient();
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
