const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const DEFAULT_AUTHENTICATED_PATH = "/sessions";
const DISCLAIMER_ACCEPTANCE_PATH = "/body-parts";
const PROTECTED_PATHS = [
  "/muscle-tests",
  "/body-parts",
  "/sessions",
  "/session/generate",
  "/api/disclaimers",
  "/api/body_parts",
  // "/api/session/generate",
  "/api/sessions",
];
const PATHS_REQUIRING_DISCLAIMER = [
  // "/sessions",
  "/muscle-tests",
  "/session/generate",
  // "/api/disclaimers",
  "/api/session/generate",
  // "/api/body_parts",
  // "/api/sessions",
];
function getPathname(request) {
  return new URL(request.url).pathname;
}
function isPathProtected(path) {
  return PROTECTED_PATHS.some((protectedRoute) => path.startsWith(protectedRoute));
}
function doesPathRequireDisclaimerAcceptance(path) {
  return PATHS_REQUIRING_DISCLAIMER.some((disclaimerRoute) => path.startsWith(disclaimerRoute));
}
function createRedirect(location) {
  return new Response(null, {
    status: 302,
    headers: { Location: location },
  });
}
async function setSessionFromCookies(supabase, context) {
  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;
  if (accessToken && refreshToken) {
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (setSessionError) {
      console.error("[MW_HANDLER_SESSION_SET_ERROR]", setSessionError.message);
    }
  }
}
async function fetchSession(supabase, pathname) {
  const { data: { session } = { session: null }, error: sessionFetchError } = await supabase.auth.getSession();
  if (sessionFetchError) {
    console.error(`[MW_HANDLER_SESSION_FETCH_ERROR] Error fetching session for ${pathname}: ${sessionFetchError.message}`);
  }
  return session;
}
function shouldRedirectToLogin(session, pathname) {
  return !session && isPathProtected(pathname);
}
function shouldRedirectToDefault(session, pathname) {
  return Boolean(session) && (pathname === LOGIN_PATH || pathname === REGISTER_PATH);
}
function shouldRedirectToDisclaimer(session, pathname) {
  const isDisclaimerAccepted = Boolean(session?.user?.user_metadata?.disclaimer_accepted_at);
  return Boolean(session) && doesPathRequireDisclaimerAcceptance(pathname) && !isDisclaimerAccepted && pathname !== DISCLAIMER_ACCEPTANCE_PATH;
}
async function handleSessionOwnership(supabase, userId, pathname) {
  if (!pathname.startsWith("/sessions/")) {
    return void 0;
  }
  const pathSegments = pathname.split("/");
  if (pathSegments.length < 3 || Number.isNaN(Number(pathSegments[2]))) {
    return void 0;
  }
  const sessionId = Number(pathSegments[2]);
  const { data: sessionRecord, error } = await supabase.from("sessions").select("user_id").eq("id", sessionId).single();
  if (error || !sessionRecord || sessionRecord.user_id !== userId) {
    return createRedirect(DEFAULT_AUTHENTICATED_PATH);
  }
  return void 0;
}
async function handleRequest(context, next) {
  const supabase = context.locals.supabase;
  const pathname = getPathname(context.request);
  await setSessionFromCookies(supabase, context);
  const session = await fetchSession(supabase, pathname);
  if (shouldRedirectToDefault(session, pathname)) {
    return createRedirect(DEFAULT_AUTHENTICATED_PATH);
  }
  if (shouldRedirectToDisclaimer(session, pathname)) {
    return createRedirect(DISCLAIMER_ACCEPTANCE_PATH);
  }
  if (
    session &&
    doesPathRequireDisclaimerAcceptance(pathname) &&
    !session?.user?.user_metadata?.disclaimer_accepted_at &&
    pathname === DISCLAIMER_ACCEPTANCE_PATH
  ) {
    return next();
  }
  if (session && isPathProtected(pathname)) {
    const ownershipRedirect = await handleSessionOwnership(supabase, session.user.id, pathname);
    if (ownershipRedirect) {
      return ownershipRedirect;
    }
    return next();
  }
  if (shouldRedirectToLogin(session, pathname)) {
    return createRedirect(LOGIN_PATH);
  }
  return next();
}

export { handleRequest as h };
