import { supabaseClient } from "@/db/supabase.client";
import { defineMiddleware } from "astro:middleware";
import { handleRequest } from "./middlewareHandler";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;
  return handleRequest(context, next);
});