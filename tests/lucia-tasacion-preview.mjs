// Recorrido con servicios simulados: no envía consultas, contactos ni pedidos a la IA.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errores = [];
  const consultas = [];
  page.on("pageerror", (e) => errores.push(e.message));
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/\/$/, "");
    if (path === "/api/clima") return route.fulfill({ json: { ok: false } });
    if (path === "/api/lucia") {
      consultas.push(route.request().postDataJSON());
      if (consultas.length === 3) return route.fulfill({ status: 503, json: { ok: false } });
      return route.fulfill({ json: { ok: true, answer: consultas.length === 1
        ? "Tu estimación tiene un rango de USD 265.000 a USD 360.000. Para pensar la venta, falta revisar el estado de la casa. ¿Hiciste refacciones?"
        : "La cocina renovada queda anotada para la revisión con Milton; no modifica por sí sola el cálculo.", sources: [], answerId: "prueba" } });
    }
    if (path === "/api/tasar/barrios") return route.fulfill({ json: { barrios: ["Centro", "Chacra 4"] } });
    if (path === "/api/tasar") return route.fulfill({ json: { ok: true, resultado: {
      valorTotal: 312480, valorM2: 2604, rangoMin: 265000, rangoMax: 360000,
      errorPromedioPct: 0.161, nEntrenamiento: 512, advertencias: [],
    }, contexto: { medianaBarrio: 2200, nBarrio: 87 } } });
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("http://localhost:3000/?lucia=prueba", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByRole("button", { name: "Abrir chat", exact: true }).click();
  const enviar = async (texto) => {
    await page.getByPlaceholder("Escribile a Lucía...").fill(texto);
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
  };
  await enviar("Quiero tasar mi propiedad");
  await page.getByLabel("¿Qué estás evaluando?").selectOption("Quiero vender");
  await page.getByLabel("¿Para cuándo lo pensás?").selectOption("En los próximos 3 meses");
  await page.getByRole("button", { name: /^Casa/ }).click();
  await page.getByRole("option", { name: /Centro/ }).click();
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByLabel("Superficie cubierta", { exact: true }).fill("120");
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByRole("button", { name: "Ver el valor", exact: true }).click();
  await page.getByText(/Tu estimación tiene un rango/).waitFor();
  assert.equal(consultas.length, 1);
  assert.equal(consultas[0].tasacion.objetivo, "Quiero vender");
  assert.equal(consultas[0].tasacion.plazo, "En los próximos 3 meses");
  assert.equal(await page.getByText("Ayudame a interpretar mi tasación según mi objetivo.", { exact: true }).count(), 0);
  assert.equal(await page.getByText(/avise cuando aparezca una propiedad/).count(), 0);
  await enviar("Renové la cocina hace dos años");
  await page.getByText(/La cocina renovada queda anotada/).waitFor();
  assert.equal(consultas.length, 2);
  assert.equal(consultas[1].tasacion.valorTotal, 312480);
  await enviar("¿Qué significa el rango?");
  await page.getByText(/La explicación no salió esta vez/).waitFor();
  await page.getByRole("button", { name: "Entender el rango", exact: true }).click();
  await page.getByRole("button", { name: "Revisar con Milton", exact: true }).waitFor();
  assert.equal(consultas.length, 4);
  await page.screenshot({ path: join(tmpdir(), "lucia-tasacion-conversacion.png") });
  await page.getByRole("button", { name: "Revisar con Milton", exact: true }).click();
  const borrador = page.getByRole("textbox", { name: "Tu mensaje para Milton" });
  await borrador.waitFor();
  const texto = await borrador.inputValue();
  assert.match(texto, /265.000.*360.000/);
  assert.match(texto, /Renové la cocina/);
  assert.match(texto, /Quiero vender/);
  await page.getByRole("button", { name: "Detener", exact: true }).waitFor({ state: "hidden" });
  assert.equal(await page.getByText("Ajustar mi búsqueda", { exact: true }).count(), 0);
  await borrador.scrollIntoViewIfNeeded();
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const caja = await page.locator(".lucia-panel").boundingBox();
    assert(caja.x >= 0 && caja.x + caja.width <= width);
    await page.screenshot({ path: join(tmpdir(), `lucia-tasacion-${width}.png`) });
  }
  assert.deepEqual(errores, []);
  console.log("OK: tasación, interpretación automática, continuación, recuperación de error, resumen editable y vista móvil/desktop.");
} finally { await browser.close(); }
