import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";

teardown("cleanup database after all tests", async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseServiceKey) {
    return;
  }

  if (!testUserId) {
    return;
  }

  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  await supabaseAdmin.from("sessions").delete().eq("user_id", testUserId);
  await supabaseAdmin.from("generation_error_logs").delete().eq("user_id", testUserId);
  await supabaseAdmin.from("feedback_ratings").delete().eq("user_id", testUserId);

  const { data: testUsers } = await supabaseAdmin.auth.admin.listUsers();

  if (testUsers?.users) {
    for (const user of testUsers.users) {
      if (user.email?.includes("test-user-") && user.email?.includes("@example.com")) {
        await supabaseAdmin.from("sessions").delete().eq("user_id", user.id);
        await supabaseAdmin.from("generation_error_logs").delete().eq("user_id", user.id);
        await supabaseAdmin.from("feedback_ratings").delete().eq("user_id", user.id);
        await supabaseAdmin.auth.admin.deleteUser(user.id);
      }
    }
  }
});
