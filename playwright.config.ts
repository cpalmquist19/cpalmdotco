import { defineConfig, devices } from "@playwright/test";

// PORT lets the tests run beside a dev server that is already using 3000
const PORT = Number(process.env.PORT) || 3000;
const isCI = !!process.env.CI;

// Smoke tests for the site. /api/chat is always mocked inside the tests, so no model is called and no API key is needed.
export default defineConfig({
  testDir: "./e2e",
  // A cold dev server compiles each page the first time it is visited
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI serves the production build made by the step before it. Locally this starts the dev server, or reuses the one already running
    command: `npm ${isCI ? "start" : "run dev"} -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
