export async function GET() {
  try {
    // Test Supabase environment variables specifically
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_PUBLIC_KEY;

    return new Response(
      JSON.stringify({
        success: true,
        SUPABASE_URL: supabaseUrl ? "present" : "missing",
        SUPABASE_PUBLIC_KEY: supabaseKey ? "present" : "missing",
        url_length: supabaseUrl ? supabaseUrl.length : 0,
        key_length: supabaseKey ? supabaseKey.length : 0,
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
