import {
  c as createComponent,
  a as createAstro,
  r as renderComponent,
  b as renderTemplate,
  m as maybeRenderHead,
} from "../chunks/astro/server_CfAXeihZ.mjs";
import "kleur/colors";
import { jsxs, jsx } from "react/jsx-runtime";
import { I as InputField, $ as $$Layout, L as LinkButton } from "../chunks/Layout_BWdJMhQf.mjs";
import "react";
import "clsx";
import { l as loginSchema } from "../chunks/auth.validator_ZWOtGhyR.mjs";
import { l as login, A as AuthForm, P as PasswordField } from "../chunks/PasswordField_BGGpjaBD.mjs";
export { renderers } from "../renderers.mjs";

const handleLoginSubmit = async (formData) => {
  const credentials = {
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  };
  const parseResult = loginSchema.safeParse(credentials);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors.map((e) => e.message).join(", "),
    };
  }
  const result = await login(parseResult.data);
  if (result.success) {
    window.location.href = "/sessions";
  }
  return result;
};

const LoginForm = function LoginForm2({ initialError = null }) {
  return /* @__PURE__ */ jsxs(AuthForm, {
    title: "Log In",
    onSubmit: handleLoginSubmit,
    submitText: "Log In",
    submitTestId: "login-submit",
    errors: initialError,
    children: [
      /* @__PURE__ */ jsx(InputField, {
        id: "email",
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "your@email.com",
        required: true,
        "data-testid": "email",
      }),
      /* @__PURE__ */ jsx(PasswordField, {
        id: "password",
        name: "password",
        label: "Password",
        placeholder: "Your password",
        required: true,
        "data-testid": "password",
      }),
    ],
  });
};

const $$Astro = createAstro();
const prerender = false;
const $$Login = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
    Astro2.self = $$Login;
    const error = Astro2.url.searchParams.get("error");
    const errorMessage = error === "invalid_credentials" ? "Invalid email or password" : error ? "An error occurred during login" : null;
    return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { title: "Login - Physia" }, { default: ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto max-w-md p-4"> <header class="mb-8 text-center"> <a href="/" class="inline-block"> <h1 class="text-3xl font-bold text-slate-700">Login to Physia</h1> </a> </header> <main class="bg-white rounded-lg shadow-md p-6 md:p-8"> ${renderComponent($$result2, "LoginForm", LoginForm, { initialError: errorMessage, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/LoginForm", "client:component-export": "LoginForm" })} <div class="mt-6 text-center"> <p class="text-gray-600 mb-2">Don't have an account?</p> ${renderComponent($$result2, "LinkButton", LinkButton, { href: "/register", variant: "secondary", "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/LinkButton", "client:component-export": "LinkButton" }, { default: ($$result3) => renderTemplate` Create Account ` })} </div> </main> </div> ` })}`;
  },
  "/Users/monikabieniecka/Downloads/Physia/src/pages/login.astro",
  void 0
);

const $$file = "/Users/monikabieniecka/Downloads/Physia/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: $$Login,
      file: $$file,
      prerender,
      url: $$url,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

const page = () => _page;

export { page };
