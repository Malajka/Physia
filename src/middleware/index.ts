// src/middleware/index.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { defineMiddleware } from "astro:middleware";
import type { User } from "@supabase/supabase-js";
import type { APIContext } from "astro";

// --- Constants ---
const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const DEFAULT_AUTHENTICATED_PATH = "/sessions";
const DISCLAIMER_ACCEPTANCE_PATH = "/body-parts";
const PROTECTED_PATHS = ["/muscle-tests", "/body-parts", "/sessions", "/session/generate", "/api/disclaimers", "/api/body_parts", "/api/sessions"];
const PATHS_REQUIRING_DISCLAIMER = ["/muscle-tests", "/sessions", "/session/generate", "/api/sessions"];

// --- Helper Functions ---
function getPathname(req: Request): string {
  return new URL(req.url).pathname;
}

function createRedirect(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location } });
}

// --- Logic Handlers ---

/**
 * Handles redirects for already authenticated users away from login/register pages.
 * @returns A Response object for redirection, or null to continue.
 */
function handleAuthRedirects(pathname: string, isAuthenticated: boolean): Response | null {
  if (isAuthenticated && (pathname === LOGIN_PATH || pathname === REGISTER_PATH)) {
    return createRedirect(DEFAULT_AUTHENTICATED_PATH);
  }
  return null;
}

/**
 * Protects routes that require authentication.
 * @returns A Response object for redirection or error, or null to continue.
 */
function handleProtectedRoute(pathname: string, isAuthenticated: boolean): Response | null {
  const isPathProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isAuthenticated && isPathProtected) {
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
    }
    return createRedirect(LOGIN_PATH);
  }
  return null;
}

/**
 * Enforces disclaimer acceptance for relevant paths.
 * @returns A Response object for redirection or error, or null to continue.
 */
function handleDisclaimerCheck(pathname: string, user: User | null): Response | null {
  if (!user) return null; // Logic only applies to logged-in users

  const needsDisclaimer = PATHS_REQUIRING_DISCLAIMER.some((p) => pathname.startsWith(p));
  if (needsDisclaimer) {
    const isDisclaimerAccepted = Boolean(user.user_metadata.disclaimer_accepted_at);
    if (!isDisclaimerAccepted) {
      if (pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Disclaimer not accepted" }), { status: 403 });
      }
      return createRedirect(DISCLAIMER_ACCEPTANCE_PATH);
    }
  }
  return null;
}

/**
 * Verifies that the user owns the session they are trying to access.
 * @returns A Response object for redirection, or null to continue.
 */
async function handleSessionOwnership(context: APIContext): Promise<Response | null> {
  const { locals, request } = context;
  const { user, supabase } = locals;
  const pathname = getPathname(request);

  if (!user || !pathname.startsWith("/sessions/")) return null;

  const seg = pathname.split("/");
  if (seg.length < 3 || Number.isNaN(Number(seg[2]))) return null;

  const sessionId = Number(seg[2]);
  const { data, error } = await supabase.from("sessions").select("user_id").eq("id", sessionId).single();

  if (error || !data || data.user_id !== user.id) {
    return createRedirect(DEFAULT_AUTHENTICATED_PATH);
  }
  return null;
}

// --- Main Middleware Entry Point ---
export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_PUBLIC_KEY, {
    cookies: {
      get: (key) => context.cookies.get(key)?.value,
      set: (key, value, options: CookieOptions) => {
        // FIXED: The options object now includes all required properties by Astro.
        context.cookies.set(key, value, {
          domain: options.domain,
          expires: options.expires,
          httpOnly: options.httpOnly,
          maxAge: options.maxAge,
          path: options.path ?? "/",
          sameSite: options.sameSite,
          secure: options.secure,
          // Added to satisfy Astro's type definition.
          encode: (val: string) => val,
        });
      },
      remove: (key, options: CookieOptions) => {
        // FIXED: The options object for deletion now also includes security flags.
        context.cookies.delete(key, {
          domain: options.domain,
          path: options.path ?? "/",
          // Added to ensure the cookie can be properly deleted.
          httpOnly: options.httpOnly,
          secure: options.secure,
          sameSite: options.sameSite,
        });
      },
    },
  });

  context.locals.supabase = supabase;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  context.locals.user = user;

  const pathname = getPathname(context.request);
  const isAuthenticated = !!user;

  // --- Sequential Logic Execution ---
  let response: Response | null;

  response = handleAuthRedirects(pathname, isAuthenticated);
  if (response) return response;

  response = handleProtectedRoute(pathname, isAuthenticated);
  if (response) return response;

  if (isAuthenticated) {
    response = handleDisclaimerCheck(pathname, user);
    if (response) return response;

    response = await handleSessionOwnership(context);
    if (response) return response;
  }

  return next();
});
