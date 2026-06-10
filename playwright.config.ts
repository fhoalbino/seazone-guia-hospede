import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      // Ubuntu 26.04 (pré-release) não tem build empacotado do Playwright;
      // usamos o Chromium do sistema instalado em /usr/bin.
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: "/usr/bin/chromium-browser" },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
