import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import path from "path";

export default defineConfig({
  output: "server",
  integrations: [react()],
  server: { host: true, port: 4321 },
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
    ssr: {
      external: ["@emnapi/runtime"],
    },
  },
  adapter: cloudflare({
    runtime: "nodejs-compat",
  }),
});
