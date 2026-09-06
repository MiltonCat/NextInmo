// Verificación local con respuestas simuladas: no consume IA ni registra consultas.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/lucia/", async (route) => {
    await route.fulfill({ contentType: "application/x-ndjson", body: [
      { type: "status", text: "Consultando información de la web" },
      { type: "delta", text: "San Martín tiene zonas con características diferentes." },
      { type: "done", ok: true, answer: "San Martín tiene zonas con características diferentes.", answerId: "test", sources: [{ title: "Barrios de San Martín", href: "/barrios/", detail: "Conocé las zonas" }] },
    ].map((event) => JSON.stringify(event)).join("\n") });
  });
  await page.route("**/api/lucia-frase/**", (route) => route.fulfill({ json: { ok: true } }));
  await page.route("**/api/clima/**", (route) => route.fulfill({ json: { ok: false } }));
  await page.goto("http://localhost:3000/?lucia=prueba", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByRole("button", { name: "Abrir chat", exact: true }).click();
  await page.getByPlaceholder("Escribile a Lucía...").fill("¿Cómo son los barrios?");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await page.getByText("San Martín tiene zonas con características diferentes.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Comparar las zonas", exact: true }).waitFor();
  await page.getByRole("button", { name: "Ampliar chat" }).click();
  const bounds = await page.locator(".lucia-panel").boundingBox();
  assert(bounds.x >= 0 && bounds.x + bounds.width <= 390);
  await page.getByRole("button", { name: "Hablar con Milton", exact: true }).click();
  const draft = page.getByRole("textbox", { name: "Tu mensaje para Milton" });
  await draft.fill("Hola Milton, quiero coordinar una consulta.");
  assert((await page.getByRole("link", { name: "Abrir WhatsApp", exact: true }).getAttribute("href")).includes(encodeURIComponent("Hola Milton, quiero coordinar una consulta.")));
  await page.screenshot({ path: join(tmpdir(), "lucia-mobile-check.png") });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: join(tmpdir(), "lucia-desktop-check.png") });
  assert.deepEqual(errors, []);
  console.log("OK: streaming, fuentes, sugerencias, ampliación móvil y resumen editable; sin errores de React.");
} finally { await browser.close(); }
