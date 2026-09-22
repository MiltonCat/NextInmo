import test from "node:test";
import assert from "node:assert/strict";
import { nextLuciaStep, operacionDeLaCharla, parseLuciaText, rutaDelTexto } from "../lib/luciaAdvisor.mjs";

test("después de pedir alquileres, '2 habitaciones' sigue en alquiler", () => {
  const charla = ["Quiero que me muestres alquileres", "de 2 habitaciones"];
  assert.equal(operacionDeLaCharla(charla), "alquiler");

  // Lo que hace ChatBot.handleText con esa frase desde welcome.
  const parsed = parseLuciaText("de 2 habitaciones", "welcome");
  // Desde el 22/09 esta frase va a la IA, que tiene el historial; si igual
  // cae en el árbol, el árbol tampoco pierde el alquiler.
  assert.equal(rutaDelTexto("de 2 habitaciones", "welcome", parsed), "ia");
  const merged = { operacion: operacionDeLaCharla(charla), ...parsed.filters };
  const paso = nextLuciaStep(merged, parsed.answered);
  assert.notEqual(paso, "ask_goal");
  assert.ok(paso.startsWith("ask_alq") || paso === "results_alquiler", paso);
});

test("si después dice comprar, no arrastra el alquiler", () => {
  assert.equal(operacionDeLaCharla(["mostrame alquileres", "mejor quiero comprar una casa"]), null);
});

test("sin operación en la charla no inventa una", () => {
  assert.equal(operacionDeLaCharla(["hola", "de 2 habitaciones"]), null);
});

test("solo mira los últimos mensajes", () => {
  assert.equal(operacionDeLaCharla(["alquileres", "a", "b", "c", "de 2 habitaciones"]), null);
});

test("dormitoriosDe: el campo manda, si falta se lee del texto", async () => {
  const { dormitoriosDe } = await import("../lib/luciaAdvisor.mjs");
  assert.equal(dormitoriosDe({ bedrooms: 2, title: "1 habitación" }), 2);
  assert.equal(dormitoriosDe({ bedrooms: null, title: "Departamento de 1 habitación en el centro" }), 1);
  assert.equal(dormitoriosDe({ title: "Monoambiente luminoso" }), 0);
  assert.equal(dormitoriosDe({ title: "Casa", description: "tres dormitorios y jardín" }), 3);
  assert.equal(dormitoriosDe({ title: "Depto 3 ambientes" }), 2);
  assert.equal(dormitoriosDe({ title: "Departamento premium en el centro. 80 mts2" }), null);
});
