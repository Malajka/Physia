import { createSupabaseServerInstance, supabaseClient, type SupabaseClient } from "@/db/supabase.client";
import type { User } from "@supabase/supabase-js";
import { defineMiddleware, sequence } from "astro:middleware";

const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const DEFAULT_AUTHENTICATED_PATH = "/sessions";
const DISCLAIMER_ACCEPTANCE_PATH = "/body-parts";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/verify-reset-token",
];

const PROTECTED_PATHS = ["/muscle-tests", "/body-parts", "/sessions", "/session/generate", "/api/disclaimers", "/api/body_parts", "/api/sessions"];

const PATHS_REQUIRING_DISCLAIMER = ["/muscle-tests", "/session/generate", "/api/session/generate"];

function isPathProtected(path: string): boolean {
  return PROTECTED_PATHS.some((protectedRoute) => path.startsWith(protectedRoute));
}

function doesPathRequireDisclaimerAcceptance(path: string): boolean {
  return PATHS_REQUIRING_DISCLAIMER.some((disclaimerRoute) => path.startsWith(disclaimerRoute));
}

function shouldRedirectToDefault(user: User | null, pathname: string): boolean {
  return Boolean(user) && (pathname === LOGIN_PATH || pathname === REGISTER_PATH);
}

function shouldRedirectToDisclaimer(user: User | null, pathname: string): boolean {
  const isDisclaimerAccepted = Boolean(user?.user_metadata?.disclaimer_accepted_at);
  return Boolean(user) && doesPathRequireDisclaimerAcceptance(pathname) && !isDisclaimerAccepted && pathname !== DISCLAIMER_ACCEPTANCE_PATH;
}

// Session ownership check removed for simplicity

const validateRequest = defineMiddleware(async ({ locals, cookies, url, redirect, request }, next) => {
  try {
    console.log(`[MW] Processing: ${url.pathname}`);

    let supabase: SupabaseClient;

    // Use different client approach for dev vs prod
    if (process.env.NODE_ENV === "development") {
      console.log(`[MW] Using development client for: ${url.pathname}`);
      // In development, use regular client with session management
      supabase = supabaseClient;

      // Set session from cookies if available
      const accessToken = cookies.get("sb-access-token")?.value;
      const refreshToken = cookies.get("sb-refresh-token")?.value;
      console.log(`[MW] Cookies found - access: ${!!accessToken}, refresh: ${!!refreshToken}`);

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (setSessionError) {
          console.error("[MW_SESSION_SET_ERROR]", setSessionError.message);
        } else {
          console.log("[MW] Session set successfully");
        }
      }
    } else {
      console.log(`[MW] Using SSR client for: ${url.pathname}`);
      // In production, use SSR client
      supabase = createSupabaseServerInstance({
        cookies,
        headers: request.headers,
      });
    }

    // Attach supabase client to locals (cast to unified type)
    locals.supabase = supabase as SupabaseClient;

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log(`[MW] User found: ${user ? user.email : "NONE"} for path: ${url.pathname}`);

    // Always set user in locals if available, regardless of path
    if (user) {
      locals.user = {
        email: user.email ?? null,
        id: user.id,
      };
    }

    // Skip auth check for public paths - EARLY RETURN
    if (PUBLIC_PATHS.includes(url.pathname)) {
      console.log(`[MW] Public path, skipping auth: ${url.pathname}`);
      return next();
    }

    // Check if should redirect to default authenticated path
    if (shouldRedirectToDefault(user, url.pathname)) {
      return redirect(DEFAULT_AUTHENTICATED_PATH);
    }

    // Check if should redirect to disclaimer
    if (shouldRedirectToDisclaimer(user, url.pathname)) {
      return redirect(DISCLAIMER_ACCEPTANCE_PATH);
    }

    // Handle disclaimer acceptance path
    if (
      user &&
      doesPathRequireDisclaimerAcceptance(url.pathname) &&
      !user?.user_metadata?.disclaimer_accepted_at &&
      url.pathname === DISCLAIMER_ACCEPTANCE_PATH
    ) {
      return next();
    }

    // For protected routes with authenticated user
    if (user && isPathProtected(url.pathname)) {
      console.log(`[MW] ✅ AUTHENTICATED - allowing access to: ${url.pathname}`);
      return next();
    }

    // For protected routes without user
    if (!user && isPathProtected(url.pathname)) {
      console.log(`[MW] ❌ UNAUTHORIZED - blocking access to: ${url.pathname}`);
      // For API routes, return 401 instead of redirecting
      if (url.pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      // Redirect to login for protected routes
      return redirect(LOGIN_PATH);
    }

    // For any other routes not covered above, allow access
    console.log(`[MW] Allowing access to unprotected path: ${url.pathname}`);
    return next();
  } catch (error) {
    console.error("Error in middleware:", error instanceof Error ? error.message : error);
    return next();
  }
});

export const onRequest = sequence(validateRequest);
