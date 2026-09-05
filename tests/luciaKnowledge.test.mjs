import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("./luciaKnowledge-loader.mjs", import.meta.url);

// Valores ficticios: ninguna prueba sale a la red ni escribe en la base.
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://prueba.invalid";
process.env.SUPABASE_SECRET_KEY = "prueba";
process.env.OPENAI_API_KEY = "prueba";
const { buildLuciaKnowledge } = await import("../lib/luciaKnowledge.js");

test("asesora sobre ahorros con inversiones, mercado, tasador y blog aunque falle el índice", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Índice de prueba sin conexión"); };
  try {
    const result = await buildLuciaKnowledge("Tengo ahorros y quiero invertir, qué rentabilidad hay");
    const context = JSON.parse(result.context);
    for (const topic of ["inversion_publicada", "mercado", "tasador_publicado", "blog"]) {
      assert.ok(context.snippets.some((item) => item.topic === topic), topic);
    }
    for (const href of ["/inversiones/", "/tasacion/", "/precio-m2/"]) assert.ok(result.sources.some((item) => item.href === href), href);
    assert.ok(result.sources.some((item) => item.href.startsWith("/blog/")));
    assert.ok(result.context.length <= 14000);
    const inversion = context.snippets.find((item) => item.topic === "inversion_publicada");
    const { ESCENARIOS, RENTALS } = await import("../lib/inversionesDatos.js");
    assert.deepEqual(inversion.simulador.escenarios, ESCENARIOS);
    assert.deepEqual(inversion.simulador.segmentos, RENTALS);
  } finally { globalThis.fetch = original; }
});

test("conserva los fragmentos y sus referencias al pedir el origen de un dato", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => new Response(JSON.stringify(String(url).includes("embeddings")
    ? { data: [{ embedding: [1, 0] }] }
    : [{ titulo: "Análisis de inversión", url: "/inversiones/", seccion: "pagina", fragmento: "Las estimaciones dependen de la estrategia y la gestión.", similitud: 0.9 }]), { status: 200 });
  try {
    const result = await buildLuciaKnowledge("¿De dónde sale ese dato?", [{ role: "user", content: "Qué rentabilidad tiene invertir" }]);
    assert.match(result.context, /Las estimaciones dependen/);
    assert.ok(JSON.parse(result.context).snippets.some((item) => item.topic === "inversion_publicada"));
    assert.ok(result.sources.some((item) => item.href === "/inversiones/"));
  } finally { globalThis.fetch = original; }
});
