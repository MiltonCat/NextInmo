// Flujo 5 · Acceso a la cuenta.
//
// IMPORTANTE — por qué este test NO aprieta "Enviarme un código":
// el login es passwordless y corre por Server Action (signInAccount), que se
// ejecuta en el servidor. page.route() solo intercepta pedidos del navegador,
// así que NO hay forma de mockearlo desde acá: apretar ese botón mandaría un
// correo real de Supabase en cada corrida y quemaría la cuota.
//
// Lo que sí se testea, que es lo que realmente puede romperse sin que nadie
// se entere: que la puerta esté cerrada. Un guard de sesión que falla expone
// el panel del cliente y el admin; eso no lo detecta ni el lint ni el build.

import { test, expect, capturarErroresJS } from "./base.js";

test.describe("Cuenta y login", () => {
  test("la pantalla de login se ve completa", async ({ page }) => {
    const errores = capturarErroresJS(page);
    const respuesta = await page.goto("/cuenta/login");

    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Mi cuenta" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviarme un código" })).toBeEnabled();
    await expect(page.getByRole("link", { name: /Crear una cuenta de comprador/ })).toBeVisible();

    expect(errores, `errores de JS en el login:\n${errores.join("\n")}`).toEqual([]);
  });

  test("el campo de email es obligatorio y valida el formato", async ({ page }) => {
    await page.goto("/cuenta/login");
    const email = page.getByLabel("Email");

    await expect(email).toHaveAttribute("required", "");
    await expect(email).toHaveAttribute("type", "email");

    // Validación nativa del navegador: con un valor inválido el form no envía.
    await email.fill("no-es-un-email");
    const valido = await email.evaluate((el) => el.checkValidity());
    expect(valido, "el navegador debería rechazar un email mal formado").toBe(false);
  });

  test("sin sesión, /cuenta redirige al login y no filtra datos", async ({ page }) => {
    await page.goto("/cuenta");

    await expect(page).toHaveURL(/\/cuenta\/login/);
    await expect(page.getByRole("heading", { name: "Mi cuenta" })).toBeVisible();
  });

  test("sin sesión, /admin no muestra el panel", async ({ page }) => {
    await page.goto("/admin");

    // No fijamos a qué URL redirige (puede cambiar): fijamos que el panel
    // NO se vea. Eso es lo que importa.
    await expect(page.getByRole("heading", { name: "Panel de propiedades" })).toHaveCount(0);
  });

  test("la cuenta no se indexa en buscadores", async ({ page }) => {
    await page.goto("/cuenta/login");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });
});
