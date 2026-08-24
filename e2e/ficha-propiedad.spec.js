// Flujo 2 · Abrir la ficha de una propiedad.
// Incluye el chequeo de integridad de imágenes que pide el informe: no basta
// con que la página cargue, las fotos tienen que existir de verdad. Una ficha
// con la galería rota es peor que no tener la ficha.

import { test, expect, capturarErroresJS } from "./base.js";

// El sitio usa trailingSlash: true, asi que el menu tiene un enlace a
// "/propiedades/" que matchea cualquier selector por prefijo. Sin excluirlo,
// la "primera tarjeta" era el link del menu y el test navegaba al listado.
const TARJETA = 'a[href^="/propiedades/"]:not([href="/propiedades/"])';

async function abrirPrimeraFicha(page) {
  await page.goto("/propiedades");
  const primera = page.locator(TARJETA).first();
  await expect(primera).toBeVisible();
  const href = await primera.getAttribute("href");
  const respuesta = await page.goto(href);
  return { href, respuesta };
}

test.describe("Ficha de propiedad", () => {
  test("se abre desde el listado y responde 200", async ({ page }) => {
    const errores = capturarErroresJS(page);
    const { href, respuesta } = await abrirPrimeraFicha(page);

    expect(respuesta?.status(), `la ficha ${href} no respondió 200`).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    expect(errores, `errores de JS en ${href}:\n${errores.join("\n")}`).toEqual([]);
  });

  test("todas las imágenes visibles cargan de verdad", async ({ page }) => {
    const { href } = await abrirPrimeraFicha(page);

    // Espera a que el navegador termine de pedir las imágenes diferidas.
    await page.waitForLoadState("networkidle");

    const rotas = await page.evaluate(() =>
      Array.from(document.images)
        // Solo las que el navegador ya intentó cargar y están en pantalla.
        .filter((img) => img.getBoundingClientRect().width > 0)
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src)
    );

    expect(rotas, `imágenes rotas en ${href}:\n${rotas.join("\n")}`).toEqual([]);
  });

  test("toda imagen tiene alt (accesibilidad y SEO)", async ({ page }) => {
    await abrirPrimeraFicha(page);

    const sinAlt = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => img.getBoundingClientRect().width > 0)
        .filter((img) => !img.getAttribute("alt") && img.getAttribute("aria-hidden") !== "true")
        .map((img) => img.currentSrc || img.src)
    );

    expect(sinAlt, `imágenes sin alt:\n${sinAlt.join("\n")}`).toEqual([]);
  });

  test("un slug inexistente devuelve 404, no un error de servidor", async ({ page }) => {
    const respuesta = await page.goto("/propiedades/no-existe-este-slug-inventado", {
      waitUntil: "domcontentloaded",
    });
    expect(respuesta?.status()).toBe(404);
  });
});
