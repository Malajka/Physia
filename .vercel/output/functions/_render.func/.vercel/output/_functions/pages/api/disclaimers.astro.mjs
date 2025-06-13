import { w as withAuth } from '../../chunks/withAuth_B5AzTmJJ.mjs';
import { j as jsonResponse } from '../../chunks/response_BJucfPdF.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = withAuth(async ({ locals }) => {
  const { supabase, user } = locals;
  const { data: disclaimerData, error: disclaimerError } = await supabase.from("disclaimers").select("content").order("updated_at", { ascending: false }).limit(1).single();
  if (disclaimerError || !disclaimerData) {
    return jsonResponse({ error: disclaimerError?.message ?? "Failed to load disclaimer" }, 500);
  }
  const accepted_at = user.user_metadata?.disclaimer_accepted_at ?? null;
  const payload = {
    text: disclaimerData.content,
    accepted_at
  };
  return jsonResponse(payload, 200);
});
const POST = withAuth(async ({ locals }) => {
  const { supabase } = locals;
  const accepted_at = (/* @__PURE__ */ new Date()).toISOString();
  const { error } = await supabase.auth.updateUser({
    data: { disclaimer_accepted_at: accepted_at }
  });
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }
  await supabase.auth.refreshSession();
  const payload = { accepted_at };
  return jsonResponse(payload, 201);
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
