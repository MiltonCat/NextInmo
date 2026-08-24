// Flujo 1 · Buscar una propiedad.
// Si esto se rompe, la web deja de ser un catálogo. Es el flujo que más
// visitas recibe y el que alimenta a todos los demás.

import { test, expect, capturarErroresJS } from "./base.js";

// El sitio usa trailingSlash: true, asi que el menu tiene un enlace a
// "/propiedades/" que matchea cualquier selector por prefijo. Sin excluirlo,
// la "primera tarjeta" era el link del menu y el test navegaba al listado.
const TARJETA = 'a[href^="/propiedades/"]:not([href="/propiedades/"])';

const BUSCADOR_ESCRITORIO = "Buscar por nombre, ubicación o tipo...";
const BUSCADOR_MOBILE = "Buscar por barrio, tipo o nombre...";

// El layout duplica el buscador: uno para mobile y otro para escritorio,
// cada uno oculto por CSS en el otro tamaño. El test usa el que corresponde
// al viewport en vez de asumir uno, para que el proyecto "mobile" pase igual.
function buscador(page, esMobile) {
  return page.getByPlaceholder(esMobile ? BUSCADOR_MOBILE : BUSCADOR_ESCRITORIO);
}

test.describe("Buscar propiedad", () => {
  test("el listado carga con propiedades y sin errores de JS", async ({ page }) => {
    const errores = capturarErroresJS(page);

    const respuesta = await page.goto("/propiedades");
    expect(respuesta?.status(), "la ruta /propiedades debe responder 200").toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const tarjetas = page.locator(TARJETA);
    await expect(
      tarjetas.first(),
      "no se renderizó ninguna tarjeta: revisá Supabase o el fallback de getProperties()"
    ).toBeVisible();

    expect(await tarjetas.count()).toBeGreaterThan(0);
    expect(errores, `errores de JS en el listado:\n${errores.join("\n")}`).toEqual([]);
  });

  test("una búsqueda sin coincidencias avisa y se puede limpiar", async ({ page }, testInfo) => {
    const esMobile = testInfo.project.name === "mobile";
    await page.goto("/propiedades");

    const cantidadInicial = await page.locator(TARJETA).count();
    expect(cantidadInicial).toBeGreaterThan(0);

    await buscador(page, esMobile).fill("zzzz-no-existe-esta-propiedad-zzzz");

    // El mensaje de cero resultados es parte del producto, no un detalle:
    // es donde el informe propone ofrecer alternativas más adelante.
    await expect(
      page.getByText("No se encontraron propiedades con los filtros seleccionados.")
    ).toBeVisible();

    await page.getByRole("button", { name: "Limpiar filtros y ver todas" }).click();

    await expect(page.locator(TARJETA)).toHaveCount(cantidadInicial);
  });

  test("una búsqueda con coincidencias filtra y muestra el contador", async ({ page }, testInfo) => {
    const esMobile = testInfo.project.name === "mobile";
    await page.goto("/propiedades");

    const primera = page.locator(TARJETA).first();
    const titulo = (await primera.locator("h3").first().innerText()).trim();
    // Una palabra larga del título real: evita hardcodear inventario, que cambia.
    const termino = titulo.split(/\s+/).filter((p) => p.length > 4)[0] || titulo;

    await buscador(page, esMobile).fill(termino);

    await expect(page.getByText(`para “${termino}”`)).toBeVisible();
    await expect(page.locator(TARJETA).first()).toBeVisible();
  });

  test("los tabs de modalidad cambian el listado", async ({ page }) => {
    await page.goto("/propiedades");

    // "Alquiler permanente" en escritorio, "Alquilar" en mobile.
    const tabAlquiler = page
      .getByRole("button", { name: /^(Alquiler permanente|Alquilar)$/ })
      .first();
    await tabAlquiler.click();

    // No afirmamos que haya inventario de alquiler: afirmamos que la página
    // no se rompe y resuelve a un estado legible (tarjetas o mensaje vacío).
    await expect(
      page
        .locator(TARJETA)
        .first()
        .or(page.getByText("No se encontraron propiedades con los filtros seleccionados."))
    ).toBeVisible();
  });
});
