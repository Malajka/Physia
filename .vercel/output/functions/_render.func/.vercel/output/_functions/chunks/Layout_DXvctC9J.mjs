import { c as createComponent, a as createAstro, m as maybeRenderHead, b as renderComponent, r as renderTemplate, F as Fragment, d as addAttribute, f as renderHead, g as renderSlot } from './astro/server_B181Abhk.mjs';
import 'kleur/colors';
import { jsx, jsxs } from 'react/jsx-runtime';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import React__default, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as SliderPrimitive from '@radix-ui/react-slider';
import './auth.validator_ZWOtGhyR.mjs';
import { J as JSON_HEADERS } from './api_CZk8L_u-.mjs';
/* empty css                              */

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "dark:hover:opacity-70",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }) {
  const ButtonComponent = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    ButtonComponent,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      disabled: loading || disabled,
      "aria-disabled": loading || disabled,
      ...props,
      children: loading ? "Processing..." : children
    }
  );
}

const errorAlertBase = "bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6";

function ErrorAlert({ errors, render }) {
  const hasErrors = !!errors && (!Array.isArray(errors) || errors.length > 0);
  const list = errors ? Array.isArray(errors) ? errors : [errors] : [];
  return /* @__PURE__ */ jsx("div", { role: "alert", "aria-live": "assertive", className: errorAlertBase, style: !hasErrors ? { display: "none" } : void 0, "aria-hidden": !hasErrors, children: hasErrors && /* @__PURE__ */ jsxs("div", { className: "flex", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-red-500", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
        clipRule: "evenodd"
      }
    ) }) }),
    /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-red-800", children: [
        "Error",
        list.length > 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm", children: /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5 space-y-1", children: list.map((err, i) => /* @__PURE__ */ jsx("li", { children: render ? render(err) : typeof err === "string" ? /* @__PURE__ */ jsx("span", { dangerouslySetInnerHTML: { __html: err } }) : err }, i)) }) })
    ] })
  ] }) });
}
const MemoizedErrorAlert = React__default.memo(ErrorAlert);
MemoizedErrorAlert.displayName = "ErrorAlert";

function InputFieldComponent({
  id,
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  value = "",
  onChange,
  error,
  forceShowError = false,
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const errorId = `${id}-error`;
  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      onChange?.(newValue);
    },
    [onChange]
  );
  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);
  const showError = (touched || forceShowError) && !!error;
  return /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: id, className: "block text-sm font-medium text-gray-700 mb-1", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-red-500 ml-1", "aria-hidden": "true", children: "*" })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        id,
        name: name || id,
        type,
        defaultValue: value,
        onChange: handleChange,
        onBlur: handleBlur,
        placeholder,
        required,
        "aria-required": required,
        "aria-invalid": showError,
        "aria-describedby": showError ? errorId : void 0,
        className: cn(
          "w-full p-2 border rounded focus:ring-2 focus:outline-none",
          showError ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
        ),
        ...props
      }
    ),
    showError && /* @__PURE__ */ jsx(ErrorAlert, { errors: error })
  ] });
}
const InputField = React__default.memo(InputFieldComponent);
InputField.displayName = "InputField";

const baseStyles = "inline-block rounded px-4 py-2 text-center transition-colors";
const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 hover:opacity-80",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:opacity-80",
  text: "text-[var(--color-gray-800)] hover:underline",
  "nav-link": "text-[var(--gray-text)] hover:text-[var(--primary)] hover:underline text-lg font-bold",
  "nav-primary": "px-6 py-3 bg-[var(--primary)] border border-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg rounded-xl shadow-md text-center hover:opacity-80",
  "nav-secondary": "px-6 py-3 bg-[var(--card)] border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--light-green)] font-bold text-lg rounded-xl shadow-md text-center hover:opacity-80",
  "nav-muted": "px-6 py-3 text-[var(--gray-text)] hover:text-[var(--primary)] hover:underline text-lg font-bold"
};
const LinkButton = React__default.memo(function LinkButton2({
  href,
  children,
  variant = "primary",
  className = "",
  "data-testid": dataTestId
}) {
  return /* @__PURE__ */ jsx("a", { href, className: `${baseStyles} ${variantStyles[variant]} ${className}`, "data-testid": dataTestId, children });
});
LinkButton.displayName = "LinkButton";

