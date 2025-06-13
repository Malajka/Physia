// src/pages/api/login.ts (POPRAWIONY)

import { jsonResponse } from "@/lib/utils/response";
import { loginSchema } from "@/lib/validators/auth.validator";
import type { AuthCredentialsDto } from "@/types";
import type { APIRoute } from "astro";
import { ZodError } from "zod";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let data: AuthCredentialsDto;
    try {
      data = loginSchema.parse(await request.json());
    } catch (error) {
      if (error instanceof ZodError) {
        return jsonResponse({ error: error.errors.map((e) => e.message).join(", ") }, 400);
      }
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }
    const { email, password } = data;

    // Wywołaj logowanie. Biblioteka @supabase/ssr sama zajmie się ustawieniem ciasteczek,
    // używając handlerów 'set' zdefiniowanych w Twoim middleware.
    const { data: authData, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return jsonResponse({ error: "Invalid login credentials", debug: error.message }, 401);
    }

    // --- USUNIĘTO BLOK RĘCZNEGO USTAWIANIA CIASTECZEK ---
    // Nie musimy już nic robić. Ciasteczka zostały ustawione automatycznie.

    // Sukces - zwróć dane użytkownika i sesji.
    return jsonResponse({ user: authData.user, session: authData.session }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred";
    return jsonResponse({ error: message }, 500);
  }
};
