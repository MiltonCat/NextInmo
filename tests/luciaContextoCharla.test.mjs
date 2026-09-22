import test from "node:test";
import assert from "node:assert/strict";
import { nextLuciaStep, operacionDeLaCharla, parseLuciaText, rutaDelTexto } from "../lib/luciaAdvisor.mjs";

test("después de pedir alquileres, '2 habitaciones' sigue en alquiler", () => {
  const charla = ["Quiero que me muestres alquileres", "de 2 habitaciones"];
  assert.equal(operacionDeLaCharla(charla), "alquiler");

  // Lo que hace ChatBot.handleText con esa frase desde welcome.
  const parsed = parseLuciaText("de 2 habitaciones", "welcome");
  assert.equal(rutaDelTexto("de 2 habitaciones", "welcome", parsed), "guiado");
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
