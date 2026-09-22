import { register } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";
register("./luciaKnowledge-loader.mjs", import.meta.url);

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://prueba.invalid";
process.env.SUPABASE_SECRET_KEY = "prueba";
const { askOpenAILucia } = await import("../lib/luciaOpenAI.js");

const PROPIEDADES = [
  { id: 1, title: "Departamento en alquiler permanente", type: "Departamento", modalidad: "alquiler_permanente", location: "Centro", barrio: "Centro", precioAlquilerARS: 650000, bedrooms: 2, area: 65, status: "disponible", alquilada: false, sort_order: 1 },
];

// Primera vuelta: el modelo pide la herramienta en vez de contestar de memoria.
const RONDA_PIDE = 'data: {"type":"response.completed","response":{"model":"test","output":[{"type":"function_call","id":"fc_1","call_id":"call_1","name":"buscar_propiedades","arguments":"{\\"operacion\\":\\"alquiler\\"}"}]}}\n\n';
// Segunda: ya con el resultado adentro, redacta.
const RONDA_CONTESTA = 'data: {"type":"response.output_text.delta","delta":"Tenemos un departamento"}\n\ndata: {"type":"response.completed","response":{"model":"test","output":[{"type":"message","content":[{"type":"output_text","text":"Tenemos un departamento"}]}]}}\n\n';

function conApiKey(t) {
  const previo = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";
  t.after(() => { if (previo === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previo; });
}

test("ofrece las herramientas y devuelve el resultado al modelo", async (t) => {
  conApiKey(t);
  const pedidos = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("properties?select=")) return new Response(JSON.stringify(PROPIEDADES));
    const body = JSON.parse(options.body);
    pedidos.push(body);
    return new Response(pedidos.length === 1 ? RONDA_PIDE : RONDA_CONTESTA);
  });

  const respuesta = await askOpenAILucia({ question: "quiero que me muestres alquileres", context: "sin catálogo", onDelta: () => {} });

  assert.equal(respuesta.ok, true);
  assert.equal(respuesta.text, "Tenemos un departamento");
  assert.deepEqual(respuesta.herramientas, ["buscar_propiedades"]);

  // Las tres herramientas viajan en los dos pedidos, con la forma de OpenAI.
  assert.equal(pedidos.length, 2);
  for (const pedido of pedidos) {
    assert.deepEqual(pedido.tools.map((h) => h.name).sort(), ["buscar_propiedades", "perfil_barrio", "precio_m2_por_barrio"]);
    assert.ok(pedido.tools.every((h) => h.type === "function" && h.parameters), "cada herramienta va como function con parameters");
  }

  // El segundo pedido lleva la llamada y su resultado: sin `store`, el modelo no
  // recuerda nada entre pedidos y necesita las dos mitades.
  const salida = pedidos[1].input.find((item) => item?.type === "function_call_output");
  assert.equal(salida.call_id, "call_1");
  assert.match(salida.output, /Departamento en alquiler permanente/);
  assert.ok(pedidos[1].input.some((item) => item?.type === "function_call"), "la llamada original vuelve en el input");
});

test("una respuesta directa no gasta una segunda vuelta", async (t) => {
  conApiKey(t);
  let vueltas = 0;
  t.mock.method(globalThis, "fetch", async () => { vueltas++; return new Response(RONDA_CONTESTA); });
  const respuesta = await askOpenAILucia({ question: "hola", context: "test", onDelta: () => {} });
  assert.equal(vueltas, 1);
  assert.equal(respuesta.ok, true);
  assert.deepEqual(respuesta.herramientas, []);
});

test("si el modelo insiste con herramientas, corta y contesta igual", async (t) => {
  conApiKey(t);
  let vueltas = 0;
  t.mock.method(globalThis, "fetch", async (url) => {
    if (String(url).includes("properties?select=")) return new Response(JSON.stringify(PROPIEDADES));
    vueltas++;
    return new Response(RONDA_PIDE);
  });
  const respuesta = await askOpenAILucia({ question: "alquileres", context: "test", onDelta: () => {} });
  // Dos vueltas como máximo, y sin texto la respuesta se declara vacía en vez de
  // quedar dando vueltas contra el proveedor.
  assert.equal(vueltas, 2);
  assert.equal(respuesta.ok, false);
  assert.equal(respuesta.reason, "empty_response");
});

test("devuelve los ids de las propiedades que encontró, para mostrarlas como tarjetas", async (t) => {
  conApiKey(t);
  let vuelta = 0;
  t.mock.method(globalThis, "fetch", async (url) => {
    if (String(url).includes("properties?select=")) return new Response(JSON.stringify(PROPIEDADES));
    vuelta++;
    return new Response(vuelta === 1 ? RONDA_PIDE : RONDA_CONTESTA);
  });
  const respuesta = await askOpenAILucia({ question: "quiero que me muestres alquileres", context: "sin catálogo", onDelta: () => {} });
  assert.deepEqual(respuesta.propiedades, [1]);
});
