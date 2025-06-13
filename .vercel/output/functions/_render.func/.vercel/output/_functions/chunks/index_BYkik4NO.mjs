import { createClient } from "@supabase/supabase-js";
import { w as withAuth } from "./withAuth_B5AzTmJJ.mjs";
import { j as jsonResponse } from "./response_BJucfPdF.mjs";

const prerender = false;
const GET = withAuth(async ({ locals }) => {
  const { supabase } = locals;
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("[API /body_parts] Could not retrieve session token.");
      return jsonResponse({ error: "Session token unavailable." }, 401);
    }
    const accessToken = sessionData.session.access_token;
    const authedSupabase = createClient(
      "https://juecydaoemmuzshzkjki.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZWN5ZGFvZW1tdXpzaHpramtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODgyMTIsImV4cCI6MjA2MjM2NDIxMn0.ttj-Z2cxA9CEl1Mb0ZH095CaB7XFIYT06WyOlU__8Kc",
      {
        global: {
          headers: {
            // Wstrzykujemy token użytkownika, aby każde zapytanie było w jego imieniu.
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );
    const { data, error } = await authedSupabase.from("body_parts").select("*").order("id");
    if (error) {
      console.error("[API /body_parts] Supabase query failed with authed client:", error);
      return jsonResponse({ error: "Failed to fetch body parts", details: error.message }, 502);
    }
    console.log(`[API /body_parts] Success! Found ${data.length} body parts.`);
    return jsonResponse({ data: data ?? [] }, 200);
  } catch (e) {
    console.error("[API /body_parts] Unexpected error:", e);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      GET,
      prerender,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

export { GET as G, _page as _ };
