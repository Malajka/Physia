/* empty css                                      */
import {
  c as createComponent,
  a as createAstro,
  b as renderComponent,
  r as renderTemplate,
  m as maybeRenderHead,
} from "../chunks/astro/server_B181Abhk.mjs";
import "kleur/colors";
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { r as register, A as AuthForm, P as PasswordField } from "../chunks/PasswordField_BsHKvm5H.mjs";
import { L as LinkButton, I as InputField, $ as $$Layout } from "../chunks/Layout_DXvctC9J.mjs";
import { useState, useCallback } from "react";
import "clsx";
import { a as registerWithConfirmSchema } from "../chunks/auth.validator_ZWOtGhyR.mjs";
export { renderers } from "../renderers.mjs";

const handleRegisterSubmit = async (formData) => {
  const formValues = {
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    passwordConfirm: formData.get("passwordConfirm")?.toString() ?? "",
  };
  const parseResult = registerWithConfirmSchema.safeParse(formValues);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors.map((e) => e.message).join(", "),
    };
  }
  try {
    const result = await register({
      email: parseResult.data.email,
      password: parseResult.data.password,
    });
    if (!result.success) {
      if (typeof result.error === "string" && result.error.includes("|EMAIL_ALREADY_EXISTS")) {
        return {
          success: false,
          error: `This email is already registered. Would you like to <a href="/login" class="text-blue-600 hover:underline">log in</a> instead?`,
        };
      }
      return {
        success: false,
        error: typeof result.error === "string" ? result.error.split("|")[0] : "Registration failed",
      };
    }
    return {
      success: true,
      registrationSuccess: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      error: message,
    };
  }
};

const useRegister = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const submitRegistration = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await handleRegisterSubmit(formData);
      if (result.success && result.registrationSuccess) {
        setRegistrationSuccess(true);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error during registration";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  const resetForm = useCallback(() => {
    setRegistrationSuccess(false);
    setError(null);
    setIsLoading(false);
  }, []);
  return {
    registrationSuccess,
    error,
    isLoading,
    submitRegistration,
    resetForm,
  };
};

const RegisterForm = function RegisterForm2({ initialError = null }) {
  const { registrationSuccess, error, submitRegistration } = useRegister();
  if (registrationSuccess) {
    return /* @__PURE__ */ jsxs("div", {
      className: "text-center py-8",
      children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Registration Successful!" }),
        /* @__PURE__ */ jsxs("div", {
          className: "bg-green-50 border border-green-200 rounded-lg p-6 mb-6",
          children: [
            /* @__PURE__ */ jsx("p", {
              className: "text-green-800 mb-4 text-xl",
              children: /* @__PURE__ */ jsx("strong", { children: "Thank you for registering!" }),
            }),
            /* @__PURE__ */ jsx("p", {
              className: "text-green-700 mb-4 text-lg",
              children: "Now you can start creating your own sessions and muscle tests!",
            }),
            /* @__PURE__ */ jsx(LinkButton, {
              href: "/body-parts",
              variant: "nav-primary",
              className: "text-lg block w-full",
              "data-testid": "create-new-session-link",
              children: "Create First Session",
            }),
          ],
        }),
      ],
    });
  }
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsxs(AuthForm, {
        title: "Create Account",
        onSubmit: submitRegistration,
        submitText: "Register",
        errors: error || initialError,
        submitTestId: "register-submit",
        children: [
          /* @__PURE__ */ jsx(InputField, {
            id: "email",
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "your@email.com",
            required: true,
            "data-testid": "register-email",
          }),
          /* @__PURE__ */ jsx(PasswordField, {
            id: "password",
            name: "password",
            label: "Password",
            placeholder: "Min. 8 characters",
            required: true,
            "data-testid": "register-password",
          }),
          /* @__PURE__ */ jsx(PasswordField, {
            id: "passwordConfirm",
            name: "passwordConfirm",
            label: "Confirm Password",
            placeholder: "Confirm your password",
            required: true,
            "data-testid": "register-passwordConfirm",
          }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-2", children: "Password must be at least 8 characters long." }),
        ],
      }),
      /* @__PURE__ */ jsx("div", {
        className: "text-center mt-4",
        children: /* @__PURE__ */ jsxs("p", {
          className: "text-sm text-gray-600",
          children: [
            "Already have an account?",
            " ",
            /* @__PURE__ */ jsx(LinkButton, { href: "/login", variant: "text", className: "text-gray-600 underline", children: "Log in here" }),
          ],
        }),
      }),
    ],
  });
};

const $$Astro = createAstro();
const prerender = false;
const $$Register = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
    Astro2.self = $$Register;
    const error = Astro2.url.searchParams.get("error");
    const errorMessage = error === "email_in_use" ? "This email is already registered" : error ? "An error occurred during registration" : null;
    return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { title: "Register - Physia" }, { default: ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto max-w-md p-4"> <header class="mb-8 text-center"> <a href="/" class="inline-block"> <h1 class="text-2xl font-bold text-slate-700">Register to Physia</h1> </a> </header> <main class="bg-white rounded-lg shadow-md p-6 md:p-8"> ${renderComponent($$result2, "RegisterForm", RegisterForm, { initialError: errorMessage, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/RegisterForm", "client:component-export": "RegisterForm" })} </main> </div> ` })}`;
  },
  "/Users/monikabieniecka/Downloads/Physia/src/pages/register.astro",
  void 0
);

const $$file = "/Users/monikabieniecka/Downloads/Physia/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: $$Register,
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
