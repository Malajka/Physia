import { o as e, s } from "./types.B_THrErz.js";
const i = e({
  email: s().email("Please enter a valid email address"),
  password: s({ required_error: "Password is required" }).min(1, "Password is required"),
});
e({ email: s().email("Please enter a valid email address"), password: s().min(8, "Password must be at least 8 characters long") });
const o = e({
  email: s().email("Please enter a valid email address"),
  password: s().min(8, "Password must be at least 8 characters long"),
  passwordConfirm: s().min(1, "Please confirm your password"),
}).refine((a) => a.password === a.passwordConfirm, { message: "Passwords do not match", path: ["passwordConfirm"] });
export { i as l, o as r };
