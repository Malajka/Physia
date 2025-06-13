import { J as JSON_HEADERS } from './api_CZk8L_u-.mjs';
import './auth.validator_ZWOtGhyR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { E as ErrorAlert, S as SubmitButton, I as InputField } from './Layout_DXvctC9J.mjs';
import { useState, useCallback } from 'react';
import 'clsx';

async function authRequest(endpoint, data, defaultErrorMessage) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: JSON_HEADERS,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const json = await response.json();
      let errorMessage = json.error || json.message || defaultErrorMessage;
      if (json.code) {
        errorMessage = `${errorMessage}|${json.code}`;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
    return { success: true, error: "" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: msg };
  }
}
async function login(data) {
  return authRequest("/api/auth/login", data, "Login failed");
}
async function register(data) {
  return authRequest("/api/auth/register", data, "Registration failed");
}

function useAuthForm(onSubmit, initialErrors = null) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(initialErrors);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrors(null);
      try {
        const formData = new FormData(e.currentTarget);
        const result = await onSubmit(formData);
        if (!result.success) {
          setErrors(result.error ?? null);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrors(error.message);
        } else {
          setErrors("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    },
    [onSubmit]
  );
  return { loading, errors, handleSubmit };
}

const AuthForm = function AuthForm2({ title, onSubmit, children, submitText, errors: initialErrors = null, submitTestId }) {
  const { loading, errors, handleSubmit } = useAuthForm(onSubmit, initialErrors);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: title }),
    /* @__PURE__ */ jsx(ErrorAlert, { errors }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, "data-testid": "auth-form", noValidate: true, children: [
      children,
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-center", children: /* @__PURE__ */ jsx(SubmitButton, { loading, "data-testid": submitTestId, children: submitText }) })
    ] })
  ] });
};

function PasswordField(props) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(InputField, { ...props, type: showPassword ? "text" : "password", forceShowError: props.forceShowError, "data-testid": props["data-testid"] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        tabIndex: -1,
        onClick: togglePasswordVisibility,
        className: "absolute right-2 top-3/4 transform -translate-y-3/4 text-gray-500 hover:text-gray-700 text-xs",
        "aria-label": showPassword ? "Hide password" : "Show password",
        children: showPassword ? "Hide" : "Show"
      }
    )
  ] });
}

export { AuthForm as A, PasswordField as P, login as l, register as r };
