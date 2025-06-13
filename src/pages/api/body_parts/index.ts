// src/pages/api/body_parts/index.ts (OSTATECZNA, DZIAŁAJĄCA WERSJA)

import { createClient } from "@supabase/supabase-js";
import { withAuth } from "@/lib/middleware/withAuth";
import { jsonResponse } from "@/lib/utils/response";

export const prerender = false;

// Używamy `withAuth`, aby upewnić się, że tylko zalogowany użytkownik może tu dotrzeć.
export const GET = withAuth(async ({ locals }) => {
  // `withAuth` gwarantuje, że `locals.user` istnieje.
  const { supabase } = locals;
  try {
    // KROK 1: Pobierz token dostępowy z aktywnej sesji.
    // Używamy tutaj getSession, ponieważ `getUser` już zweryfikowało sesję.
    // Potrzebujemy tylko samego tokena.
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("[API /body_parts] Could not retrieve session token.");
      return jsonResponse({ error: "Session token unavailable." }, 401);
    }
    const accessToken = sessionData.session.access_token;

    // KROK 2: Stwórz nowego, tymczasowego klienta z tokenem użytkownika.
    // To jest klucz do rozwiązania problemu.
    const authedSupabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_PUBLIC_KEY, {
      global: {
        headers: {
          // Wstrzykujemy token użytkownika, aby każde zapytanie było w jego imieniu.
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // KROK 3: Wykonaj zapytanie używając NOWEGO, uwierzytelnionego klienta.
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
