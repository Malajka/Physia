import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import path from "path";

export default defineConfig({
  output: "server",
  integrations: [react()],
  server: { port: 4321 },
  experimental: {
    session: true,
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    plugins: [tailwindcss()],
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    runtime: {
      mode: "local",
      type: "pages",
    },
  }),
});
