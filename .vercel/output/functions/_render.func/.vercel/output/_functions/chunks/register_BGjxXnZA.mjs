import { j as jsonResponse } from './response_BJucfPdF.mjs';
import { r as registerSchema } from './auth.validator_ZWOtGhyR.mjs';
import { ZodError } from 'zod';

const prerender = false;
const POST = async ({ request, locals }) => {
  try {
    let data;
    try {
      data = registerSchema.parse(await request.json());
    } catch (error) {
      if (error instanceof ZodError) {
        return jsonResponse({ error: error.errors.map((e) => e.message).join(", ") }, 400);
      }
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }
    const { email, password } = data;
    const { data: registrationResult, error: signUpError } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login`
      }
    });
    if (signUpError) {
      const errorMessageLower = signUpError.message.toLowerCase();
      const duplicateEmailPatterns = ["already registered", "duplicate", "unique constraint", "taken"];
      if (duplicateEmailPatterns.some((pattern) => errorMessageLower.includes(pattern))) {
        return jsonResponse(
          {
            error: "This email is already registered. Please log in instead.",
            code: "EMAIL_ALREADY_EXISTS"
          },
          409
        );
      }
      return jsonResponse({ error: signUpError.message }, 400);
    }
    return jsonResponse(
      {
        user: registrationResult.user,
        message: "Registration successful! Please check your email for confirmation."
      },
      200
    );
  } catch (unexpectedError) {
    const message = unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred";
    return jsonResponse({ error: message }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

export { POST as P, _page as _ };
