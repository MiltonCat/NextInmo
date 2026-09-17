import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errores = [];
  const tasaciones = [];
  let lectura;
  page.on("pageerror", (e) => errores.push(e.message));
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/\/$/, "");
    if (path === "/api/clima") return route.fulfill({ json: { ok: false } });
    if (path === "/api/tasar/interpretar") {
      lectura = route.request().postDataJSON();
      return route.fulfill({ json: { ok: true, disponible: true, barrios: ["Centro", "Chacra 4"], datos: { tipo: "Casa", barrio: "Centro", superficie: 120, dormitorios: 3 } } });
    }
    if (path === "/api/tasar") {
      tasaciones.push(route.request().postDataJSON());
      return route.fulfill({ json: { ok: false, error: "modelo_caido" } });
    }
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("http://localhost:3000/?lucia=prueba", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByRole("button", { name: "Abrir chat", exact: true }).click();
  const frase = "Tengo una casa de 120 m² en el Centro, con 3 dormitorios";
  await page.getByPlaceholder("Escribile a Lucía...").fill(frase);
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await page.getByText("Tomé estos datos de lo que me contaste. ¿Están bien?").waitFor();
  assert.deepEqual(lectura.mensajes, [frase]);
  assert.equal(tasaciones.length, 0);
  assert.equal(await page.getByLabel("Dormitorios", { exact: true }).inputValue(), "3");
  await page.getByLabel("Superficie cubierta (m²)", { exact: true }).fill("130");
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const caja = await page.locator(".lucia-panel").boundingBox();
    assert(caja.x >= 0 && caja.x + caja.width <= width);
    await page.screenshot({ path: join(tmpdir(), `lucia-precarga-${width}.png`) });
  }
  await page.getByRole("button", { name: "Confirmar y continuar" }).click();
  await page.getByRole("heading", { name: "¿Cuántos metros tiene el terreno?" }).waitFor();
  assert.equal(await page.getByLabel("Superficie cubierta", { exact: true }).count(), 0);
  await page.getByLabel("Superficie del terreno", { exact: true }).fill("600");
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByRole("heading", { name: "¿Cómo está distribuida?" }).waitFor();
  assert.equal(await page.getByRole("button", { name: /Sumar uno a Dormitorios/ }).count(), 0);
  assert.equal(await page.getByRole("heading", { name: "¿Cuántos metros tiene?" }).count(), 0);
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByRole("button", { name: "Ver el valor", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: /modelo no está respondiendo/ }).waitFor();
  assert.equal(tasaciones.length, 1);
  assert.equal(tasaciones[0].superficie, 130);
  assert.equal(tasaciones[0].dormitorios, 3);
  assert.equal(tasaciones[0].barrio, "Centro");
  assert.equal(tasaciones[0].tipo, "Casa");
  assert.deepEqual(errores, []);
  console.log("OK: reconoce la descripción, confirma y corrige datos, omite pasos conocidos y consulta con los datos confirmados.");
} finally { await browser.close(); }
