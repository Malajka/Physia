import { defineConfig } from "astro/config";
import path from "path";
import vercel from "@astrojs/vercel/serverless";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({}),
  // Dodaj tailwind() do integracji
  integrations: [react(), sitemap(), tailwind()],
  server: { port: 4321 },

  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
