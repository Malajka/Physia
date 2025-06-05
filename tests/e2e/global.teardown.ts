import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";

teardown("cleanup database after all tests", async () => {
  console.log("🧹 Starting database cleanup for E2E test user...");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase credentials for cleanup");
    return;
  }

  if (!testUserId) {
    console.error("❌ Missing E2E_USERNAME_ID for cleanup");
    return;
  }

  // Create admin client with service key for cleanup operations
  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    console.log(`🧹 Cleaning data for test user ID: ${testUserId}`);

    // Clean up sessions for the test user (this will cascade to session_tests and feedback_ratings)
    console.log("🗑️ Cleaning user sessions...");
    const { error: sessionsError } = await supabaseAdmin.from("sessions").delete().eq("user_id", testUserId);

    if (sessionsError) {
      console.error("❌ Error cleaning sessions:", sessionsError);
    } else {
      console.log("✅ User sessions cleaned");
    }

    // Clean up generation error logs for the test user
    console.log("🗑️ Cleaning user error logs...");
    const { error: logsError } = await supabaseAdmin.from("generation_error_logs").delete().eq("user_id", testUserId);

    if (logsError) {
      console.error("❌ Error cleaning generation error logs:", logsError);
    } else {
      console.log("✅ User error logs cleaned");
    }

    // Clean up feedback ratings for the test user
    console.log("🗑️ Cleaning user feedback ratings...");
    const { error: feedbackError } = await supabaseAdmin.from("feedback_ratings").delete().eq("user_id", testUserId);

    if (feedbackError) {
      console.error("❌ Error cleaning feedback ratings:", feedbackError);
    } else {
      console.log("✅ User feedback ratings cleaned");
    }

    // Note: We keep the test user intact for subsequent test runs
    console.log(`✅ Keeping test user ${testUserId} for reuse in future tests`);

    console.log("🎉 Database cleanup completed successfully");
  } catch (error) {
    console.error("❌ Unexpected error during cleanup:", error);
    throw error;
  }
});
