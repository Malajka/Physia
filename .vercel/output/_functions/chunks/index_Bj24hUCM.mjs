import { w as withAuth } from "./withAuth_BrNYmeHs.mjs";
import { j as jsonResponse } from "./response_BJucfPdF.mjs";

const prerender = false;
const GET = withAuth(async ({ locals }) => {
  const supabase = locals.supabase;
  const { data, error } = await supabase.from("disclaimers").select("content").order("updated_at", { ascending: false }).limit(1).single();
  if (error || !data) {
    return jsonResponse({ error: error?.message ?? "Failed to load disclaimer" }, 500);
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accepted_at = session?.user.user_metadata?.disclaimer_accepted_at ?? null;
  const payload = {
    text: data.content,
    accepted_at,
  };
  return jsonResponse(payload, 200);
});
const POST = withAuth(async ({ locals }) => {
  const supabase = locals.supabase;
  const accepted_at = /* @__PURE__ */ new Date().toISOString();
  const { error } = await supabase.auth.updateUser({
    data: { disclaimer_accepted_at: accepted_at },
  });
  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }
  const payload = { accepted_at };
  return jsonResponse(payload, 201);
});

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      GET,
      POST,
      prerender,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

export { GET as G, POST as P, _page as _ };
