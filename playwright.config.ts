import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

export default defineConfig({
  testDir: "./tests/e2e",

  // Disable parallel execution for better stability
  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  // Increase retries for better stability
  retries: process.env.CI ? 2 : 1,

  // Single worker for better stability
  workers: 1,

  // Increase global timeout
  timeout: 90000,

  reporter: "html",
  expect: {
    // Increase expect timeout to support session generation wait times
    timeout: 30000,
  },
  use: {
    baseURL: "http://localhost:4321",
    trace: "on",
    video: "on",
    screenshot: "on",

    // Increased timeouts
    navigationTimeout: 30000,
    actionTimeout: 20000,

    // Improve browser stability
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      slowMo: 100,
    },
  },
  projects: [
    {
      name: 'cleanup db',
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      teardown: 'cleanup db',
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: true,
    timeout: 120000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
