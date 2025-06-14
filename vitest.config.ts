import react from "@vitejs/plugin-react";
import { join, resolve } from "path";
import { defineConfig as defineViteConfig } from "vite";
import { defineConfig, mergeConfig } from "vitest/config";

const viteConfig = defineViteConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": join(__dirname, "src"),
    },
  },
});

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/tests/setup.ts"],
      include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
      exclude: ["e2e/**"],
      deps: {
        inline: [/@supabase\/supabase-js/],
      },
      alias: {
        "astro:middleware": resolve(__dirname, "src/__mocks__/astro__middleware.ts"),
      },
    },
  })
);
