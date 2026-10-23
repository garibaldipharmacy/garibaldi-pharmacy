import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Plain vitest, deliberately not @nuxt/test-utils. The unit suite covers pure
// logic (validation, file sniffing, encryption, rate limiting, persistence), none
// of which needs a Nuxt runtime. Browser behaviour is covered by Playwright
// against the real built server instead, which is a more honest test anyway.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/unit/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "~~": fileURLToPath(new URL("./", import.meta.url)),
      "~": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
