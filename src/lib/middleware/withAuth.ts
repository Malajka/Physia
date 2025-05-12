import { errorResponse } from "@/lib/utils/api";
import { ErrorCode } from "@/types";
import type { APIRoute } from "astro";

type APIRouteContext = Parameters<APIRoute>[0];
type AuthHandler = (context: APIRouteContext, userId: string) => ReturnType<APIRoute>;

export function withAuth(handler: AuthHandler): APIRoute {
  return async function (context) {
    const requestTimestamp = Date.now(); // Dla korelacji z logami z onRequest
    const pathname = new URL(context.request.url).pathname; // Pobierz pathname dla logowania
    console.log(`[withAuth] ENTER for path: ${pathname}, Timestamp: ${requestTimestamp}`); // LOG_WA_1

    const { locals } = context;
    const supabase = locals.supabase;

    if (!supabase) {
      console.error(`[withAuth] CRITICAL: Supabase client not found on context.locals for path: ${pathname}`); // LOG_WA_2
      // To jest poważny błąd konfiguracyjny. Główne middleware `onRequest` powinno zawsze ustawiać `locals.supabase`.
      return errorResponse(ErrorCode.SERVER_ERROR, "Server configuration error: Supabase client unavailable", 500);
    }

    console.log(`[withAuth] Attempting to get session for path: ${pathname}`); // LOG_WA_3
    const { data, error: sessionError } = await supabase.auth.getSession(); // Zmieniono nazwę `error` na `sessionError` dla jasności

    if (sessionError) {
      console.error(`[withAuth] Error retrieving session for path ${pathname}:`, sessionError.message); // LOG_WA_4
      return errorResponse(ErrorCode.SERVER_ERROR, "Failed to retrieve session", 500);
    }

    const { session } = data;

    if (!session) {
      console.log(`[withAuth] No session found for path ${pathname}. Authentication required.`); // LOG_WA_5
      return errorResponse(ErrorCode.AUTHENTICATION_REQUIRED, "Authentication required", 401);
    }

    // Sesja istnieje, użytkownik jest zalogowany
    console.log(`[withAuth] Session found for path ${pathname}. User ID: ${session.user.id}. Proceeding to handler.`); // LOG_WA_6
    return handler(context, session.user.id); // Wywołaj oryginalny handler z userId
  };
}
