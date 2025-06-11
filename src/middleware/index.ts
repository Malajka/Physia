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

// Temporarily disabled middleware to fix loading issues
const validateRequest = defineMiddleware(async (context, next) => {
  console.log(`[MW] Bypassing middleware for: ${context.url.pathname}`);
  return next();
});

export const onRequest = sequence(validateRequest);
