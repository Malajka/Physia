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

interface SupabaseContext {
  headers: Headers;
  cookies: AstroCookies;
}

const createSupabaseInstance = (apiKey: string, context: SupabaseContext) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  return createServerClient<Database>(supabaseUrl, apiKey, {
    cookieOptions,
    cookies: {
      // @ts-expect-error - correct implementation per Supabase docs
      getAll() {
        const cookieHeader = context.headers.get("Cookie") ?? "";
        return parseCookieHeader(cookieHeader);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });
};

export const createSupabaseServerInstance = (context: SupabaseContext) => {
  const supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY;
  return createSupabaseInstance(supabaseAnonKey, context);
};

// For backward compatibility - use regular client in development, SSR in production
export function createSupabaseClient() {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY;

  // Use regular client for development to avoid cookie issues
  if (process.env.NODE_ENV === "development") {
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  // Use SSR client for production
  const dummyContext: SupabaseContext = {
    headers: new Headers(),
    cookies: {
      set: () => {
        // No-op in dummy context
      },
      get: () => undefined,
      has: () => false,
      delete: () => {
        // No-op in dummy context
      },
      getAll: () => [],
    } as unknown as AstroCookies,
  };

  return createSupabaseInstance(supabaseAnonKey, dummyContext);
}

export const supabaseClient = createSupabaseClient();

// Create a unified interface that both client types can satisfy
export interface SupabaseClient {
  auth: {
    getUser(): Promise<any>;
    getSession(): Promise<any>;
    setSession(session: any): Promise<any>;
    updateUser(attributes: any): Promise<any>;
    signInWithPassword(credentials: any): Promise<any>;
    signUp(userAttributes: any): Promise<any>;
    signOut(): Promise<any>;
  };
  from(table: string): any;
}