const Slider = React.forwardRef(
  (props, ref) => {
    const getThumbColor = (value) => {
      if (value <= 3) return "#10b981";
      if (value <= 6) return "#fbbf24";
      return "#ef4444";
    };
    const currentValue = props.value?.[0] ?? 0;
    const thumbColor = getThumbColor(currentValue);
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    const rgb = hexToRgb(thumbColor);
    const shadowColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : "rgba(0, 0, 0, 0.3)";
    const glowColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` : "rgba(0, 0, 0, 0.5)";
    return /* @__PURE__ */ jsxs("div", { style: { padding: "15px 0" }, children: [
      /* @__PURE__ */ jsx("style", { children: `
          .slider-root {
            position: relative;
            display: flex;
            align-items: center;
            user-select: none;
            touch-action: none;
            width: 100%;
            height: 20px;
          }
          
          .slider-track {
            background: linear-gradient(to right, #10b981, #fbbf24, #ef4444);
            position: relative;
            flex-grow: 1;
            height: 10px;
            border-radius: 9999px;
          }
          
          .slider-range {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.3);
            height: 100%;
          }
          
          .slider-thumb {
            display: block;
            width: 28px;
            height: 28px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .slider-thumb:hover {
            filter: brightness(0.95);
          }
          
          .slider-thumb:focus {
            outline: none;
          }

          .slider-thumb-heartbeat {
            animation: steady-pulse 1s ease-in-out infinite;
          }

          @keyframes steady-pulse {
            0% {
              transform: scale(0.95);
              box-shadow: 0 2px 10px var(--thumb-color-shadow, rgba(0, 0, 0, 0.3));
            }
            50% {
              transform: scale(0.99);
              box-shadow: 0 0 20px var(--thumb-color-glow, rgba(0, 0, 0, 0.5));
            }
            100% {
              transform: scale(1);
              box-shadow: 0 2px 10px var(--thumb-color-shadow, rgba(0, 0, 0, 0.3));
            }
          }
        ` }),
      /* @__PURE__ */ jsxs(SliderPrimitive.Root, { ref, className: "slider-root", ...props, children: [
        /* @__PURE__ */ jsx(SliderPrimitive.Track, { className: "slider-track", children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: "slider-range" }) }),
        /* @__PURE__ */ jsx(
          SliderPrimitive.Thumb,
          {
            className: "slider-thumb slider-thumb-heartbeat",
            style: {
              backgroundColor: thumbColor,
              border: `2px solid ${thumbColor}`,
              boxShadow: `0 0 0 5px ${thumbColor}33`,
              "--thumb-color-shadow": shadowColor,
              "--thumb-color-glow": glowColor
            }
          }
        )
      ] })
    ] });
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

function Spinner({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("animate-spin rounded-full border-4 border-t-transparent border-primary h-8 w-8", className), ...props });
}

const SubmitButton = React__default.memo(function SubmitButton2({ loading = false, className, children, ...props }) {
  return /* @__PURE__ */ jsx(Button, { type: "submit", size: "lg", loading, className, ...props, children });
});
SubmitButton.displayName = "SubmitButton";

const logoutUser = async () => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: JSON_HEADERS
    });
    if (!response.ok) {
      const json = await response.json();
      return {
        success: false,
        error: json.error || json.message || `Logout failed (status: ${response.status})`
      };
    }
    window.location.href = "/login";
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Logout error: ${message}`
    };
  }
};

const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      const result = await logoutUser();
      if (!result.success && result.error) {
        setError(result.error);
        window.alert(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error during logout";
      setError(errorMessage);
      window.alert(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);
  return {
    isLoggingOut,
    error,
    logout
  };
};

const LogoutButton = function LogoutButton2({ className = "" }) {
  const { isLoggingOut, logout } = useLogout();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      variant: "ghost",
      size: "default",
      onClick: logout,
      disabled: isLoggingOut,
      "aria-busy": isLoggingOut,
      className: cn(className),
      "data-testid": "logout-button",
      children: [
        isLoggingOut ? /* @__PURE__ */ jsx(Spinner, { className: "h-4 w-4" }) : null,
        isLoggingOut ? "Logging out..." : "Log out"
      ]
    }
  );
};

const $$Astro$1 = createAstro();
const $$Nav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Nav;
  const { isAuthenticated = false } = Astro2.props;
  const NAVIGATION_SECTIONS = ["about", "services", "benefits"];
  const AUTH_PAGES = ["/login", "/register"];
  const getCurrentPath = () => Astro2.url.pathname;
  const isAuthPage = () => AUTH_PAGES.includes(getCurrentPath());
  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const showAuthButtons = !isAuthenticated && !isAuthPage();
  const showUserButtons = isAuthenticated;
  return renderTemplate`${maybeRenderHead()}<nav class="flex items-center w-full z-[9]" role="navigation" aria-label="Main navigation"> <!-- Desktop Navigation --> <ul class="hidden lg:flex flex-1 justify-center items-center space-x-6" role="menubar"> ${NAVIGATION_SECTIONS.map((section) => renderTemplate`<li> ${renderComponent($$result, "LinkButton", LinkButton, { "href": `/#${section}`, "variant": "nav-link" }, { "default": ($$result2) => renderTemplate`${capitalizeFirst(section)}` })} </li>`)} </ul> <!-- Mobile Navigation --> <details class="lg:hidden ml-auto relative" role="group"> <summary class="list-none p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded-lg" aria-label="Toggle navigation menu" role="button" tabindex="0"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </summary> <ul class="absolute right-0 mt-2 w-48 bg-[var(--card)] p-4 shadow-md space-y-2 text-right border border-[var(--border)]" role="menu"> ${NAVIGATION_SECTIONS.map((section) => renderTemplate`<li> ${renderComponent($$result, "LinkButton", LinkButton, { "href": `/#${section}`, "variant": "nav-link", "className": "block" }, { "default": ($$result2) => renderTemplate`${capitalizeFirst(section)}` })} </li>`)} ${showAuthButtons && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <li> ${renderComponent($$result2, "LinkButton", LinkButton, { "href": "/login", "variant": "nav-primary", "className": "block w-full" }, { "default": ($$result3) => renderTemplate`
