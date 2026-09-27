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

test("guarda el id de la charla cuando es un UUID válido", async (t) => {
  let fila;
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    fila = JSON.parse(options.body);
    return new Response("", { status: 201 });
  });

  await registrarPregunta({
    pregunta: "¿Tienen lotes en Vega Maipú?",
    ruta: "guiado",
    conversacionId: "3F2B9C4E-1A2B-4C3D-8E9F-0A1B2C3D4E5F",
  });

  assert.equal(fila.conversacion_id, "3f2b9c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f");
});

test("sin id válido la frase se guarda como antes, sin la columna", async (t) => {
  const filas = [];
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    filas.push(JSON.parse(options.body));
    return new Response("", { status: 201 });
  });

  await registrarPregunta({ pregunta: "hola", ruta: "guiado" });
  await registrarPregunta({ pregunta: "hola", ruta: "guiado", conversacionId: "'; drop table x; --" });
  await registrarPregunta({ pregunta: "hola", ruta: "guiado", conversacionId: { id: 1 } });

  assert.equal(filas.length, 3);
  for (const fila of filas) assert.equal("conversacion_id" in fila, false);
});

test("si la migración no corrió todavía, guarda la pregunta sin el id", async (t) => {
  const filas = [];
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    const fila = JSON.parse(options.body);
    filas.push(fila);
    if ("conversacion_id" in fila) {
      return new Response(
        JSON.stringify({ message: "Could not find the 'conversacion_id' column of 'lucia_preguntas' in the schema cache" }),
        { status: 400 }
      );
    }
    return new Response("", { status: 201 });
  });

  await registrarPregunta({
    pregunta: "¿Cuánto vale un lote en Junín?",
    ruta: "guiado",
    conversacionId: "3f2b9c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
  });

  assert.equal(filas.length, 2);
  assert.equal("conversacion_id" in filas[1], false);
  assert.equal(filas[1].pregunta, "¿Cuánto vale un lote en Junín?");
});

test("un error que no es por la columna no se reintenta", async (t) => {
  let llamadas = 0;
  t.mock.method(globalThis, "fetch", async () => {
    llamadas += 1;
    return new Response(JSON.stringify({ message: "permission denied" }), { status: 401 });
  });
  t.mock.method(console, "error", () => {});

  await registrarPregunta({
    pregunta: "hola",
    ruta: "guiado",
    conversacionId: "3f2b9c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
  });

  assert.equal(llamadas, 1);
});
