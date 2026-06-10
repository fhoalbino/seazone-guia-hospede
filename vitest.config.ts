import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    environmentMatchGlobs: [["src/components/**/*.test.tsx", "jsdom"]],
    setupFiles: ["src/test/setup.ts"],
  },
});
