// src/pages/api/disclaimers.ts (OSTATECZNA WERSJA)

import { withAuth } from "@/lib/middleware/withAuth";
import { jsonResponse } from "@/lib/utils/response";
import type { AcceptDisclaimerResponseDto, DisclaimersContentDto } from "@/types";

export const prerender = false;

// This GET endpoint has been fixed and is working correctly
export const GET = withAuth(async ({ locals }) => {
  const { supabase, user } = locals;
  const { data: disclaimerData, error: disclaimerError } = await supabase
    .from("disclaimers")
    .select("content")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (disclaimerError || !disclaimerData) {
    return jsonResponse({ error: disclaimerError?.message ?? "Failed to load disclaimer" }, 500);
  }
  const accepted_at = user.user_metadata?.disclaimer_accepted_at ?? null;
  const payload: DisclaimersContentDto & { accepted_at?: string | null } = {
    text: disclaimerData.content,
    accepted_at: accepted_at as string | null,
  };
  return jsonResponse(payload, 200);
});

// !!! TUTAJ JEST KLUCZOWA POPRAWKA !!!
// In this POST endpoint we add session refresh
export const POST = withAuth(async ({ locals }) => {
  const { supabase } = locals;
  const accepted_at = new Date().toISOString();

  // Krok 1: Zaktualizuj metadane w bazie danych.
  const { error } = await supabase.auth.updateUser({
    data: { disclaimer_accepted_at: accepted_at },
  });

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  // Step 2 (NEW AND CRUCIAL): Force session refresh
  // This will cause Supabase to issue a new JWT token with updated metadata
  // and save it in cookies using your middleware handlers
  await supabase.auth.refreshSession();

  const payload: AcceptDisclaimerResponseDto = { accepted_at };
  return jsonResponse(payload, 201);
});
