// Banco de pruebas de Lucía — nivel 1: qué le llega al modelo, no qué contesta.
//
// Corre las preguntas de tests/lucia-evaluation.json contra buildLuciaKnowledge()
// y verifica que el contexto traiga los datos que hacen falta para contestarlas.
// No sale a la red y no gasta un centavo: el catálogo, los embeddings y la
// búsqueda semántica se responden con datos de prueba.
//
// Por qué el nivel 1 alcanza para la mayoría: cuando Lucía contesta mal, casi
// siempre es porque el dato NO le llegó, no porque lo haya leído mal. El bug del
// blog del 9/9 era exactamente eso, y esta prueba lo habría encontrado sola.
//
// Los casos marcados `nivel: 2` (los guardrails) no se evalúan acá: para saber
// si se negó a predecir el dólar hay que leer la respuesta, y eso necesita el
// modelo. Quedan listados al final como pendientes.
//
//   node scripts/evaluar-lucia.mjs
//   node scripts/evaluar-lucia.mjs --detalle    (muestra los topics de cada caso)
//
// Sale con código 1 si el puntaje baja de MINIMO. Ese número es un trinquete:
// cuando arregles algo, subilo. No lo bajes para que pase.
import { register } from "node:module";
import { readFileSync } from "node:fs";

const MINIMO = 39;

register("../tests/luciaKnowledge-loader.mjs", import.meta.url);

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://prueba.invalid";
process.env.SUPABASE_SECRET_KEY = "prueba";
process.env.OPENAI_API_KEY = "prueba";

const { buildLuciaKnowledge } = await import("../lib/luciaKnowledge.js");

const casos = JSON.parse(readFileSync(new URL("../tests/lucia-evaluation.json", import.meta.url), "utf8"));
const detalle = process.argv.includes("--detalle");

// Catálogo de prueba: cubre las formas que la gente pide de verdad —una casa en
// venta, un departamento chico, un lote y un alquiler permanente— para que un
// fallo sea del ruteo y no de que faltaba justo ese tipo de propiedad.
const PROPIEDADES = [
  { id: 1, title: "Casa 3 dormitorios en Chapelco Golf", type: "Casa", modalidad: "venta", location: "Chapelco Golf", barrio: "Chapelco Golf", price: 195000, bedrooms: 3, bathrooms: 2, area: 140, description: "Casa con patio y cochera, tranquila, internet por fibra.", features: ["patio", "cochera"], status: "disponible", sort_order: 1, created_at: "2026-09-01" },
  { id: 2, title: "Monoambiente en el centro", type: "Monoambiente", modalidad: "venta", location: "Centro", barrio: "Centro", price: 78000, bedrooms: 1, bathrooms: 1, area: 32, description: "Monoambiente a estrenar en el centro.", features: [], status: "disponible", sort_order: 2, created_at: "2026-08-20" },
  { id: 3, title: "Lote apto construcción en Vega Maipú", type: "Terreno", modalidad: "venta", location: "Vega Maipú", barrio: "Vega Maipú", price: 60000, bedrooms: null, bathrooms: null, area: 800, description: "Lote apto para construir vivienda, con servicios.", features: [], status: "disponible", sort_order: 3, created_at: "2026-07-10" },
  { id: 4, title: "Departamento 2 dormitorios en alquiler permanente", type: "Departamento", modalidad: "alquiler_permanente", location: "Centro", barrio: "Centro", price: null, precioAlquilerARS: 650000, bedrooms: 2, bathrooms: 1, area: 65, description: "Alquiler permanente cerca del centro.", features: [], status: "disponible", alquilada: false, sort_order: 4, created_at: "2026-09-05" },
];

const original = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (u.includes("api.openai.com/v1/embeddings")) {
    return new Response(JSON.stringify({ data: [{ embedding: [1, 0] }] }), { status: 200 });
  }
  if (u.includes("rpc/buscar_sitio")) {
    return new Response(JSON.stringify([]), { status: 200 });
  }
  if (u.includes("properties?select=")) {
    return new Response(JSON.stringify(PROPIEDADES), { status: 200 });
  }
  return new Response(JSON.stringify([]), { status: 200 });
};

const fallas = [];
let aprobados = 0;
let evaluados = 0;

try {
  for (const caso of casos) {
    if (!caso.espera) continue;
    evaluados++;
    const resultado = await buildLuciaKnowledge(caso.question);
    const topics = JSON.parse(resultado.context).snippets.map((s) => s.topic);
    // `topics` exige todos; `alguno` se conforma con uno. Hay preguntas que
    // se contestan bien desde más de una fuente y forzar una sola inventa fallas.
    const faltan = caso.espera.topics
      ? caso.espera.topics.filter((t) => !topics.includes(t))
      : (caso.espera.alguno.some((t) => topics.includes(t)) ? [] : [`alguno de: ${caso.espera.alguno.join(" / ")}`]);
    if (faltan.length === 0) {
      aprobados++;
      if (detalle) console.log(`  ok   [${caso.category}] ${caso.question}`);
    } else {
      fallas.push({ ...caso, faltan, topics });
    }
  }
} finally {
  globalThis.fetch = original;
}

if (fallas.length) {
  console.log("\nLE FALTA EL DATO PARA CONTESTAR:\n");
  const porCategoria = {};
  for (const f of fallas) (porCategoria[f.category] ??= []).push(f);
  for (const [categoria, items] of Object.entries(porCategoria)) {
    console.log(`  ${categoria}`);
    for (const f of items) {
      const marca = f.origen === "real" ? "· real" : "      ";
      console.log(`    ${marca} ${f.question.slice(0, 74)}`);
      console.log(`             falta: ${f.faltan.join(", ")}${detalle ? `  |  llegó: ${f.topics.join(", ") || "nada"}` : ""}`);
    }
    console.log();
  }
}

const nivel2 = casos.filter((c) => c.nivel === 2);
console.log(`nivel 1 (contexto):  ${aprobados}/${evaluados} aprobados`);
console.log(`nivel 2 (respuesta): ${nivel2.length} casos sin evaluar, necesitan el modelo`);
console.log(`mínimo exigido:      ${MINIMO}`);

if (aprobados < MINIMO) {
  console.error(`\nBAJÓ: ${aprobados} aprobados contra un mínimo de ${MINIMO}.`);
  process.exit(1);
}
