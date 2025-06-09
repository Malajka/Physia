import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Funkcja do pobierania zmiennych środowiskowych w runtime
function getEnvVar(name: string): string {
  // W development używamy import.meta.env
  if (import.meta.env.DEV) {
    return import.meta.env[name] || "";
  }

  // W production na Cloudflare Pages próbujemy różnych źródeł
  if (typeof globalThis !== "undefined" && globalThis.process?.env) {
    return globalThis.process.env[name] || "";
  }

  // Fallback do import.meta.env
  return import.meta.env[name] || "";
}

const supabaseUrl = getEnvVar("SUPABASE_URL");
const supabaseAnonKey = getEnvVar("SUPABASE_PUBLIC_KEY");

// Debug logging dla production
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    SUPABASE_URL: supabaseUrl ? "✓" : "✗",
    SUPABASE_PUBLIC_KEY: supabaseAnonKey ? "✓" : "✗",
    DEV: import.meta.env.DEV,
    NODE_ENV: import.meta.env.NODE_ENV,
  });
  throw new Error("Supabase environment variables are not configured properly");
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClient = typeof supabaseClient;
