export async function GET() {
  try {
    const env = {
      SUPABASE_URL: import.meta.env.SUPABASE_URL ? "present" : "missing",
      SUPABASE_PUBLIC_KEY: import.meta.env.SUPABASE_PUBLIC_KEY ? "present" : "missing",
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      NODE_ENV: import.meta.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(env, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
