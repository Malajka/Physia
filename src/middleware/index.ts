import type { MiddlewareHandler } from "astro";
import { getSupabaseClient } from "../db/supabase.client";

export const onRequest: MiddlewareHandler = async (context, next) => {
  try {
    // Create Supabase client with context for runtime environment variables
    const supabase = getSupabaseClient(context);

    // Add Supabase client to locals for use in API routes and pages
    context.locals.supabase = supabase;

    console.log("✅ Middleware: Supabase client initialized successfully for:", context.url.pathname);
    return next();
  } catch (error) {
    console.error("❌ Middleware error:", error);
    return next();
  }
};
