import { j as jsonResponse } from "./response_BJucfPdF.mjs";
import { l as loginSchema } from "./auth.validator_ZWOtGhyR.mjs";
import { ZodError } from "zod";

const prerender = false;
const POST = async ({ request, locals }) => {
  try {
    let data;
    try {
      data = loginSchema.parse(await request.json());
    } catch (error2) {
      if (error2 instanceof ZodError) {
        return jsonResponse({ error: error2.errors.map((e) => e.message).join(", ") }, 400);
      }
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }
    const { email, password } = data;
    const { data: authData, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return jsonResponse({ error: "Invalid login credentials", debug: error.message }, 401);
    }
    return jsonResponse({ user: authData.user, session: authData.session }, 200);
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred";
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
