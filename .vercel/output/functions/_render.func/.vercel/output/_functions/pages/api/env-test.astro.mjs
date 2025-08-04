export { renderers } from '../../renderers.mjs';

const prerender = false;
async function GET() {
  return new Response(
    JSON.stringify({
      "import.meta.env.OPENROUTER_USE_MOCK": "true",
      "process.env.OPENROUTER_USE_MOCK": process.env.OPENROUTER_USE_MOCK,
      "import.meta.env.OPENROUTER_API_KEY": "your_openrouter_api_key",
      "process.env.OPENROUTER_API_KEY": process.env.OPENROUTER_API_KEY,
      "import.meta.env.SUPABASE_URL": "https://juecydaoemmuzshzkjki.supabase.co",
      "process.env.SUPABASE_URL": process.env.SUPABASE_URL
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
