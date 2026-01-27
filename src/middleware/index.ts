import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { APIContext } from "astro";
import { defineMiddleware } from "astro:middleware";

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

/**
 * Parse cookies from Cookie header string
 */
function parseCookieHeader(cookieHeader: string | null): { name: string; value: string }[] {
  if (!cookieHeader) return [];

  return cookieHeader
    .split(";")
    .map((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      return {
        name: name.trim(),
        value: rest.join("=").trim(),
      };
    })
    .filter(({ name }) => name.length > 0);
}

// --- Logic Handlers ---

export function handleAuthRedirects(pathname: string, isAuthenticated: boolean): Response | null {
  if (isAuthenticated && (pathname === LOGIN_PATH || pathname === REGISTER_PATH)) {
    return createRedirect(DEFAULT_AUTHENTICATED_PATH);
  }
  return null;
}

export function handleProtectedRoute(pathname: string, isAuthenticated: boolean): Response | null {
  const isPathProtected = PROTECTED_PATHS.some((protectedPath) => pathname === protectedPath || pathname.startsWith(`${protectedPath}/`));

  if (!isAuthenticated && isPathProtected) {
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return createRedirect(LOGIN_PATH);
  }
  return null;
}

export function handleDisclaimerCheck(pathname: string, user: User | null): Response | null {
  if (!user) return null;

  const needsDisclaimer = PATHS_REQUIRING_DISCLAIMER.some(
    (disclaimerPath) => pathname === disclaimerPath || pathname.startsWith(`${disclaimerPath}/`)
  );

  if (needsDisclaimer) {
    const isDisclaimerAccepted = Boolean(user.user_metadata.disclaimer_accepted_at);
    if (!isDisclaimerAccepted) {
      if (pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Disclaimer not accepted" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      return createRedirect(DISCLAIMER_ACCEPTANCE_PATH);
    }
  }
  return null;
}

export async function handleSessionOwnership(context: APIContext): Promise<Response | null> {
  const { locals, request } = context;
  const { user, supabase } = locals;
  const pathname = getPathname(request);

  if (!user || !pathname.startsWith("/sessions/")) return null;

  const segments = pathname.split("/");
  if (segments.length < 3 || Number.isNaN(Number(segments[2]))) return null;

  const sessionId = Number(segments[2]);
  const { data, error } = await supabase.from("sessions").select("user_id").eq("id", sessionId).single();

  if (error || !data || data.user_id !== user.id) {
    return createRedirect(DEFAULT_AUTHENTICATED_PATH);
  }
  return null;
}

// --- Main Middleware Entry Point ---
export const onRequest = defineMiddleware(async (context: APIContext, next: () => Promise<Response>) => {
  // ✅ Astro-Compatible Adapter
  const supabase = createServerClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll() {
        // Parse cookies from request headers
        const cookieHeader = context.request.headers.get("cookie");
        return parseCookieHeader(cookieHeader);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options);
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
