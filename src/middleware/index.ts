import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  // Add supabase client to locals
  context.locals.supabase = supabaseClient;
  
  // Get Supabase auth cookies from the request
  const accessToken = context.cookies.get("sb-access-token");
  const refreshToken = context.cookies.get("sb-refresh-token");
  
  // If we have auth cookies, set them for the current request
  if (accessToken && refreshToken) {
    // Set the session for the supabase client
    await supabaseClient.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value
    });
  }
  
  // Process the request
  const response = await next();
  
  // Return response
  return response;
});
