import { supabaseClient } from "@/db/supabase.client";
import type { MiddlewareHandler } from "astro";
import { handleRequest } from "./middlewareHandler";

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.supabase = supabaseClient;
  return handleRequest(context, next);
};
