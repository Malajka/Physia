import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Function to create Supabase client at request time
export function createSupabaseClient() {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY;
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClient = typeof supabaseClient;

// Server-side instance for edge runtime compatibility
export function createSupabaseServerInstance({ headers }: { cookies: unknown; headers: Headers }) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
    },
    global: {
      headers: Object.fromEntries(headers.entries()),
    },
  });
}
