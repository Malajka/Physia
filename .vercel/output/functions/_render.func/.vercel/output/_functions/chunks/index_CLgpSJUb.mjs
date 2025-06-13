import { w as withAuth } from './withAuth_B5AzTmJJ.mjs';
import { j as jsonResponse } from './response_BJucfPdF.mjs';

const prerender = false;
const GET = withAuth(async ({ locals }) => {
  const { supabase } = locals;
  try {
    const { data, error } = await supabase.from("body_parts").select("*").order("id");
    if (error) {
      return jsonResponse({ error: "Failed to fetch body parts", details: error.message }, 502);
    }
    return jsonResponse({ data: data ?? [] }, 200);
  } catch {
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

export { GET as G, _page as _ };
