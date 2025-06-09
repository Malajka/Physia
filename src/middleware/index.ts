import { getSupabaseClient } from "@/db/supabase.client";
import type { MiddlewareHandler } from "astro";
import { handleRequest } from "./middlewareHandler";

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.supabase = getSupabaseClient();
  return handleRequest(context, next);
};
