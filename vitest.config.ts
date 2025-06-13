// vite.config.ts

import react from "@vitejs/plugin-react";
import { join, resolve } from "path"; // <-- ZAKTUALIZOWANY IMPORT
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
      include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}", "src/**/__tests__/**/*.{js,jsx,ts,tsx}"],
      exclude: ["e2e/**"],
      // ... reszta twojej konfiguracji ...
      deps: {
        inline: [/@supabase\/supabase-js/],
      },
      // --- NAJWAŻNIEJSZA ZMIANA JEST TUTAJ ---
      alias: {
        "astro:middleware": resolve(__dirname, "src/__mocks__/astro__middleware.ts"),
      },
    },
  })
);
