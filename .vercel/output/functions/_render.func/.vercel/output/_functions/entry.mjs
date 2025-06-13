import { renderers } from "./renderers.mjs";
import { c as createExports } from "./chunks/entrypoint_DUTQUQaA.mjs";
import { manifest } from "./manifest_B3ofmKxZ.mjs";

const _page0 = () => import("./pages/_image.astro.mjs");
const _page1 = () => import("./pages/api/auth/login.astro.mjs");
const _page2 = () => import("./pages/api/auth/login.test.astro.mjs");
const _page3 = () => import("./pages/api/auth/logout.astro.mjs");
const _page4 = () => import("./pages/api/auth/logout.test.astro.mjs");
const _page5 = () => import("./pages/api/auth/register.astro.mjs");
const _page6 = () => import("./pages/api/auth/register.test.astro.mjs");
const _page7 = () => import("./pages/api/body_parts/_body_part_id_/muscle_tests.astro.mjs");
const _page8 = () => import("./pages/api/body_parts/_body_part_id_/muscle_tests.test.astro.mjs");
const _page9 = () => import("./pages/api/body_parts.astro.mjs");
const _page10 = () => import("./pages/api/body_parts.test.astro.mjs");
const _page11 = () => import("./pages/api/disclaimers.astro.mjs");
const _page12 = () => import("./pages/api/disclaimers.test.astro.mjs");
const _page13 = () => import("./pages/api/sessions/_session_id_/exercises.astro.mjs");
const _page14 = () => import("./pages/api/sessions/_session_id_/exercises.test.astro.mjs");
const _page15 = () => import("./pages/api/sessions/_session_id_/feedback.astro.mjs");
const _page16 = () => import("./pages/api/sessions/_session_id_/feedback.test.astro.mjs");
const _page17 = () => import("./pages/api/sessions.astro.mjs");
const _page18 = () => import("./pages/api/sessions.test.astro.mjs");
const _page19 = () => import("./pages/api/test-db.astro.mjs");
const _page20 = () => import("./pages/body-parts.astro.mjs");
const _page21 = () => import("./pages/login.astro.mjs");
const _page22 = () => import("./pages/muscle-tests/_body_part_id_.astro.mjs");
const _page23 = () => import("./pages/register.astro.mjs");
const _page24 = () => import("./pages/session/generate.astro.mjs");
const _page25 = () => import("./pages/sessions/_session_id_.astro.mjs");
const _page26 = () => import("./pages/sessions.astro.mjs");
const _page27 = () => import("./pages/index.astro.mjs");

const pageMap = new Map([
  ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
  ["src/pages/api/auth/login.ts", _page1],
  ["src/pages/api/auth/login.test.ts", _page2],
  ["src/pages/api/auth/logout.ts", _page3],
  ["src/pages/api/auth/logout.test.ts", _page4],
  ["src/pages/api/auth/register.ts", _page5],
  ["src/pages/api/auth/register.test.ts", _page6],
  ["src/pages/api/body_parts/[body_part_id]/muscle_tests.ts", _page7],
  ["src/pages/api/body_parts/[body_part_id]/muscle_tests.test.ts", _page8],
  ["src/pages/api/body_parts/index.ts", _page9],
  ["src/pages/api/body_parts/index.test.ts", _page10],
  ["src/pages/api/disclaimers/index.ts", _page11],
  ["src/pages/api/disclaimers/index.test.ts", _page12],
  ["src/pages/api/sessions/[session_id]/exercises.ts", _page13],
  ["src/pages/api/sessions/[session_id]/exercises.test.ts", _page14],
  ["src/pages/api/sessions/[session_id]/feedback.ts", _page15],
  ["src/pages/api/sessions/[session_id]/feedback.test.ts", _page16],
  ["src/pages/api/sessions/index.ts", _page17],
  ["src/pages/api/sessions/index.test.ts", _page18],
  ["src/pages/api/test-db.ts", _page19],
  ["src/pages/body-parts.astro", _page20],
  ["src/pages/login.astro", _page21],
  ["src/pages/muscle-tests/[body_part_id].astro", _page22],
  ["src/pages/register.astro", _page23],
  ["src/pages/session/generate.astro", _page24],
  ["src/pages/sessions/[session_id].astro", _page25],
  ["src/pages/sessions/index.astro", _page26],
  ["src/pages/index.astro", _page27],
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  middleware: () => import("./_astro-internal_middleware.mjs"),
});
const _args = {
  middlewareSecret: "9e6eb9b5-1d31-42a3-bfff-774aa154acff",
  skewProtection: false,
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
