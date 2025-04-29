import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

// Login request schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const POST: APIRoute = async ({ request, redirect, cookies, locals }) => {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: result.error.errors.map(e => e.message).join(", ") 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { email, password } = result.data;
    
    // Attempt to sign in with Supabase
    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Login error:", error.message);
      return new Response(
        JSON.stringify({ error: "Invalid login credentials" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Success - return session data
    return new Response(
      JSON.stringify({ 
        user: data.user,
        session: data.session
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error during login:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 