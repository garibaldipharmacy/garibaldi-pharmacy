import { defineConfig, devices } from "@playwright/test";

// Runs against the real build output rather than the dev server, so the thing
// under test is the artifact that actually gets deployed.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3000",
    // Traces capture whatever the tests type. Fixtures use obviously fake
    // patient data, but keep capture off unless a test actually fails.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "node .output/server/index.mjs",
        url: "http://127.0.0.1:3000/api/health",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          HOST: "127.0.0.1",
          PORT: "3000",
          // Isolated store so a test run never touches real submissions.
          DATA_DIR: ".data/e2e",
          // The suite makes more submissions from one IP than a real patient ever
          // would. Rate limiting itself is covered by the unit tests.
          SUBMIT_RATE_LIMIT: "1000",
          // Known-good credentials for the admin tests. This hash exists only
          // in CI and corresponds to a password that guards nothing real.
          ADMIN_PASSWORD_HASH: "scrypt$53b7dab4e46a01b1c3a2101174c2d623$c5043707401f2af457367ae71c368839dcb9e22632e450a71dca9be18bac25a73dce5c0177f91b352814cda7c7f30a11bb1fbdf19ee4e6111635b02f3fbd16b7",
          ADMIN_SESSION_SECRET: "e2e-session-secret",
        },
      },
});
