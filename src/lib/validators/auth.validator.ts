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

/**
 * Client-side registration validation schema with password confirmation
 */
export const registerWithConfirmSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    passwordConfirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type RegisterWithConfirmData = z.infer<typeof registerWithConfirmSchema>;
