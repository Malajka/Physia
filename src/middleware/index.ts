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
  
  // Page-level guard: protect session generation and session detail routes
  const pathname = new URL(context.request.url).pathname;
  if (
    pathname.startsWith('/session/generate') ||
    pathname.startsWith('/sessions') ||
    pathname.startsWith('/muscle-tests')
  ) {
    // Ensure user is authenticated
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (!session) {
      return new Response(null, { status: 302, headers: { Location: '/login' } });
    }
    // Ensure disclaimer was accepted
    const acceptedAt = session.user.user_metadata?.disclaimer_accepted_at;
    if (!acceptedAt) {
      return new Response(null, { status: 302, headers: { Location: '/body-parts' } });
    }
    // Ownership check: only allow access to own sessions
    if (pathname.startsWith('/sessions/')) {
      const parts = pathname.split('/').filter(Boolean);
      const sessionId = parseInt(parts[1], 10);
      if (!isNaN(sessionId)) {
        // Query the session row to verify ownership
        const { data: sessionRow, error: fetchError } = await context.locals.supabase
          .from('sessions')
          .select('user_id')
          .eq('id', sessionId)
          .single();
        if (fetchError || !sessionRow || sessionRow.user_id !== session.user.id) {
          return new Response(null, { status: 302, headers: { Location: '/sessions' } });
        }
      }
    }
  }
  
  // Process the request
  const response = await next();
  
  // Return response
  return response;
});
