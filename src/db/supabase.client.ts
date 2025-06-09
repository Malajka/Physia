import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Function to create Supabase client at request time
export function createSupabaseClient() {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`);
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Lazy initialization - only create when actually needed
let _supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createSupabaseClient();
  }
  return _supabaseClient;
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
