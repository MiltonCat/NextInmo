// Comprueba el recorrido de venta sin crear contactos ni consumir servicios de IA.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errores = [];
  let lectura;
  page.on("pageerror", (e) => errores.push(e.message));
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/\/$/, "");
    if (path === "/api/clima") return route.fulfill({ json: { ok: false } });
    if (path === "/api/tasar/interpretar") {
      lectura = route.request().postDataJSON();
      return route.fulfill({ json: { ok: true, disponible: true, barrios: ["Centro"], datos: {} } });
    }
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto(`${process.env.LUCIA_TEST_URL || "http://localhost:3000"}/?lucia=prueba`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByRole("button", { name: "Abrir chat", exact: true }).click();
  const frase = "Tengo una propiedad de 120 m2 que quiero vender";
  await page.getByPlaceholder("Escribile a Lucía...").fill(frase);
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await page.getByLabel("Tu objetivo").waitFor();
  assert.equal(await page.getByLabel("Tu objetivo").inputValue(), "Quiero vender");
  assert.deepEqual(lectura.mensajes, [frase]);
  assert.equal(await page.getByLabel("¿Qué estás evaluando?").count(), 0);
  await page.getByRole("heading", { name: "¿Qué querés tasar?" }).waitFor();
  assert.deepEqual(errores, []);
  console.log("OK: la frase del propietario abre tasación y conserva Quiero vender; no entra en compra.");
} finally { await browser.close(); }
