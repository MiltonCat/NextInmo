import { test, expect, capturarErroresJS } from "./base.js";

// Ejecutar contra `next build && next start`: en dev useSearchParams no
// suspende y escondería la regresión que dejó el catálogo sin HTML inicial.
const tarjeta = 'a.group[href^="/propiedades/"]:has(h3)';

test.describe("Catálogo sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const ruta of ["/propiedades/", "/propiedades/casas/", "/propiedades/departamentos/", "/alquileres/"]) {
    test(`${ruta} entrega títulos, precios, fotos y enlaces`, async ({ page }) => {
      const respuesta = await page.goto(ruta);
      expect(respuesta.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      const primera = page.locator(tarjeta).first();
      await expect(primera).toBeVisible();
      await expect(primera.locator("h3")).not.toBeEmpty();
      await expect(primera).toContainText(ruta === "/alquileres/" ? "$" : "USD");
      await expect(primera.locator("img")).toHaveAttribute("src", /.+/);
      await expect(page.getByText("Cargando...", { exact: true })).toHaveCount(0);
    });
  }

  test("el servidor respeta el filtro de la URL", async ({ page }) => {
    await page.goto("/propiedades/?search=zzzz-no-existe-esta-propiedad-zzzz");
    await expect(page.locator(tarjeta)).toHaveCount(0);
    await expect(page.getByText("No se encontraron propiedades con los filtros seleccionados.")).toBeVisible();
  });
});

test("el catálogo hidratado permite buscar y limpiar", async ({ page }) => {
  const errores = capturarErroresJS(page);
  await page.goto("/propiedades/");
  const tarjetas = page.locator(tarjeta);
  await expect(tarjetas.first()).toBeVisible();
  const cantidad = await tarjetas.count();
  await page.getByPlaceholder("Buscar por nombre, ubicación o tipo...").fill("zzzz-no-existe-esta-propiedad-zzzz");
  await expect(tarjetas).toHaveCount(0);
  await page.getByRole("button", { name: "Limpiar filtros y ver todas" }).click();
  await expect(tarjetas).toHaveCount(cantidad);
  expect(errores).toEqual([]);
});
