import react from "@vitejs/plugin-react";
import { join } from "path";
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
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        include: ["src/**/*.{js,jsx,ts,tsx}"],
        exclude: ["src/tests/**", "src/**/*.d.ts", "src/**/*.test.{js,jsx,ts,tsx}", "src/**/*.spec.{js,jsx,ts,tsx}"],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
      },
      deps: {
        inline: [/@supabase\/supabase-js/],
      },
      alias: {
        "astro:middleware": "./src/__mocks__/astro__middleware.ts",
      },
    },
  })
);
