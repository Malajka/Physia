// src/pages/api/logout.ts

import { jsonResponse } from "@/lib/utils/response";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    // --- THE FIX ---
    // We call signOut() on the server-side client from `locals`.
    // The @supabase/ssr library handles everything:
    // 1. It invalidates the user's session on the Supabase server.
    // 2. It automatically calls the `remove` function you defined
    //    in your middleware's cookie adapter, correctly clearing all
    //    necessary cookies from the user's browser.
    const { error: signOutError } = await locals.supabase.auth.signOut();

    if (signOutError) {
      // This might happen if there's a network issue with the Supabase server.
      return jsonResponse({ error: signOutError.message }, 500);
    }

    // --- DELETED ---
    // The block for manually deleting cookies is gone. It's no longer needed.

    // Success - the user is logged out.
    return jsonResponse({ success: true }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "Failed to log out";
    return jsonResponse({ error: message }, 500);
  }
};
