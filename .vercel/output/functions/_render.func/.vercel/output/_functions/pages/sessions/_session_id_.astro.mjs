/* empty css                                         */
import { c as createComponent, a as createAstro, b as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_B181Abhk.mjs';
import 'kleur/colors';
import { jsx, jsxs } from 'react/jsx-runtime';
import { B as Button, $ as $$Layout } from '../../chunks/Layout_DXvctC9J.mjs';
import { useState, useEffect, useCallback } from 'react';
import 'clsx';
import { J as JSON_HEADERS } from '../../chunks/api_CZk8L_u-.mjs';
export { renderers } from '../../renderers.mjs';

async function fetchFeedback(sessionId) {
  const response = await fetch(`/api/sessions/${sessionId}/feedback`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to load feedback");
  return result;
}
async function submitFeedback(sessionId, rating) {
  const response = await fetch(`/api/sessions/${sessionId}/feedback`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ rating })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to submit feedback");
  return result;
}

const FeedbackRating = ({ sessionId }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    let isMounted = true;
    async function loadFeedback() {
      try {
        const result = await fetchFeedback(sessionId);
        if (isMounted) setFeedback(result.data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeedback();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);
  const handleRate = useCallback(
    async (rating) => {
      setSaving(true);
      setError(null);
      try {
        const result = await submitFeedback(sessionId, rating);
        setFeedback(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setSaving(false);
      }
    },
    [sessionId]
  );
  if (loading) return /* @__PURE__ */ jsx("p", { children: "Loading feedback..." });
  if (error && !feedback) {
    return /* @__PURE__ */ jsx("p", { className: "text-red-600 mb-2", "data-testid": "feedback-error", children: error });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center", "data-testid": "feedback-rating", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-2 font-medium", children: "Rate this session:" }),
    error && /* @__PURE__ */ jsx("p", { className: "text-red-600 mb-2", "data-testid": "feedback-error", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-center space-x-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          "aria-label": "Rate session as positive",
          disabled: saving,
          variant: feedback?.rating === 1 ? "default" : "outline",
          onClick: () => handleRate(1),
          "data-testid": "feedback-positive",
          children: saving && feedback?.rating !== 0 ? "..." : "👍"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          "aria-label": "Rate session as negative",
          disabled: saving,
          variant: feedback?.rating === 0 ? "destructive" : "outline",
          onClick: () => handleRate(0),
          "data-testid": "feedback-negative",
          children: saving && feedback?.rating !== 1 ? "..." : "👎"
        }
      )
    ] }),
    feedback?.rated_at && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-gray-500", "data-testid": "feedback-rated-at", children: [
      "Rated at: ",
      new Date(feedback.rated_at).toLocaleString()
    ] })
  ] });
};

