import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import path from "path";

export default defineConfig({
  output: "server",
  adapter: vercel({}),
  integrations: [react(), sitemap(), tailwind()],
  server: { port: 4321 },

  vite: {
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
});
