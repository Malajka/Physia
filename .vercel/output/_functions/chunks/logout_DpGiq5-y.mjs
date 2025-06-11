import { j as jsonResponse } from "./response_BJucfPdF.mjs";

const prerender = false;
const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";
const POST = async ({ locals, cookies }) => {
  try {
    const { error: signOutError } = await locals.supabase.auth.signOut();
    if (signOutError) {
      return jsonResponse({ error: signOutError.message }, 500);
    }
    [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE].forEach((name) => cookies.delete(name, { path: "/" }));
    return jsonResponse({ success: true }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "Failed to log out";
    return jsonResponse({ error: message }, 500);
  }
};

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      POST,
      prerender,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

export { POST as P, _page as _ };
