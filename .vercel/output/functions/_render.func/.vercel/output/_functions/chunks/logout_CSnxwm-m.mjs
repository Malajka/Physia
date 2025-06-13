import { j as jsonResponse } from './response_BJucfPdF.mjs';

const prerender = false;
const POST = async ({ locals }) => {
  try {
    const { error: signOutError } = await locals.supabase.auth.signOut();
    if (signOutError) {
      return jsonResponse({ error: signOutError.message }, 500);
    }
    return jsonResponse({ success: true }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "Failed to log out";
    return jsonResponse({ error: message }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

export { POST as P, _page as _ };