function formatExerciseDescription(description) {
  if (!description) {
    return { warmup: [], workout: [], cooldown: [], general: [] };
  }
  const warmup = [];
  const workout = [];
  const cooldown = [];
  const general = [];
  const sections = description.split(/###/).filter((section) => section.trim().length > 0);
  sections.forEach((section) => {
    const lines = section.trim().split("\n").filter((line) => line.trim().length > 0);
    if (lines.length === 0) return;
    const sectionType = lines[0].toLowerCase().trim();
    const content = lines.slice(1);
    if (!["warmup", "workout", "cooldown", "warm-up", "cool-down"].includes(sectionType)) {
      const allLines = [lines[0], ...content];
      allLines.forEach((line) => {
        const cleanLine = line.trim();
        if (cleanLine.length > 0) {
          general.push(cleanLine);
        }
      });
      return;
    }
    content.forEach((line) => {
      const cleanLine = line.trim();
      if (cleanLine.length === 0) return;
      const processedLine = cleanLine.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "");
      switch (sectionType) {
        case "warmup":
        case "warm-up":
          warmup.push(processedLine);
          break;
        case "workout":
          workout.push(processedLine);
          break;
        case "cooldown":
        case "cool-down":
          cooldown.push(processedLine);
          break;
      }
    });
  });
  if (warmup.length === 0 && workout.length === 0 && cooldown.length === 0) {
    const lines = description.split("\n").filter((line) => line.trim().length > 0);
    lines.forEach((line) => {
      const cleanLine = line.trim().replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "");
      if (cleanLine.length > 0) {
        general.push(cleanLine);
      }
    });
  }
  return { warmup, workout, cooldown, general };
}
function TrainingPlanDisplay({ trainingPlan, exerciseImagesMap }) {
  const allSections = {
    warmup: [],
    workout: [],
    cooldown: []
  };
  trainingPlan.exercises.forEach((exercise) => {
    const formatted = formatExerciseDescription(exercise.description);
    if (formatted.warmup.length > 0) {
      allSections.warmup.push({ exercise, content: formatted.warmup });
    }
    if (formatted.workout.length > 0 || formatted.general.length > 0) {
      allSections.workout.push({
        exercise,
        content: formatted.workout.length > 0 ? formatted.workout : formatted.general
      });
    }
    if (formatted.cooldown.length > 0) {
      allSections.cooldown.push({ exercise, content: formatted.cooldown });
    }
  });
  const SectionCard = ({
    title,
    sectionData,
    bgColor = "bg-white",
    accentColor = "blue"
  }) => /* @__PURE__ */ jsxs("div", { className: `${bgColor} rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] min-h-[400px]`, children: [
    /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-gray-800 mb-6 text-center pb-3 border-b border-gray-200", children: title }),
    sectionData.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: sectionData.map(({ exercise, content }, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        "data-testid": `session-exercise-${exercise.id}`,
        className: "border border-gray-200 rounded-lg p-4 bg-gray-50",
        children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-lg text-gray-800 mb-2", children: exercise.name }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 mb-3 text-sm", children: [
            /* @__PURE__ */ jsxs("span", { className: "bg-[var(--primary)] text-white px-2 py-1 rounded-md", children: [
              exercise.sets,
              " sets"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "bg-[var(--primary)] text-white px-2 py-1 rounded-md", children: [
              exercise.reps,
              " reps"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "bg-gray-600 text-white px-2 py-1 rounded-md", children: [
              exercise.rest_time_seconds,
              "s rest"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `${accentColor === "orange" ? "bg-orange-50 border-l-4 border-orange-400" : accentColor === "blue" ? "bg-blue-50 border-l-4 border-blue-400" : "bg-green-50 border-l-4 border-green-400"} p-3 rounded-r`,
              children: /* @__PURE__ */ jsx(
                "ul",
                {
                  className: `text-sm ${accentColor === "orange" ? "text-orange-700" : accentColor === "blue" ? "text-blue-700" : "text-green-700"} space-y-1`,
                  children: content.map((item, itemIndex) => /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `w-2 h-2 ${accentColor === "orange" ? "bg-orange-400" : accentColor === "blue" ? "bg-blue-400" : "bg-green-400"} rounded-full mt-2 mr-2 flex-shrink-0`
                      }
                    ),
                    item
                  ] }, itemIndex))
                }
              )
            }
          ),
          exercise.notes && /* @__PURE__ */ jsx("div", { className: "mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-800 italic", children: exercise.notes }) }),
          exerciseImagesMap[exercise.id]?.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: exerciseImagesMap[exercise.id].map((img, imgIndex) => /* @__PURE__ */ jsx(
            "img",
            {
              src: img.file_path,
              alt: exercise.name,
              className: "w-20 h-20 object-cover rounded-lg border border-gray-200"
            },
            imgIndex
          )) }) })
        ]
      },
      `${exercise.id}-${index}`
    )) }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32 text-gray-500", children: /* @__PURE__ */ jsx("p", { children: "No exercises for this section" }) })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { "data-testid": "session-title", className: "text-3xl font-bold text-gray-800 mb-4", children: trainingPlan.title }),
      /* @__PURE__ */ jsx("p", { "data-testid": "session-description", className: "text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed", children: trainingPlan.description })
    ] }),
    trainingPlan.warnings && trainingPlan.warnings.length > 0 && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border-l-4 border-red-400 p-4 rounded-r mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-red-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx(
        "path",
        {
          fillRule: "evenodd",
          d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
          clipRule: "evenodd"
        }
      ) }) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-red-800 uppercase tracking-wide mb-2", children: "Important Safety Information" }),
        /* @__PURE__ */ jsx("ul", { className: "text-sm text-red-700 space-y-1", children: trainingPlan.warnings.map((warning, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0" }),
          warning
        ] }, index)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx(SectionCard, { title: "Warm-Up", sectionData: allSections.warmup, bgColor: "bg-gradient-to-br from-orange-50 to-orange-100", accentColor: "orange" }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Workout", sectionData: allSections.workout, bgColor: "bg-gradient-to-br from-blue-50 to-blue-100", accentColor: "blue" }),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          title: "Cool-Down",
          sectionData: allSections.cooldown,
          bgColor: "bg-gradient-to-br from-green-50 to-green-100",
          accentColor: "green"
        }
      )
    ] })
  ] });
}

