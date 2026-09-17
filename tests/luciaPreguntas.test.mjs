import { register } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";

register("./luciaKnowledge-loader.mjs", import.meta.url);
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://prueba.invalid";
process.env.SUPABASE_SECRET_KEY = "prueba";
const { registrarPregunta } = await import("../lib/luciaPreguntas.js");

test("guarda pregunta, respuesta saneada y herramientas", async (t) => {
  let fila;
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    fila = JSON.parse(options.body);
    return new Response("", { status: 201 });
  });

  await registrarPregunta({
    pregunta: "¿Me escribís a ana@example.com o al 2944 123456?",
    respondida: true,
    respuesta: "Sí, escribinos al 2944 123456 o a ana@example.com para coordinar.",
    herramientas: ["buscar_propiedades"],
  });

  assert.equal(fila.pregunta, "¿Me escribís a [mail] o al [número]?");
  assert.equal(fila.respuesta, "Sí, escribinos al [número] o a [mail] para coordinar.");
  assert.deepEqual(fila.herramientas, ["buscar_propiedades"]);
});

test("no inventa respuesta cuando Lucía falla", async (t) => {
  let fila;
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    fila = JSON.parse(options.body);
    return new Response("", { status: 201 });
  });

  await registrarPregunta({ pregunta: "¿Qué tienen disponible?", respondida: false, error: "timeout" });
  assert.equal(fila.respuesta, null);
  assert.equal(fila.respondida, false);
});
