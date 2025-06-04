// src/pages/api/body_parts/[body_part_id]/muscle_tests.test.ts
import type { MuscleTestDto } from "@/types";
import type { APIContext } from "astro"; // Importuj APIContext dla typowania
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./muscle_tests"; // Zakładam, że plik to muscle_tests.ts lub muscle_tests/index.ts

// Definicje typów dla mocka Supabase (mogą być bardziej generyczne lub uproszczone)
interface SupabaseFrom {
  select: (columns: string) => SupabaseEq;
}
interface SupabaseEq {
  eq: (column: string, value: number) => Promise<{ data: MuscleTestDto[] | null; error: { message: string } | null }>;
}
interface SupabaseAuth {
  getSession: () => Promise<{ data: { session: { user: { id: string } } | null }; error: { message: string } | null }>;
}
interface Supabase {
  from: (table: string) => SupabaseFrom;
  auth: SupabaseAuth;
}
interface Locals {
  supabase: Supabase;
}

// Typy dla odpowiedzi API na podstawie jsonResponse z muscle_tests.ts
interface ApiSuccessResponse {
  data: MuscleTestDto[];
}

interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

interface ApiAuthErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse | ApiAuthErrorResponse;

// Funkcja do tworzenia mocka Supabase
function createMockSupabase({ data, error }: { data?: MuscleTestDto[] | null; error?: { message: string } | null }) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
    auth: {
      // Domyślnie symulujemy zalogowanego użytkownika, aby testy mogły skupić się na logice endpointu.
      // Poszczególne testy mogą nadpisać ten mock, jeśli testują scenariusze autentykacji.
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "test-user-id" } } }, error: null }),
    },
  } as unknown as Supabase;
}

// Funkcja do tworzenia pełniejszego mocka APIContext
function createMockApiContext(
  params: Record<string, string | undefined>, // Oczekujemy params jako obiektu
  locals: Locals,
  method = "GET",
  pathnameSuffix = "" // Dla dynamicznych ścieżek
): APIContext {
  const requestUrl = `http://localhost/api/body_parts/${params.body_part_id || "test"}${pathnameSuffix}`;
  const request = new Request(requestUrl, { method, headers: new Headers() }) as Request & {
    json: () => Promise<ApiResponse>;
    text: () => Promise<string>;
    arrayBuffer: () => Promise<ArrayBuffer>;
    formData: () => Promise<FormData>;
  };
  request.json = vi.fn();
  request.text = vi.fn();
  request.arrayBuffer = vi.fn();
  request.formData = vi.fn();

  return {
    locals: locals,
    params: params,
    request,
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
    } as Partial<APIContext["cookies"]>, // Bardziej precyzyjny typ dla mocka
    redirect: vi.fn((path: string, status?: number) => new Response(null, { status: status || 302, headers: { Location: path } })),
    clientAddress: "127.0.0.1",
    // site: new URL("http://localhost"),
  } as unknown as APIContext;
}

describe("GET /api/body_parts/[body_part_id]/muscle_tests", () => {
  let locals: Locals;

  beforeEach(() => {
    // Domyślna konfiguracja locals przed każdym testem
    locals = { supabase: createMockSupabase({ data: [], error: null }) };
    // Resetuj wszystkie inne mocki, jeśli to konieczne
    vi.clearAllMocks(); // Jeśli używasz vi.fn() globalnie lub w createMockSupabase
    // to może być konieczne, aby zresetować liczniki wywołań itp.
    // Jeśli createMockSupabase jest czyste, to może nie być potrzebne.
    // Ponowne skonfigurowanie mocka getSession dla locals.supabase, jeśli został zresetowany przez clearAllMocks
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: "test-user-id" } } }, error: null });
  });

  it("returns 200 and data for valid body_part_id", async () => {
    const muscleTests: MuscleTestDto[] = [{ id: 1, body_part_id: 2, name: "Test", description: "desc", created_at: "2024-01-01" }];
    // Nadpisz supabase w locals dla tego konkretnego testu
    locals.supabase = createMockSupabase({ data: muscleTests, error: null });
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");

    const response = await GET(context); // Przekaż pełny context
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(muscleTests);
  });

  it("returns 400 on invalid body_part_id", async () => {
    const params = { body_part_id: "not-a-number" };
    // locals nie musi być specjalnie konfigurowane dla tego testu, bo błąd wystąpi wcześniej
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");

    const response = await GET(context);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid body_part_id");
  });

  it("returns 502 on Supabase error", async () => {
    locals.supabase = createMockSupabase({ data: null, error: { message: "db error" } });
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");

    const response = await GET(context);
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("Failed to fetch muscle tests");
    expect(body.details).toBe("db error");
  });

  it("returns 500 on unexpected error (e.g., non-Supabase error in handler)", async () => {
    // Symulujemy błąd w logice Supabase, który powoduje rzucenie wyjątku
    locals.supabase = {
      ...locals.supabase, // Zachowaj mock auth
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error("unexpected database crash")),
        }),
      }),
      auth: locals.supabase.auth, // Upewnij się, że auth jest zachowane
    };
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");

    const response = await GET(context);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error"); // Zgodnie z blokiem catch w handlerze GET
  });

  // Testy dla logiki withAuth (scenariusze autentykacji)
  it("returns 401 if not authenticated (withAuth check)", async () => {
    // Nadpisz getSession w mocku supabase, aby symulować brak sesji
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");

    const response = await GET(context); // GET jest już opakowane przez withAuth
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("authentication_required"); // Zgodnie z tym, co zwraca withAuth
  });

  it("returns 500 if session retrieval error in withAuth", async () => {
    // Nadpisz getSession, aby symulować błąd podczas pobierania sesji
    locals.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: { message: "session retrieval failed" } });
    const params = { body_part_id: "2" };
    const context = createMockApiContext(params, locals, "GET", "/muscle_tests");

    const response = await GET(context); // GET jest już opakowane przez withAuth
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("server_error"); // Zgodnie z tym, co zwraca withAuth
  });
});