Log in
` })} </li> <li> ${renderComponent($$result2, "LinkButton", LinkButton, { "href": "/register", "variant": "nav-secondary", "className": "block w-full" }, { "default": ($$result3) => renderTemplate`
Register
` })} </li> ` })}`} ${showUserButtons && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <li> ${renderComponent($$result2, "LinkButton", LinkButton, { "href": "/sessions", "variant": "nav-link", "className": "block" }, { "default": ($$result3) => renderTemplate`
My Sessions
` })} </li> <li> ${renderComponent($$result2, "LinkButton", LinkButton, { "href": "/body-parts", "variant": "nav-link", "className": "block", "data-testid": "create-new-session-mobile" }, { "default": ($$result3) => renderTemplate`
Create New Session
` })} </li> <li> ${renderComponent($$result2, "LogoutButton", LogoutButton, { "client:load": true, "className": "block w-full bg-transparent border border-[var(--gray-text)] text-[var(--gray-text)] hover:bg-[var(--light-green)] font-bold px-6 rounded-xl transition-colors", "client:component-hydration": "load", "client:component-path": "@/components/auth/LogoutButton", "client:component-export": "LogoutButton" })} </li> ` })}`} </ul> </details> <!-- Desktop Auth/User Buttons --> <ul class="hidden lg:flex items-center space-x-6"> ${showAuthButtons && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <li> ${renderComponent($$result2, "LinkButton", LinkButton, { "href": "/login", "variant": "nav-primary" }, { "default": ($$result3) => renderTemplate`
Log in
` })} </li> <li> ${renderComponent($$result2, "LinkButton", LinkButton, { "href": "/register", "variant": "nav-secondary" }, { "default": ($$result3) => renderTemplate`
Register
` })} </li> ` })}`} ${showUserButtons && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <li> ${renderComponent($$result2, "LinkButton", LinkButton, { "href": "/sessions", "variant": "nav-link", "className": "block" }, { "default": ($$result3) => renderTemplate`
My Sessions
` })} </li> <li> ${renderComponent($$result2, "LinkButton", LinkButton, { "href": "/body-parts", "variant": "nav-link", "className": "block", "data-testid": "create-new-session-desktop" }, { "default": ($$result3) => renderTemplate`
Create New Session
` })} </li> <li> ${renderComponent($$result2, "LogoutButton", LogoutButton, { "client:load": true, "className": "bg-transparent border border-[var(--gray-text)] text-[var(--gray-text)] hover:bg-[var(--light-green)] font-bold px-6 rounded-xl transition-colors", "client:component-hydration": "load", "client:component-path": "@/components/auth/LogoutButton", "client:component-export": "LogoutButton" })} </li> ` })}`} </ul> </nav>`;
}, "/Users/monikabieniecka/Downloads/Physia/src/components/nav/Nav.astro", void 0);

const $$Astro = createAstro();
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "Physia - Exercise Plans" } = Astro2.props;
  const {
    data: { session }
  } = await Astro2.locals.supabase.auth.getSession();
  const isAuthenticated = !!session;
  return renderTemplate`<html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/ico" href="/favicon.ico"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-[var(--background)] text-[var(--foreground)]" data-astro-cid-sckkx6r4> <header class="bg-[var(--card)] shadow-md" data-astro-cid-sckkx6r4> <div class="container mx-auto px-2 sm:px-4 py-3 flex items-center" data-astro-cid-sckkx6r4> <a href="/" class="flex items-center gap-2" data-astro-cid-sckkx6r4> <img src="/favicon.ico" alt="Physia logo" class="h-8 w-auto" data-astro-cid-sckkx6r4> <span class="text-2xl font-bold text-[var(--primary)]" data-astro-cid-sckkx6r4>Physia</span> </a> <div class="flex-1 flex items-center" data-astro-cid-sckkx6r4> ${renderComponent($$result, "Nav", $$Nav, { "isAuthenticated": isAuthenticated, "data-astro-cid-sckkx6r4": true })} </div> </div> </header> <main data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])} </main> <footer class="mt-8 py-6 bg-[var(--muted)] text-center text-sm text-[var(--gray-text)]" data-astro-cid-sckkx6r4> <div class="container mx-auto px-4" data-astro-cid-sckkx6r4> <p data-astro-cid-sckkx6r4>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Physia. All rights reserved.</p> </div> </footer> </body></html>`;
}, "/Users/monikabieniecka/Downloads/Physia/src/layouts/Layout.astro", void 0);

export { $$Layout as $, Button as B, ErrorAlert as E, InputField as I, LinkButton as L, SubmitButton as S, Spinner as a, Slider as b, cn as c };
