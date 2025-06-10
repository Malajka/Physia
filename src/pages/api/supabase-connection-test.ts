import type { APIContext } from "astro";
import { getSupabaseClient } from "../../db/supabase.client";

export async function GET(context: APIContext) {
  try {
    // Test Supabase connection with context
    const supabase = getSupabaseClient(context);

    // Try to make a simple query to test connection
    const { data, error } = await supabase.from("body_parts").select("id").limit(1);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Supabase connection successful",
        hasError: !!error,
        error: error?.message || null,
        dataLength: data?.length || 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
