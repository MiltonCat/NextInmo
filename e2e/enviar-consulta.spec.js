// Flujo 3 · Enviar una consulta desde /contacto.
// Es el flujo que produce plata. Una consulta perdida no se recupera, así que
// acá se testea tanto el camino feliz como que la validación no descarte a
// nadie en silencio.
//
// SEGURIDAD: /api/consultas y EmailJS están interceptados. Este test nunca
// escribe un lead real ni manda un correo.

import { test, expect } from "./base.js";

const MENSAJE = "Hola, me interesa una propiedad en el centro para invertir.";

// Registra el mock de /api/consultas y devuelve el array donde se acumulan
// los payloads recibidos, para poder afirmar QUÉ se mandó y no solo que se mandó.
async function interceptarConsultas(page) {
  const enviados = [];
  await page.route("**/api/consultas", async (route) => {
    if (route.request().method() === "POST") {
      enviados.push(route.request().postDataJSON());
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    }
    return route.fallback();
  });
  return enviados;
}

test.describe("Enviar consulta", () => {
  test("el formulario vacío no se envía y explica por qué", async ({ page }) => {
    const enviados = await interceptarConsultas(page);
    await page.goto("/contacto");

    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    await expect(page.getByText("El mensaje es requerido")).toBeVisible();
    expect(enviados, "no debe registrarse ningún lead con el formulario vacío").toHaveLength(0);
  });

  test("un mensaje demasiado corto se rechaza con un motivo visible", async ({ page }) => {
    await page.goto("/contacto");

    await page.getByPlaceholder("Tu nombre").fill("Milton Prueba");
    await page.getByPlaceholder("tu@email.com").fill("prueba@ejemplo.com");
    await page.getByPlaceholder(/Contame tu objetivo/).fill("hola");

    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    await expect(page.getByText("El mensaje debe tener al menos 10 caracteres")).toBeVisible();
  });

  test("una consulta válida se registra en el CRM y confirma en pantalla", async ({ page }) => {
    const enviados = await interceptarConsultas(page);
    await page.goto("/contacto");

    await page.getByPlaceholder("Tu nombre").fill("Milton Prueba");
    await page.getByPlaceholder("tu@email.com").fill("prueba@ejemplo.com");
    await page.getByPlaceholder("+54 294 ...").fill("+54 9 2972 000000");
    await page.getByPlaceholder(/Contame tu objetivo/).fill(MENSAJE);

    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    // 1) La persona ve que salió.
    await expect(page.getByText("¡Mensaje enviado!")).toBeVisible();

    // 2) El lead quedó registrado. Esto es lo que el informe llama
    //    "fire-and-forget": si falla el correo, el lead no se pierde igual.
    expect(enviados, "la consulta no llegó a /api/consultas").toHaveLength(1);
    expect(enviados[0]).toMatchObject({
      tipo: "contacto",
      nombre: "Milton Prueba",
      email: "prueba@ejemplo.com",
      mensaje: MENSAJE,
    });
  });

  test("si el CRM se cae, la consulta igual se confirma al visitante", async ({ page }) => {
    // El lead se registra fire-and-forget: un 500 del CRM no debe dejar a la
    // persona mirando un botón que no hace nada.
    await page.route("**/api/consultas", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: "{}" })
    );

    await page.goto("/contacto");
    await page.getByPlaceholder("Tu nombre").fill("Milton Prueba");
    await page.getByPlaceholder("tu@email.com").fill("prueba@ejemplo.com");
    await page.getByPlaceholder(/Contame tu objetivo/).fill(MENSAJE);
    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    await expect(page.getByText("¡Mensaje enviado!")).toBeVisible();
  });
});
