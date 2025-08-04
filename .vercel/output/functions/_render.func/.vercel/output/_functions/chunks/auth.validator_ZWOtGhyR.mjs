import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required")
});
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});
const registerWithConfirmSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  passwordConfirm: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"]
});

export { registerWithConfirmSchema as a, loginSchema as l, registerSchema as r };
