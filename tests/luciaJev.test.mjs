import test from "node:test";
import assert from "node:assert/strict";
import {
  PREGUNTAS_JEV,
  compararConRouter,
  construirPedidoJev,
  leerRespuestaJev,
  planSegunJev,
} from "../lib/luciaJev.mjs";

const noul = (p) => ({ type: "noul", noul: p });
const operacion = (dist) => ({
  type: "choice",
  choice: Object.entries(dist).sort((a, b) => b[1] - a[1])[0][0],
  probabilities: dist,
});

test("el pedido lleva contexto: mensajes anteriores y la última frase de Lucía", () => {
  const pedido = construirPedidoJev({
    question: "quiero de una habitación",
    history: [
      { role: "assistant", content: "Soy Lucía" },
      { role: "user", content: "quiero que me muestres alquileres" },
      { role: "assistant", content: "¿Qué tipo de propiedad buscás?" },
    ],
  });
  assert.equal(pedido.model, "jev-latest");
  assert.deepEqual(pedido.state, {
    consulta: "quiero de una habitación",
    mensajes_anteriores: ["quiero que me muestres alquileres"],
    ultimo_mensaje_de_lucia: "¿Qué tipo de propiedad buscás?",
  });
  assert.equal(pedido.questions, PREGUNTAS_JEV);
  assert.match(pedido.questions.operacion.instructions, /selecciona incierto/);
});

test("sin historial el state es solo la consulta", () => {
  assert.deepEqual(construirPedidoJev({ question: "busco casa" }).state, { consulta: "busco casa" });
});

test("lee varias señales a la vez y deja null lo que no vino", () => {
  const leido = leerRespuestaJev({
    model: "jev-1.13.0",
    answers: {
      busqueda_propiedad: noul(0.998),
      orientacion_inversion: noul(0.97),
      operacion: operacion({ comprar: 0.9, vender: 0.02, alquilar: 0.03, incierto: 0.05 }),
    },
  });
  assert.equal(leido.senales.busqueda_propiedad, true);
  assert.equal(leido.senales.orientacion_inversion, true);
  assert.equal(leido.senales.consulta_legal, null);
  assert.equal(leido.senales.operacion, "comprar");
  assert.equal(leido.probabilidades.operacion.comprar, 0.9);
  assert.equal(leido.modelo, "jev-1.13.0");
});

test("respuesta sin answers no se interpreta", () => {
  assert.equal(leerRespuestaJev(null), null);
  assert.equal(leerRespuestaJev({ error: "x" }), null);
});

test("inversión + búsqueda va a la IA con Supabase, inversión y contenido", () => {
  const plan = planSegunJev({
    busqueda_propiedad: true, orientacion_inversion: true, consulta_legal: false,
    consulta_tasacion: false, decision_comercial: true, operacion: "comprar", necesita_aclaracion: false,
  });
  assert.equal(plan.ruta, "ia");
  assert.deepEqual(plan.modulos, { supabase: true, inversion: true, legal: false, tasador: false, contenido: true, aclaracion: false });
  assert.equal(plan.preguntaSugerida, null);
});

test("la búsqueda pelada con operación clara puede seguir en el árbol", () => {
  const plan = planSegunJev({ busqueda_propiedad: true, operacion: "alquilar" });
  assert.equal(plan.ruta, "guiado");
});

test("familia que se muda: pregunta comprar o alquilar, nunca comprar o vender", () => {
  const plan = planSegunJev(
    { busqueda_propiedad: true, operacion: "incierto", necesita_aclaracion: true },
    { operacion: { comprar: 0.3, vender: 0.01, alquilar: 0.2, incierto: 0.49 } }
  );
  assert.equal(plan.ruta, "ia");
  assert.deepEqual(plan.aclararEntre, ["comprar", "alquilar"]);
  assert.equal(plan.preguntaSugerida, "¿Están pensando en comprar o alquilar?");
});

test("una consulta legal no pide aclarar la operación", () => {
  const plan = planSegunJev(
    { consulta_legal: true, operacion: "incierto", necesita_aclaracion: true },
    { operacion: { comprar: 0.4, alquilar: 0.1, vender: 0.05, incierto: 0.45 } }
  );
  assert.deepEqual(plan.aclararEntre, []);
});

test("marca cuando el router manda al árbol algo que Jev ve como consulta", () => {
  const plan = planSegunJev({ busqueda_propiedad: true, decision_comercial: true, operacion: "incierto" });
  const cmp = compararConRouter({ rutaReal: "guiado", filtrosRouter: {}, plan });
  assert.equal(cmp.coincide, false);
  assert.ok(cmp.diferencias.includes("router_arbol_jev_ia"));
  assert.ok(cmp.diferencias.includes("arbol_con_operacion_incierta"));
});

test("marca el alquiler que el router perdió por no mirar el contexto", () => {
  const plan = planSegunJev({ busqueda_propiedad: true, operacion: "alquilar" });
  const cmp = compararConRouter({ rutaReal: "guiado", filtrosRouter: { minBedrooms: 1, maxBedrooms: 1 }, plan });
  assert.deepEqual(cmp.diferencias, ["router_perdio_alquiler"]);
});

test("coinciden cuando los dos ven una búsqueda de alquiler", () => {
  const plan = planSegunJev({ busqueda_propiedad: true, operacion: "alquilar" });
  const cmp = compararConRouter({ rutaReal: "guiado", filtrosRouter: { operacion: "alquiler" }, plan });
  assert.deepEqual(cmp, { coincide: true, diferencias: [] });
});

test("sin plan (Jev falló) no hay veredicto", () => {
  assert.deepEqual(compararConRouter({ rutaReal: "ia", plan: null }), { coincide: null, diferencias: [] });
});
