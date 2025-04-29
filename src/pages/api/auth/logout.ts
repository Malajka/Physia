import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals, redirect, cookies }) => {
  try {
    // Sign out from Supabase
    const { error } = await locals.supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to log out" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Clear auth cookies
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error during logout:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 