import { j as jsonResponse } from "./response_BJucfPdF.mjs";
import { l as loginSchema } from "./auth.validator_ZWOtGhyR.mjs";
import { ZodError } from "zod";

const prerender = false;
const POST = async ({ request, locals, cookies }) => {
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
    cookies.set("sb-access-token", authData.session.access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: authData.session.expires_in,
    });
    cookies.set("sb-refresh-token", authData.session.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      // 7 days
    });
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
