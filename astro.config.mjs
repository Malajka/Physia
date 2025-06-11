// @ts-check
import { defineConfig } from "astro/config";
import path from "path";
import vercel from "@astrojs/vercel/serverless";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({}),
  integrations: [react(), sitemap()],
  server: { port: 4321 },
  experimental: {
    session: false,
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    plugins: [tailwindcss()],
  },
});
