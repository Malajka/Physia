import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

// Registration request schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export const POST: APIRoute = async ({ request, redirect, cookies, locals }) => {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: result.error.errors.map(e => e.message).join(", ") 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { email, password } = result.data;
    
    // Attempt to sign up with Supabase
    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login`
      }
    });
    
    if (error) {
      console.error("Registration error:", error.message);
      
      // Handle specific errors
      if (error.message.includes("email already") || error.message.includes("already registered")) {
        return new Response(
          JSON.stringify({ 
            error: "This email is already registered. If this is your account, please use the login page instead."
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Success - return user data
    return new Response(
      JSON.stringify({ 
        user: data.user,
        message: "Registration successful! Please check your email for confirmation."
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 