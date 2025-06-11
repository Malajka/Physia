// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
// @ts-expect-error - @tailwindcss/vite lacks TypeScript declarations
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import path from "path";

// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    host: true,
    port: 4321,
  },
  experimental: {
    session: true,
  },
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: "server", access: "secret" }),
      SUPABASE_PUBLIC_KEY: envField.string({ context: "server", access: "secret" }),
      OPENROUTER_API_KEY: envField.string({ context: "server", access: "secret" }),
      OPENROUTER_USE_MOCK: envField.string({ context: "server", access: "secret" }),
    },
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    plugins: [tailwindcss()],
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [react()],
  adapter: cloudflare(),
});
