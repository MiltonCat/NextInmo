import { defineConfig, devices } from "@playwright/test";

// Suite end-to-end de los cinco flujos que no pueden romperse.
//
// Regla de oro: ningún test manda datos reales. Los formularios que escriben
// (consultas, tasador, emailjs) se interceptan con page.route y se responden
// con datos falsos. Los flujos que viajan por Server Actions —el login por
// código— NO se pueden interceptar desde el navegador, así que esos tests
// llegan hasta el botón y no lo aprietan. Ver e2e/README.md.

const PUERTO = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PUERTO}`;
const enCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",

  // Un test que tarda más de 45 s en un sitio de este tamaño está colgado,
  // no lento. El tasador real puede tardar (modelo dormido), pero en los
  // tests el tasador está mockeado.
  timeout: 45_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  // Nadie debe poder mergear un .only olvidado.
  forbidOnly: enCI,
  retries: enCI ? 2 : 0,
  workers: enCI ? 1 : undefined,

  reporter: enCI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],

  use: {
    baseURL: BASE_URL,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    // El sitio tiene layouts distintos en mobile (buscador y filtros duplicados).
    // Este proyecto corre solo el flujo de búsqueda para cubrir esa rama.
    {
      name: "mobile",
      testMatch: /buscar-propiedad\.spec\.js/,
      use: { ...devices["Pixel 7"] },
    },
  ],

  // En local reusa el `npm run dev` que ya tengas abierto: no te levanta
  // un segundo servidor ni te pisa el puerto.
  webServer: {
    command: enCI ? "npm run build && npm run start" : "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !enCI,
    timeout: 240_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
