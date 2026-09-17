import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { validarDatosTasacion, pasoYaConfirmado } from "../lib/luciaDatosTasacion.mjs";
import { pideTasacion, objetivoTasacionDeclarado } from "../lib/luciaContexto.mjs";
register("./luciaKnowledge-loader.mjs", import.meta.url);
const { extraerDatosTasacion } = await import("../lib/luciaExtraerTasacion.js");

test("valida el borrador sin convertir ausencias en ceros ni aceptar barrios inventados", () => {
  assert.deepEqual(validarDatosTasacion({ tipo: "Casa", barrio: "Inventado", superficie: null, cocheras: 0, banos: "2", dormitorios: 2.5, ambientes: 500, valorTotal: 999 }, ["Centro"]), { tipo: "Casa", cocheras: 0 });
  assert.deepEqual(validarDatosTasacion({ tipo: "Departamento", superficieTerreno: 600, superficie: 120 }, []), { tipo: "Departamento", superficie: 120 });
});

test("solo saltea pasos confirmados completos, y siempre permite revisar extras", () => {
  assert.equal(pasoYaConfirmado("superficie", { superficieTerreno: 600 }), false);
  assert.equal(pasoYaConfirmado("superficie", { tipo: "Departamento", superficie: 120 }), true);
  assert.equal(pasoYaConfirmado("superficie", { tipo: "Casa", superficie: 120 }), false);
  assert.equal(pasoYaConfirmado("ambientes", { dormitorios: 2 }), false);
  assert.equal(pasoYaConfirmado("ambientes", { dormitorios: 2, banos: 1, ambientes: 3, cocheras: 0 }), true);
  assert.equal(pasoYaConfirmado("extras", {}), false);
});

test("abre la tasación al describir una vivienda propia sin capturar búsquedas o alquileres", () => {
  for (const texto of ["Tengo una casa de 120 m² en el Centro", "Mi departamento tiene 80 metros", "Tengo un depto de 50 m2"]) assert.equal(pideTasacion(texto), true, texto);
  for (const texto of ["Busco una casa de 120 m²", "Tengo una casa de 120 m² para alquilar", "No quiero tasar mi casa", "Tengo una casa y quiero saber sobre créditos"]) assert.equal(pideTasacion(texto), false, texto);
});

test("la venta de una propiedad no entra al recorrido de compra, incluso con errores de escritura", () => {
  for (const frase of ["tengo una propeidad de 120 m2 que quiero vender", "Tengo una propiedad de 120 m2 que quiero vender", "Hola, quiero vender mi casa", "Mi departamento es de 80 m² y lo quiero vender"]) {
    assert.equal(pideTasacion(frase), true, frase);
    assert.equal(objetivoTasacionDeclarado([frase]), "Quiero vender");
  }
  assert.equal(objetivoTasacionDeclarado(["quiero vender mi casa", "no quiero vender"]), "");
  assert.equal(objetivoTasacionDeclarado(["busco una propiedad para comprar"]), "");
});

test("la extracción pide estructura estricta, no guarda el pedido y valida la salida", async (t) => {
  const previo = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test";
  t.after(() => { if (previo === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previo; });
  t.mock.method(globalThis, "fetch", async (_, opciones) => {
    const body = JSON.parse(opciones.body);
    assert.equal(body.store, false);
    assert.equal(body.text.format.strict, true);
    assert.deepEqual(body.text.format.schema.properties.barrio.enum, ["Centro", null]);
    assert.deepEqual(JSON.parse(body.input).mensajes, ["Tengo una casa de 120 m²"]);
    return new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({ tipo: "Casa", superficie: 120, barrio: "Centro", cocheras: null }) }] }] }));
  });
  assert.deepEqual(await extraerDatosTasacion(["Tengo una casa de 120 m²"], ["Centro"]), { disponible: true, datos: { tipo: "Casa", superficie: 120, barrio: "Centro" } });
});

test("una caída del proveedor permite completar a mano", async (t) => {
  const previo = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test";
  t.after(() => { if (previo === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previo; });
  t.mock.method(globalThis, "fetch", async () => { throw new Error("timeout"); });
  assert.deepEqual(await extraerDatosTasacion(["tasar"], ["Centro"]), { datos: {}, disponible: false });
});
