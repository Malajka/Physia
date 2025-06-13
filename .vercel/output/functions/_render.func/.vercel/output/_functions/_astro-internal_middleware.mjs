import { createServerClient } from "@supabase/ssr";
import { d as defineMiddleware, s as sequence } from "./chunks/index_rBVTmNgT.mjs";
import "es-module-lexer";
import "./chunks/astro-designed-error-pages_CBXS45Lj.mjs";
import "cookie";

const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const DEFAULT_AUTHENTICATED_PATH = "/sessions";
const DISCLAIMER_ACCEPTANCE_PATH = "/body-parts";
const PROTECTED_PATHS = ["/muscle-tests", "/body-parts", "/sessions", "/session/generate", "/api/disclaimers", "/api/body_parts", "/api/sessions"];
const PATHS_REQUIRING_DISCLAIMER = ["/muscle-tests", "/sessions", "/session/generate", "/api/sessions"];
function getPathname(req) {
  return new URL(req.url).pathname;
}
function createRedirect(location) {
  return new Response(null, { status: 302, headers: { Location: location } });
}
function handleAuthRedirects(pathname, isAuthenticated) {
  if (isAuthenticated && (pathname === LOGIN_PATH || pathname === REGISTER_PATH)) {
    return createRedirect(DEFAULT_AUTHENTICATED_PATH);
  }
  return null;
}
function handleProtectedRoute(pathname, isAuthenticated) {
  const isPathProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isAuthenticated && isPathProtected) {
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
    }
    return createRedirect(LOGIN_PATH);
  }
  return null;
}
function handleDisclaimerCheck(pathname, user) {
  if (!user) return null;
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
async function handleSessionOwnership(context) {
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
const onRequest$1 = defineMiddleware(async (context, next) => {
  const supabase = createServerClient(
    "https://juecydaoemmuzshzkjki.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZWN5ZGFvZW1tdXpzaHpramtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODgyMTIsImV4cCI6MjA2MjM2NDIxMn0.ttj-Z2cxA9CEl1Mb0ZH095CaB7XFIYT06WyOlU__8Kc",
    {
      cookies: {
        get: (key) => context.cookies.get(key)?.value,
        set: (key, value, options) => {
          context.cookies.set(key, value, {
            domain: options.domain,
            expires: options.expires,
            httpOnly: options.httpOnly,
            maxAge: options.maxAge,
            path: options.path ?? "/",
            sameSite: options.sameSite,
            secure: options.secure,
            // Added to satisfy Astro's type definition.
            encode: (val) => val,
          });
        },
        remove: (key, options) => {
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
    }
  );
  context.locals.supabase = supabase;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  context.locals.user = user;
  const pathname = getPathname(context.request);
  const isAuthenticated = !!user;
  let response;
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

const onRequest = sequence(onRequest$1);

export { onRequest };
