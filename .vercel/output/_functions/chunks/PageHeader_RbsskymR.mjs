import { f as fetchArray } from "./fetch_BqXSZS0y.mjs";
import { z } from "zod";
import { c as createComponent, a as createAstro, m as maybeRenderHead, b as renderTemplate } from "./astro/server_CfAXeihZ.mjs";
import "kleur/colors";
import "clsx";

const MuscleTestDtoSchema = z.object({
  id: z.number(),
  body_part_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
});
async function fetchMuscleTests(bodyPartId, apiBase) {
  const list = await fetchArray(`${apiBase}/api/body_parts/${bodyPartId}/muscle_tests`);
  return MuscleTestDtoSchema.array().parse(list);
}

const BodyPartIdSchema = z.coerce
  .number({ invalid_type_error: "bodyPartId must be a number" })
  .int({ message: "bodyPartId must be an integer" })
  .positive({ message: "bodyPartId must be a positive integer" });
function validateBodyPartId(bodyPartIdString) {
  return BodyPartIdSchema.parse(bodyPartIdString);
}
const BodyPartDtoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  created_at: z.string(),
});
const BodyPartDtoArraySchema = z.array(BodyPartDtoSchema);
function validateBodyPartsDto(bodyParts) {
  return BodyPartDtoArraySchema.parse(bodyParts);
}

async function fetchAllBodyParts(origin, { signal } = {}) {
  const bodyPartsRaw = await fetchArray(`${origin}/api/body_parts`, signal);
  return validateBodyPartsDto(bodyPartsRaw);
}
async function fetchMuscleTestsAndBodyPartName(bodyPartIdString, origin) {
  const bodyPartId = validateBodyPartId(bodyPartIdString);
  const [muscleTests, bodyParts] = await Promise.all([fetchMuscleTests(bodyPartId, origin), fetchAllBodyParts(origin)]);
  const found = bodyParts.find((bodyPart) => bodyPart.id === bodyPartId);
  return { muscleTests, bodyPartName: found?.name ?? "" };
}

const $$Astro = createAstro();
const $$PageHeader = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
    Astro2.self = $$PageHeader;
    const { title, subtitle } = Astro2.props;
    return renderTemplate`${maybeRenderHead()}<header class="mb-6"> <h1 class="text-2xl font-bold">${title}</h1> ${subtitle && renderTemplate`<p class="text-gray-600 mt-2 text-sm">${subtitle}</p>`} </header>`;
  },
  "/Users/monikabieniecka/Downloads/Physia/src/components/common/PageHeader.astro",
  void 0
);

export { $$PageHeader as $, fetchAllBodyParts as a, fetchMuscleTestsAndBodyPartName as f, validateBodyPartId as v };
