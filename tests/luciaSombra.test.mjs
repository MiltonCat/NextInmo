import { register } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";

register("./luciaKnowledge-loader.mjs", import.meta.url);
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://prueba.invalid";
process.env.SUPABASE_SECRET_KEY = "prueba";
process.env.JEV_API_KEY = "jev-prueba";
process.env.LUCIA_JEV_SOMBRA = "1";
const { procesarSombra, sombraActiva } = await import("../lib/luciaSombra.js");

function respuestaJev() {
  return {
    model: "jev-1.13.0",
    answers: {
      busqueda_propiedad: { type: "noul", noul: 0.99 },
      orientacion_inversion: { type: "noul", noul: 0.02 },
      consulta_legal: { type: "noul", noul: 0.01 },
      consulta_tasacion: { type: "noul", noul: 0.01 },
      decision_comercial: { type: "noul", noul: 0.1 },
      necesita_aclaracion: { type: "noul", noul: 0.05 },
      operacion: { type: "choice", choice: "alquilar", probabilities: { comprar: 0, vender: 0, alquilar: 1, incierto: 0 } },
    },
  };
}

test("la sombra se enciende solo con bandera y clave", () => {
  assert.equal(sombraActiva(), true);
});

test("manda a Jev la frase saneada con contexto y guarda la comparación", async (t) => {
  const llamadas = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    llamadas.push({ url: String(url), options });
    if (String(url).includes("typesafe")) return Response.json(respuestaJev());
    return new Response("", { status: 201 });
  });

  const fila = await procesarSombra({
    question: "quiero de una habitación, escribime a ana@example.com",
    history: [{ role: "user", content: "quiero que me muestres alquileres, mi cel 2944 123456" }],
    paso: "welcome",
    rutaReal: "guiado",
  });

  const aJev = llamadas.find((l) => l.url.includes("typesafe"));
  assert.equal(aJev.options.headers.Authorization, "Bearer jev-prueba");
  const pedido = JSON.parse(aJev.options.body);
  assert.equal(pedido.state.consulta, "quiero de una habitación, escribime a [mail]");
  assert.deepEqual(pedido.state.mensajes_anteriores, ["quiero que me muestres alquileres, mi cel [número]"]);

  const aSupabase = llamadas.find((l) => l.url.includes("lucia_sombra_jev"));
  const guardada = JSON.parse(aSupabase.options.body);
  assert.equal(guardada.ruta_real, "guiado");
  assert.equal(guardada.operacion_jev, "alquilar");
  assert.deepEqual(guardada.diferencias, ["router_perdio_alquiler"]);
  assert.equal(guardada.con_historial, true);
  assert.equal(fila.coincide, false);
});

test("si Jev falla, guarda el error y no lanza", async (t) => {
  const guardadas = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("typesafe")) return new Response("{}", { status: 529 });
    guardadas.push(JSON.parse(options.body));
    return new Response("", { status: 201 });
  });
  const fila = await procesarSombra({ question: "busco casa", rutaReal: "guiado" });
  assert.equal(fila.error, "http_529");
  assert.equal(fila.coincide, null);
  assert.equal(guardadas.length, 1);
});

test("si Supabase falla, tampoco lanza", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) =>
    String(url).includes("typesafe") ? Response.json(respuestaJev()) : new Response("boom", { status: 500 })
  );
  assert.equal(await procesarSombra({ question: "busco casa", rutaReal: "guiado" }), null);
});
