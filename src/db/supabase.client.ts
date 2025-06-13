// src/db/supabase.client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Używamy zmiennych z prefiksem PUBLIC_, które Astro bezpiecznie udostępnia do frontendu
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Dodajemy zabezpieczenie na wypadek, gdyby zmienne nie były ustawione
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or Anon Key is missing in client-side environment variables. Check your .env file and ensure they have the PUBLIC_ prefix."
  );
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClient = typeof supabaseClient;
