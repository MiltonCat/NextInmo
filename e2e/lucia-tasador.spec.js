import { test, expect, capturarErroresJS } from "./base.js";

for (const mobile of [false, true]) {
  test(`Lucía tasa y conserva el resultado en la conversación (${mobile ? "mobile" : "desktop"})`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    const errores = capturarErroresJS(page);
    let tasacion;
    let consulta;
    await page.route("**/api/tasar/barrios", (route) => route.fulfill({ json: { barrios: ["Centro"] } }));
    await page.route("**/api/tasar/despertar", (route) => route.fulfill({ json: { despierto: true } }));
    await page.route("**/api/tasar", (route) => {
      tasacion = route.request().postDataJSON();
      return route.fulfill({ json: { ok: true, bloqueado: false, libresRestantes: 0, contexto: {}, resultado: { valorTotal: 240000, valorM2: 2400, rangoMin: 200000, rangoMax: 280000, errorPromedioPct: 0.16, advertencias: [] } } });
    });
    await page.route("**/api/lucia/", (route) => {
      consulta = route.request().postDataJSON();
      return route.fulfill({ json: { ok: true, answer: "La estimación es orientativa y se compara con el precio pedido.", sources: [{ title: "Tasador online", href: "/tasacion/", detail: "Rango estimado" }], answerId: "prueba" } });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir chat" }).click();
    const panel = page.locator(".lucia-panel");
    await panel.getByLabel("Mensaje para Lucía").fill("Quiero tasar mi casa");
    await panel.getByRole("button", { name: "Enviar", exact: true }).click();
    await panel.getByRole("button", { name: "Casa Con terreno propio" }).click();
    await panel.getByRole("option", { name: /Centro/ }).click();
    await panel.getByRole("button", { name: "Siguiente" }).click();
    await panel.getByLabel("Superficie cubierta", { exact: true }).fill("100");
    await panel.getByRole("button", { name: "Siguiente" }).click();
    await panel.getByRole("button", { name: "Siguiente" }).click();
    await panel.getByRole("button", { name: "Ver el valor" }).click();
    await expect(panel.getByText(/Tasación orientativa de Casa en Centro/)).toBeVisible();
    expect(tasacion).toMatchObject({ tipo: "Casa", barrio: "Centro", superficie: 100 });
    expect(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await panel.screenshot({ path: `test-results/lucia-tasador-${mobile ? "mobile" : "desktop"}.png` });
    await panel.getByLabel("Mensaje para Lucía").fill("¿Y cómo interpreto ese rango para invertir?");
    await panel.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect(panel.getByText("La estimación es orientativa y se compara con el precio pedido.")).toBeVisible();
    expect(consulta.history.some((item) => item.content.includes("240.000"))).toBe(true);
    await expect(panel.getByRole("link", { name: /Tasador online/ })).toBeVisible();
    expect(errores).toEqual([]);
  });
}

test("el tasador en Lucía permite reintentar si no carga los barrios", async ({ page }) => {
  let recuperado = false;
  await page.route("**/api/tasar/barrios", (route) => route.fulfill(!recuperado
    ? { status: 503, json: {} } : { json: { barrios: ["Centro"] } }));
  await page.route("**/api/tasar/despertar", (route) => route.fulfill({ json: { despierto: false } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const panel = page.locator(".lucia-panel");
  await panel.getByLabel("Mensaje para Lucía").fill("Tasame mi departamento");
  await panel.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("No pude cargar los barrios");
  recuperado = true;
  await panel.getByRole("button", { name: "Reintentar" }).click();
  await expect(panel.getByRole("button", { name: "Departamento En edificio o complejo" })).toBeVisible();
});

test("la página de inversiones carga con los datos compartidos con Lucía", async ({ page }) => {
  const errores = capturarErroresJS(page);
  await page.goto("/inversiones/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("body")).toContainText("Conservador");
  expect(errores).toEqual([]);
});
