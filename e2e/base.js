// Base común de todos los tests.
//
// Extiende `page` con una red de seguridad: aunque un test se olvide de
// mockear algo, los servicios que MANDAN COSAS AL MUNDO quedan cortados.
// Es la diferencia entre una suite que se puede correr cien veces por día y
// una que te llena el CRM de leads falsos y te quema la cuota de EmailJS.

import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    // Cualquier POST del navegador a la API propia queda bloqueado por
    // defecto. Un test que necesite uno lo declara con page.route ANTES
    // (la última ruta registrada gana en Playwright), y así el permiso
    // queda explícito en el test que lo usa.
    await page.route("**/api/**", async (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, error: "bloqueado_por_el_test" }),
        });
      }
      return route.fallback();
    });

    // EmailJS va DESPUES a proposito: en Playwright gana la ultima ruta
    // registrada, y su URL (api.emailjs.com/api/v1.0/...) tambien matchea el
    // patron de arriba. Registrarlo antes hacia que el bloqueo lo tapara y el
    // formulario de contacto terminara siempre en estado de error.
    await page.route("**/api.emailjs.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/plain", body: "OK" })
    );

    await use(page);
  },
});

export { expect };

// Junta las excepciones no capturadas de la página. Una pantalla que se ve
// bien pero tiró un error de JS está rota igual: el botón siguiente no anda.
export function capturarErroresJS(page) {
  const errores = [];
  page.on("pageerror", (e) => errores.push(String(e)));
  return errores;
}
