import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Skip Supabase initialization for now to test
  console.log("Middleware running for:", context.url.pathname);
  return next();
};
