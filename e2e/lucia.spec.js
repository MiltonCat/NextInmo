import { test, expect, capturarErroresJS } from "./base.js";

test("Lucía califica, recomienda hasta tres opciones y las compara", async ({ page }) => {
  const erroresJS = capturarErroresJS(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Abrir chat" }).click();
  await page.getByRole("button", { name: "Estoy buscando para comprar" }).click();
  await page.getByRole("button", { name: "Estoy explorando opciones" }).click();
  await page.getByRole("button", { name: "Todavía no lo tengo claro" }).click();
  await page.getByRole("button", { name: "Prefiero no definirlo todavía" }).click();
  await page.getByRole("button", { name: "No es decisivo" }).click();
  await page.getByRole("button", { name: "No tengo otra prioridad" }).click();

  const panel = page.locator(".lucia-panel");
  const cards = panel.locator("[data-lucia-property]");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeLessThanOrEqual(3);
  await expect(cards.first().locator("li").first()).toBeVisible();

  await expect(page.getByLabel("Comparación de propiedades")).toBeVisible();
  expect(erroresJS).toEqual([]);
});

test("Lucía entiende una búsqueda escrita", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir chat" }).click();

  await page.getByLabel("Mensaje para Lucía").fill(
    "Busco una casa para vivir de 2 dormitorios hasta USD 400.000 con jardín"
  );
  await page.getByRole("button", { name: "Enviar" }).click();

  const cards = page.locator(".lucia-panel [data-lucia-property]");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeLessThanOrEqual(3);
  await expect(page.getByLabel("Comparación de propiedades")).toBeVisible();
});

test("Lucía responde preguntas libres con conocimiento del sitio", async ({ page }) => {
  let payload;
  await page.route("**/api/lucia/", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        answer: "Los gastos dependen de cada operación y conviene confirmarlos antes de reservar.",
        answerId: "123e4567-e89b-42d3-a456-426614174000",
        model: "gpt-5.6-luna",
        sources: [{ title: "Centro de ayuda", href: "/centro-ayuda/", detail: "Proceso de compra y documentación." }],
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Abrir chat" }).click();
  await page.getByLabel("Mensaje para Lucía").fill("¿Qué gastos tiene comprar una propiedad?");
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(page.getByText("Los gastos dependen de cada operación y conviene confirmarlos antes de reservar.")).toBeVisible();
  await expect(page.locator(".lucia-panel").getByRole("link", { name: /Centro de ayuda/ })).toBeVisible();
  expect(payload.question).toBe("¿Qué gastos tiene comprar una propiedad?");
});

test("La portada abre Lucía, envía la pregunta y permite valorar la respuesta", async ({ page }) => {
  let questionPayload;
  let feedbackPayload;

  await page.route("**/api/lucia/", async (route) => {
    questionPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        answer: "Para vivir, conviene comparar acceso, servicios y distancia al centro.",
        answerId: "123e4567-e89b-42d3-a456-426614174001",
        model: "gpt-5.6-luna",
        sources: [],
      }),
    });
  });
  await page.route("**/api/lucia-feedback/", async (route) => {
    feedbackPayload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });

  await page.goto("/");
  await page.getByLabel("Pregunta para Lucía").fill("¿Qué barrio me conviene para vivir?");
  await page.getByRole("button", { name: "Preguntar", exact: true }).click();

  await expect(page.locator(".lucia-panel")).toBeVisible();
  await expect(page.getByText("Para vivir, conviene comparar acceso, servicios y distancia al centro.")).toBeVisible();
  expect(questionPayload.question).toBe("¿Qué barrio me conviene para vivir?");

  await page.getByRole("button", { name: "La respuesta fue útil" }).click();
  await expect(page.getByText("Gracias, esto nos ayuda a mejorar a Lucía.")).toBeVisible();
  expect(feedbackPayload).toMatchObject({
    answerId: "123e4567-e89b-42d3-a456-426614174001",
    rating: 1,
    model: "gpt-5.6-luna",
  });
  expect(feedbackPayload).not.toHaveProperty("question");
  expect(feedbackPayload).not.toHaveProperty("answer");
});
