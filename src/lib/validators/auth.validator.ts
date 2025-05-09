import type { AuthCredentialsDto } from "@/types";
import { z, type ZodType } from "zod";

/**
 * Shared login validation schema for both client and server
 */
export const loginSchema: ZodType<AuthCredentialsDto> = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

/**
 * Shared registration validation schema for server-side auth
 */
export const registerSchema: ZodType<AuthCredentialsDto> = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
