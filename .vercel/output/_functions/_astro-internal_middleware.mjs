import { createClient } from "@supabase/supabase-js";
import { h as handleRequest } from "./chunks/middlewareHandler_Df1XKz0V.mjs";
import "es-module-lexer";
import "./chunks/astro-designed-error-pages_Cv7EM1T7.mjs";
import "kleur/colors";
import "./chunks/astro/server_CfAXeihZ.mjs";
import "clsx";
import "cookie";
import { s as sequence } from "./chunks/index_C_bCMJXd.mjs";

const supabaseUrl = "https://juecydaoemmuzshzkjki.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZWN5ZGFvZW1tdXpzaHpramtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODgyMTIsImV4cCI6MjA2MjM2NDIxMn0.ttj-Z2cxA9CEl1Mb0ZH095CaB7XFIYT06WyOlU__8Kc";
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const onRequest$1 = async (context, next) => {
  context.locals.supabase = supabaseClient;
  return handleRequest(context, next);
};

const onRequest = sequence(onRequest$1);

export { onRequest };
