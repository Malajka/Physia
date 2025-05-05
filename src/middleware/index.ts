import { defineMiddleware } from "astro:middleware";
import type { SupabaseClient } from "@/db/supabase.client";
import { supabaseClient } from "@/db/supabase.client";

/**
 * Extracts the pathname from a Request.
 */
function getPathname(request: Request): string {
  return new URL(request.url).pathname;
}

/**
 * Determines whether a pathname requires authentication.
 */
function isProtectedRoute(path: string): boolean {
  return ["/session/generate", "/sessions", "/muscle-tests"].some((route) => path.startsWith(route));
}

/**
 * Validates session ownership or returns a redirect.
 */
async function checkOwnership(supabase: SupabaseClient, userId: string, path: string): Promise<Response | undefined> {
  if (!path.startsWith("/sessions/")) return;

  const [, id] = path.split("/").filter(Boolean);
  const sessionId = Number(id);
  if (Number.isNaN(sessionId)) return;

  const { data: row, error } = await supabase.from("sessions").select("user_id").eq("id", sessionId).single();

  if (error || row?.user_id !== userId) {
    return new Response(null, { status: 302, headers: { Location: "/sessions" } });
  }
}

/**
 * Issues a redirect response to the specified location.
 */
function redirectTo(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location } });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = (context.locals.supabase = supabaseClient);

  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  }

  const pathname = getPathname(context.request);
  if (!isProtectedRoute(pathname)) {
    return next();
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return redirectTo("/login");
  }
  if (!session.user.user_metadata?.disclaimer_accepted_at) {
    return redirectTo("/body-parts");
  }

  const ownershipRedirect = await checkOwnership(supabase, session.user.id, pathname);
  if (ownershipRedirect) {
    return ownershipRedirect;
  }

  return next();
});
