import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";
import path from "path";

export default defineConfig({
  output: "server",
  adapter: vercel({}),
  integrations: [react(), sitemap(), tailwind()],
  server: { port: 4321 },

  vite: {
    ssr: {
      noExternal: ["react", "react-dom", "react-router-dom"],
    },
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
