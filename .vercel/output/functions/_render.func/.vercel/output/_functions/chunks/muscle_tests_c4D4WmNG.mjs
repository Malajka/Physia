import { w as withAuth } from './withAuth_B5AzTmJJ.mjs';
import { j as jsonResponse } from './response_BJucfPdF.mjs';
import { z } from 'zod';

const prerender = false;
const ParamsSchema = z.object({
  body_part_id: z.coerce.number({
    required_error: "body_part_id is required",
    invalid_type_error: "body_part_id must be a number"
  }).int().positive()
});
const SELECT_COLUMNS = "id, body_part_id, name, description, created_at";
const GET = withAuth(async ({ locals: { supabase }, params }, _userId) => {
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return jsonResponse({ error: "Invalid body_part_id", details: parsed.error.flatten() }, 400);
  }
  const bodyPartId = parsed.data.body_part_id;
  try {
    const { data, error } = await supabase.from("muscle_tests").select(SELECT_COLUMNS).eq("body_part_id", bodyPartId);
    if (error) {
      return jsonResponse({ error: "Failed to fetch muscle tests", details: error.message }, 502);
    }
    return jsonResponse({ data: data ?? [] }, 200);
  } catch (e) {
    console.error("Internal server error fetching muscle tests:", e);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

export { GET as G, _page as _ };
