// Banco de pruebas de Lucía — nivel 2: qué hace de verdad, con el modelo real.
//
// El nivel 1 (scripts/evaluar-lucia.mjs) mira si el dato le llega en el contexto.
// Desde que Lucía tiene herramientas eso quedó corto: puede ir a buscar el dato
// sola, y el nivel 1 no lo ve. Acá se corre la consulta completa —contexto real,
// modelo real, herramientas reales— y un caso aprueba si terminó con el dato en
// la mano por CUALQUIERA de las dos vías.
//
// ESTO CUESTA PLATA. Cada caso es una llamada a OpenAI. Por eso corre solo los
// que el nivel 1 no puede responder: los que ya aprueban por contexto no se
// vuelven a preguntar.
//
//   node scripts/evaluar-lucia-nivel2.mjs            (los que el nivel 1 no cubre)
//   node scripts/evaluar-lucia-nivel2.mjs --todos    (el banco entero, caro)
//   node scripts/evaluar-lucia-nivel2.mjs --guardrails (solo los de criterio)
//
// Los guardrails no se puntúan solos: se imprime la respuesta para leerla. Si
// Lucía predice el dólar no hay regex que lo detecte bien, hay que leerlo.
import { register } from "node:module";
import { readFileSync } from "node:fs";

register("../tests/luciaKnowledge-loader.mjs", import.meta.url);

// Las credenciales reales: este script sí sale a la red.
for (const linea of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const limpia = linea.trim();
  if (!limpia || limpia.startsWith("#")) continue;
  const corte = limpia.indexOf("=");
  if (corte < 0) continue;
  const clave = limpia.slice(0, corte);
  if (!process.env[clave]) process.env[clave] = limpia.slice(corte + 1).replace(/^["']|["']$/g, "");
}

const { buildLuciaKnowledge } = await import("../lib/luciaKnowledge.js");
const { askOpenAILucia } = await import("../lib/luciaOpenAI.js");

const casos = JSON.parse(readFileSync(new URL("../tests/lucia-evaluation.json", import.meta.url), "utf8"));
const soloGuardrails = process.argv.includes("--guardrails");
const todos = process.argv.includes("--todos");

// Se reproduce el nivel 1 para saber a quién hay que preguntarle de verdad.
function apruebaPorContexto(caso, topics) {
  if (!caso.espera) return false;
  if (caso.espera.topics) return caso.espera.topics.every((t) => topics.includes(t));
  if (caso.espera.alguno) return caso.espera.alguno.some((t) => topics.includes(t));
  return false;
}

const resultados = [];
let llamadas = 0;

for (const caso of casos) {
  const esGuardrail = caso.nivel === 2;
  if (soloGuardrails && !esGuardrail) continue;

  const conocimiento = await buildLuciaKnowledge(caso.question);
  const topics = JSON.parse(conocimiento.context).snippets.map((s) => s.topic);
  const porContexto = apruebaPorContexto(caso, topics);

  // Los que ya aprueban por contexto no se le preguntan al modelo: sería pagar
  // por confirmar algo que el nivel 1 ya sabe.
  if (!todos && !esGuardrail && porContexto) {
    resultados.push({ caso, estado: "contexto", herramientas: [] });
    continue;
  }
  if (!todos && !esGuardrail && !caso.espera?.herramientas?.length) {
    resultados.push({ caso, estado: "sin_via", herramientas: [] });
    continue;
  }

  llamadas++;
  const respuesta = await askOpenAILucia({ question: caso.question, context: conocimiento.context });
  const herramientas = respuesta.herramientas || [];

  if (!respuesta.ok) {
    resultados.push({ caso, estado: "error", herramientas, detalle: respuesta.reason });
  } else if (esGuardrail) {
    resultados.push({ caso, estado: "leer", herramientas, texto: respuesta.text });
  } else if (porContexto || caso.espera.herramientas.some((h) => herramientas.includes(h))) {
    resultados.push({ caso, estado: "ok", herramientas, texto: respuesta.text });
  } else {
    resultados.push({ caso, estado: "falla", herramientas, texto: respuesta.text });
  }
}

const cuenta = (estado) => resultados.filter((r) => r.estado === estado).length;

const fallas = resultados.filter((r) => r.estado === "falla");
if (fallas.length) {
  console.log("\nNO BUSCÓ EL DATO NI LO TENÍA:\n");
  for (const f of fallas) {
    console.log(`  ${f.caso.origen === "real" ? "· real" : "      "} ${f.caso.question.slice(0, 76)}`);
    console.log(`         esperaba: ${f.caso.espera.herramientas.join(" o ")}   |   llamó: ${f.herramientas.join(", ") || "nada"}`);
    console.log(`         contestó: ${(f.texto || "").replace(/\s+/g, " ").slice(0, 130)}…\n`);
  }
}

const sinVia = resultados.filter((r) => r.estado === "sin_via");
if (sinVia.length) {
  console.log("SIN HERRAMIENTA NI DATO — estos los tiene que escribir Milton en data/respuestasDeLaCasa.js:\n");
  for (const s of sinVia) console.log(`  ${s.caso.origen === "real" ? "· real" : "      "} ${s.caso.question.slice(0, 76)}`);
  console.log();
}

const paraLeer = resultados.filter((r) => r.estado === "leer");
if (paraLeer.length) {
  console.log("PARA LEER A MANO (criterio, no se puntúa solo):\n");
  for (const g of paraLeer) {
    console.log(`  ${g.caso.question}`);
    console.log(`    → ${(g.texto || "").replace(/\s+/g, " ").slice(0, 200)}…\n`);
  }
}

console.log(`resueltos por contexto:    ${cuenta("contexto")}`);
console.log(`resueltos por herramienta: ${cuenta("ok")}`);
console.log(`fallan:                    ${cuenta("falla")}`);
console.log(`sin vía posible:           ${cuenta("sin_via")}   (contenido a escribir)`);
console.log(`errores del proveedor:     ${cuenta("error")}`);
console.log(`\nllamadas a OpenAI: ${llamadas}`);
