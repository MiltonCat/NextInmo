// Flujo 4 · Completar el tasador.
// Es la herramienta que capta propietarios: cinco pantallas, y si una se traba
// se pierde el lead de mayor valor del sitio.
//
// SEGURIDAD: /api/tasar y /api/tasar/despertar están interceptados. Este test
// no llama al modelo real, no consume su cuota ni deja una tasación registrada.

import { test, expect, capturarErroresJS } from "./base.js";

// Respuesta del muro de correo. Es una respuesta REAL del backend (ver
// app/api/tasar/route.js), con la forma mínima que consume la UI: por eso el
// mock no se desincroniza cada vez que cambia el modelo.
const RESPUESTA_MURO = {
  ok: true,
  bloqueado: true,
  motivo: "email",
  contexto: { barrio: "Centro" },
};

async function mockearTasador(page, respuesta = RESPUESTA_MURO, status = 200) {
  const llamadas = [];

  await page.route("**/api/tasar/despertar", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' })
  );

  await page.route("**/api/tasar", async (route) => {
    if (route.request().method() === "POST") {
      llamadas.push(route.request().postDataJSON());
      return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(respuesta),
      });
    }
    return route.fallback();
  });

  return llamadas;
}

// Recorre los cinco pasos con datos válidos y deja el wizard listo para
// apretar "Ver el valor".
async function completarWizard(page) {
  await page.goto("/tasacion");

  // Paso 1 · Tipo (avanza solo al elegir)
  await expect(page.getByText("Paso 1 de 5")).toBeVisible();
  await page.getByRole("button", { name: /^Casa/ }).click();

  // Paso 2 · Barrio. Se elige la primera opción real de la lista en vez de
  // hardcodear un nombre: los barrios vienen de una API externa y cambian.
  await expect(page.getByText("Paso 2 de 5")).toBeVisible();
  const opciones = page.getByRole("option");
  await expect(opciones.first()).toBeVisible();
  await opciones.first().click();
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();

  // Paso 3 · Superficie
  await expect(page.getByText("Paso 3 de 5")).toBeVisible();
  await page.getByPlaceholder("120").fill("120");
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();

  // Paso 4 · Distribución (tiene valores por defecto válidos)
  await expect(page.getByText("Paso 4 de 5")).toBeVisible();
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();

  // Paso 5 · Extras (ninguno es obligatorio)
  await expect(page.getByText("Paso 5 de 5")).toBeVisible();
}

test.describe("Tasador", () => {
  test("los cinco pasos se completan y se llama al modelo con los datos correctos", async ({ page }) => {
    const errores = capturarErroresJS(page);
    const llamadas = await mockearTasador(page);

    await completarWizard(page);
    await page.getByRole("button", { name: "Ver el valor", exact: true }).click();

    await expect(page.getByText("Tu tasación está lista")).toBeVisible();

    expect(llamadas, "el wizard no llamó a /api/tasar").toHaveLength(1);
    expect(llamadas[0]).toMatchObject({ tipo: "Casa" });
    expect(String(llamadas[0].superficie ?? llamadas[0].superficie_cubierta)).toContain("120");

    expect(errores, `errores de JS en el tasador:\n${errores.join("\n")}`).toEqual([]);
  });

  test("no se puede avanzar sin completar el paso", async ({ page }) => {
    await mockearTasador(page);
    await page.goto("/tasacion");

    await page.getByRole("button", { name: /^Casa/ }).click();
    await expect(page.getByText("Paso 2 de 5")).toBeVisible();

    // Sin barrio elegido, "Siguiente" tiene que estar deshabilitado.
    await expect(page.getByRole("button", { name: "Siguiente", exact: true })).toBeDisabled();
  });

  test("si el modelo falla, se muestra un error y no una pantalla en blanco", async ({ page }) => {
    // Este es el riesgo que marca el informe: degradación silenciosa.
    await mockearTasador(page, { ok: false, error: "modelo_caido" }, 502);

    await completarWizard(page);
    await page.getByRole("button", { name: "Ver el valor", exact: true }).click();

    // Next deja siempre en el DOM un <div role="alert"> vacío (el anunciador de
    // rutas), así que el alert se busca por su texto. Además de desambiguar,
    // verifica que el mensaje sea el del error que devolvió el modelo y no otro
    // cualquiera.
    await expect(
      page.getByRole("alert").filter({ hasText: "El modelo no está respondiendo" })
    ).toBeVisible();
    // El botón vuelve a estar disponible: la persona puede reintentar.
    await expect(page.getByRole("button", { name: "Ver el valor", exact: true })).toBeEnabled();
  });
});
