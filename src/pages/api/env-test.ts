export const prerender = false;

export async function GET() {
  return new Response(
    JSON.stringify({
      "import.meta.env.OPENROUTER_USE_MOCK": import.meta.env.OPENROUTER_USE_MOCK,
      "process.env.OPENROUTER_USE_MOCK": process.env.OPENROUTER_USE_MOCK,
      "import.meta.env.OPENROUTER_API_KEY": import.meta.env.OPENROUTER_API_KEY,
      "process.env.OPENROUTER_API_KEY": process.env.OPENROUTER_API_KEY,
      "import.meta.env.SUPABASE_URL": import.meta.env.SUPABASE_URL,
      "process.env.SUPABASE_URL": process.env.SUPABASE_URL,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
