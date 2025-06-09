import { jsonResponse } from "@/lib/utils/response";
import type { APIRoute } from "astro";



const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

export const POST: APIRoute = async ({ locals, cookies }) => {
  try {
    const { error: signOutError } = await locals.supabase.auth.signOut();

    if (signOutError) {
      return jsonResponse({ error: signOutError.message }, 500);
    }

    // Clear authentication cookies
    [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE].forEach((name) => cookies.delete(name, { path: "/" }));

    return jsonResponse({ success: true }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "Failed to log out";
    return jsonResponse({ error: message }, 500);
  }
};
