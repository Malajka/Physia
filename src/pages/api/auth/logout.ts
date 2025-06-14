import { jsonResponse } from "@/lib/utils/response";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    const { error: signOutError } = await locals.supabase.auth.signOut();

    if (signOutError) {
      return jsonResponse({ error: signOutError.message }, 500);
    }

    return jsonResponse({ success: true }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "Failed to log out";
    return jsonResponse({ error: message }, 500);
  }
};
