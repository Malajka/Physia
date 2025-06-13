import { createClient } from "@supabase/supabase-js";
export { renderers } from "../../renderers.mjs";

const prerender = false;
const GET = async () => {
  console.log("\n--- DB CONNECTION TEST ---");
  const url = "https://juecydaoemmuzshzkjki.supabase.co";
  const serviceKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZWN5ZGFvZW1tdXpzaHpramtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc4ODIxMiwiZXhwIjoyMDYyMzY0MjEyfQ.w7dWvcQzJ902yFRAImyLKnpWnvX-vv9aLkGZbxfXLmc";
  console.log("[TEST INFO] Server has loaded environment variables.");
  const adminSupabase = createClient(url, serviceKey);
  try {
    const { data, error } = await adminSupabase.from("body_parts").select("*");
    if (error) {
      console.error("[TEST FAILED] Supabase returned an error:", error);
      return new Response(JSON.stringify({ error: "Supabase query failed.", details: error.message }), { status: 500 });
    }
    console.log(`[TEST SUCCESS] Supabase returned ${data.length} rows.`);
    console.log("------------------------\n");
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[TEST FAILED] An unexpected error occurred:", e);
    return new Response(JSON.stringify({ error: "An unexpected server error occurred." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      GET,
      prerender,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);

const page = () => _page;

export { page };
