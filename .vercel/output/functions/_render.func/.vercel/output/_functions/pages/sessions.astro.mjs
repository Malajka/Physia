/* empty css                                      */
import {
  c as createComponent,
  a as createAstro,
  b as renderComponent,
  r as renderTemplate,
  m as maybeRenderHead,
  d as addAttribute,
} from "../chunks/astro/server_B181Abhk.mjs";
import "kleur/colors";
import { $ as $$Layout, L as LinkButton } from "../chunks/Layout_DXvctC9J.mjs";
export { renderers } from "../renderers.mjs";

const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
    Astro2.self = $$Index;
    const { data: authData } = await Astro2.locals.supabase.auth.getSession();
    const session = authData.session;
    if (!session) {
      return Astro2.redirect("/login?error=not_authenticated");
    }
    const userId = session.user.id;
    const { data: sessionsRaw, error: fetchError } = await Astro2.locals.supabase
      .from("sessions")
      .select("id, created_at, training_plan, body_parts(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const sessionsTyped = (sessionsRaw ?? []).map((row) => ({
      id: row.id,
      created_at: row.created_at,
      plan: row.training_plan,
      bodyPartName: row.body_parts?.name ?? "",
    }));
    const pageTitle = "My Exercise Sessions";
    return renderTemplate`${renderComponent(
      $$result,
      "Layout",
      $$Layout,
      { title: pageTitle },
      {
        default: async ($$result2) =>
          renderTemplate` ${maybeRenderHead()}<div class="container mx-auto p-8"> <h1 class="text-3xl font-bold mb-8">My Exercise Sessions</h1> ${fetchError && renderTemplate`<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"> <p>Error loading sessions: ${fetchError.message}</p> </div>`} ${
            !sessionsTyped.length
              ? renderTemplate`<div class="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center"> <h2 class="text-2xl font-bold text-[var(--foreground)] mb-8">No sessions yet</h2> <p class="text-xl text-[var(--foreground)] mb-8">Start by creating your first personalized exercise plan!</p> ${renderComponent(
                  $$result2,
                  "LinkButton",
                  LinkButton,
                  { href: "/body-parts", variant: "nav-primary", "data-testid": "create-first-session" },
                  {
                    default: async ($$result3) => renderTemplate`
Create New Session
`,
                  }
                )} </div>`
              : renderTemplate`<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> ${sessionsTyped.map(
                  (
                    session2
                  ) => renderTemplate`<div class="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"${addAttribute(`session-item-${session2.id}`, "data-testid")}> <div class="flex justify-between items-start mb-2"> <h3 class="font-semibold text-lg">${session2.plan.title || `Session for ${session2.bodyPartName}`}</h3> <span class="text-xs text-gray-500">${new Date(session2.created_at).toLocaleDateString()}</span> </div> <p class="text-sm text-gray-600 mb-4 line-clamp-2">${session2.plan.description || "Personalized exercise plan"}</p> <a${addAttribute(`/sessions/${session2.id}`, "href")} class="text-[#14a49b] hover:underline text-sm font-medium"${addAttribute(`session-details-link-${session2.id}`, "data-testid")}>
View Details →
</a> </div>`
                )} </div>`
          } </div> `,
      }
    )}`;
  },
  "/Users/monikabieniecka/Downloads/Physia/src/pages/sessions/index.astro",
  void 0
);

const $$file = "/Users/monikabieniecka/Downloads/Physia/src/pages/sessions/index.astro";
const $$url = "/sessions";

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: $$Index,
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