const $$Astro = createAstro();
const prerender = false;
const $$sessionId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$sessionId;
  const {
    data: { user }
  } = await Astro2.locals.supabase.auth.getUser();
  if (!user) {
    return Astro2.redirect("/login?error=authentication_required");
  }
  if (!user.user_metadata?.disclaimer_accepted_at) {
    return Astro2.redirect("/body-parts?error=disclaimer_required");
  }
  const sessionId = Number(Astro2.params.session_id);
  const pageTitle = `Session ${sessionId}`;
  let trainingSession = null;
  const supabase = Astro2.locals.supabase;
  const { data: sessionRow, error: fetchError } = await supabase.from("sessions").select("training_plan").eq("id", sessionId).eq("user_id", user.id).single();
  if (fetchError || !sessionRow) {
    return Astro2.redirect("/sessions?error=not_found");
  }
  trainingSession = { training_plan: sessionRow.training_plan };
  let exerciseImagesMap = {};
  if (trainingSession) {
    const exerciseIds = trainingSession.training_plan.exercises.map((ex) => ex.id);
    if (exerciseIds.length > 0) {
      const { data: exercisesData, error: exercisesError } = await supabase.from("exercises").select("id, exercise_images(file_path, metadata)").in("id", exerciseIds);
      if (!exercisesError && exercisesData) {
        exerciseImagesMap = exercisesData.reduce(
          (acc, item) => {
            acc[item.id] = item.exercise_images;
            return acc;
          },
          {}
        );
      }
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-br from-[#b8e6d9] via-[#d4f1e8] to-[#e8f5e1]"> <div class="container mx-auto p-8"> <!-- Header --> <div class="text-center mb-8"> <img src="/images/phybsia.png" alt="Phybsia cat" class="mx-auto mb-4" style="max-width:6.25rem;width:100%;display:block;"> <h1 class="text-3xl font-bold text-gray-800 mb-2">Session ${sessionId}</h1> <p class="text-lg text-gray-600">Your training plan is ready!</p> </div> ${trainingSession ? renderTemplate`<div class="max-w-7xl mx-auto"> ${renderComponent($$result2, "TrainingPlanDisplay", TrainingPlanDisplay, { "client:load": true, "trainingPlan": trainingSession.training_plan, "exerciseImagesMap": exerciseImagesMap, "client:component-hydration": "load", "client:component-path": "@/components/session/TrainingPlanDisplay", "client:component-export": "TrainingPlanDisplay" })} <div class="mt-12 bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-2xl mx-auto"> <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">How was your session?</h3> ${renderComponent($$result2, "FeedbackRating", FeedbackRating, { "client:load": true, "sessionId": sessionId, "client:component-hydration": "load", "client:component-path": "@/components/session/FeedbackRating", "client:component-export": "FeedbackRating" })} </div> </div>` : renderTemplate`<div class="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-2xl mx-auto text-center"> <p class="text-red-600">No training plan found for this session.</p> </div>`} <!-- Navigation --> <div class="text-center mt-8"> <a href="/body-parts" class="inline-flex items-center px-6 py-3 bg-white text-[#14a49b] font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>
Back to start
</a> </div> </div> </div> ` })}`;
}, "/Users/monikabieniecka/Downloads/Physia/src/pages/sessions/[session_id].astro", void 0);

const $$file = "/Users/monikabieniecka/Downloads/Physia/src/pages/sessions/[session_id].astro";
const $$url = "/sessions/[session_id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$sessionId,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
