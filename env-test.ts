export async function GET() {
  try {
    // Test if import.meta.env access works
    const nodeEnv = import.meta.env.NODE_ENV;
    const isDev = import.meta.env.DEV;

    return new Response(
      JSON.stringify({
        success: true,
        NODE_ENV: nodeEnv,
        DEV: isDev,
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
