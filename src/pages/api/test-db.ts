// src/pages/api/test-db.ts  (NOWY PLIK TESTOWY)

import { createClient } from "@supabase/supabase-js";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  console.log("\n--- DB CONNECTION TEST ---");

  // Sprawdzamy, czy zmienne środowiskowe są w ogóle wczytywane przez serwer
  const url = import.meta.env.SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("[TEST FAILED] Supabase URL or Service Role Key is MISSING in .env on the server!");
    return new Response(JSON.stringify({ error: "Server environment variables are not configured." }), { status: 500 });
  }

  console.log("[TEST INFO] Server has loaded environment variables.");

  // Tworzymy nowego, "czystego" klienta z kluczem administratora
  const adminSupabase = createClient(url, serviceKey);

  try {
    // Wykonujemy najprostsze możliwe zapytanie
    const { data, error } = await adminSupabase.from("body_parts").select("*");

    if (error) {
      console.error("[TEST FAILED] Supabase returned an error:", error);
      return new Response(JSON.stringify({ error: "Supabase query failed.", details: error.message }), { status: 500 });
    }

    console.log(`[TEST SUCCESS] Supabase returned ${data.length} rows.`);
    console.log("------------------------\n");

    // Zwracamy dane jako JSON
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[TEST FAILED] An unexpected error occurred:", e);
    return new Response(JSON.stringify({ error: "An unexpected server error occurred." }), { status: 500 });
  }
};
