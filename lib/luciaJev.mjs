// Capa de interpretación semántica de Lucía con Jev (TypeSafe AI).
//
// Este módulo es PURO: arma el pedido, lee la respuesta y la traduce a qué
// módulos se activarían. No hace fetch ni conoce claves —eso vive en
// lib/luciaSombra.js, solo servidor—, así que se prueba sin red.
//
// Lo que Jev hace: intención, contexto, ambigüedad, varias señales a la vez.
// Lo que Jev NO hace, a propósito:
// - No redacta: la respuesta final sigue siendo de GPT (lib/luciaOpenAI.js).
// - No decide disponibilidad ni fechas: eso es regla de negocio + Supabase.
// - No extrae números (presupuesto, dormitorios): eso ya lo hace
//   parseLuciaText de forma determinística y probada.

export const JEV_MODELO_POR_DEFECTO = "jev-latest";
export const UMBRAL_SI = 0.5;

// La instrucción de operación es la que se validó en el Playground: sin el
// "incierto" explícito, Jev asumía "comprar" ante "queremos mudarnos a SMA".
const INSTRUCCION_OPERACION =
  "Identifica qué operación inmobiliaria busca el usuario. Si comprar, vender o alquilar no está expresado de forma explícita o inequívoca, selecciona incierto.";

// Varias señales a la vez: NO es un clasificador de una sola intención.
// Si en el Playground validaste otra redacción para alguna, pegala acá tal cual.
export const PREGUNTAS_JEV = {
  busqueda_propiedad: {
    type: "noul",
    instructions: "El usuario quiere ver o buscar propiedades concretas, en venta o en alquiler.",
  },
  orientacion_inversion: {
    type: "noul",
    instructions: "El usuario busca orientación sobre invertir: renta, rentabilidad, valorización o qué hacer con su dinero.",
  },
  consulta_legal: {
    type: "noul",
    instructions: "El usuario pregunta por aspectos legales o documentales: papeles, escritura, boleto, gastos de la operación, impuestos o qué controlar antes de firmar.",
  },
  consulta_tasacion: {
    type: "noul",
    instructions: "El usuario quiere saber cuánto vale una propiedad concreta, cuánto podría pedir por ella o tiene una tasación sobre la que consulta.",
  },
  decision_comercial: {
    type: "noul",
    instructions: "El usuario está evaluando una decisión: comprar, vender, alquilar, invertir o esperar, y quiere saber qué le conviene.",
  },
  operacion: {
    type: "choice",
    instructions: INSTRUCCION_OPERACION,
    criteria: {
      comprar: "Quiere comprar una propiedad.",
      vender: "Quiere vender una propiedad propia.",
      alquilar: "Quiere alquilar una propiedad.",
      incierto: "La operación no está expresada de forma explícita o inequívoca.",
    },
  },
  necesita_aclaracion: {
    type: "noul",
    instructions: "Con lo que dijo el usuario y los mensajes anteriores no alcanza para ayudarlo, y hace falta preguntarle algo antes de responder.",
  },
};

const OPERACIONES = ["comprar", "vender", "alquilar"];
const ETIQUETA_OPERACION = { comprar: "comprar", vender: "vender", alquilar: "alquilar" };

// El state lleva el contexto de la charla. Es lo que resolvió en el Playground
// "quiero de una habitación" después de "mostrame alquileres" (alquilar = 100%).
// Va también la última frase de Lucía: si preguntó "¿comprar o alquilar?",
// un "alquilar" suelto solo se entiende con esa pregunta al lado.
export function construirEstadoJev({ question, history = [] }) {
  const recientes = Array.isArray(history) ? history.slice(-6) : [];
  const anteriores = recientes
    .filter((item) => item?.role === "user" && item.content)
    .map((item) => String(item.content).slice(0, 400))
    .slice(-3);
  const ultimaDeLucia = [...recientes].reverse().find((item) => item?.role === "assistant" && item.content);

  const estado = { consulta: String(question || "") };
  if (anteriores.length) estado.mensajes_anteriores = anteriores;
  if (ultimaDeLucia) estado.ultimo_mensaje_de_lucia = String(ultimaDeLucia.content).slice(0, 400);
  return estado;
}

export function construirPedidoJev({ question, history = [], modelo = JEV_MODELO_POR_DEFECTO }) {
  return {
    model: modelo,
    state: construirEstadoJev({ question, history }),
    questions: PREGUNTAS_JEV,
  };
}

const prob = (valor) => {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? Math.round(n * 1000) / 1000 : null;
};

function distribucion(valor, opciones) {
  const salida = {};
  if (!valor || typeof valor !== "object") return salida;
  for (const opcion of opciones) {
    const p = prob(valor[opcion]);
    if (p !== null) salida[opcion] = p;
  }
  return salida;
}

function masProbable(dist) {
  let mejor = null;
  for (const [opcion, p] of Object.entries(dist)) if (!mejor || p > dist[mejor]) mejor = opcion;
  return mejor;
}

// Traduce la respuesta de /v1/systemone a { senales, probabilidades }.
// Una pregunta que no vino queda en null —no en false—: "Jev no contestó" y
// "Jev dijo que no" son cosas distintas cuando se comparan corridas.
export function leerRespuestaJev(body) {
  const answers = body?.answers;
  if (!answers || typeof answers !== "object") return null;

  const senales = {};
  const probabilidades = {};
  for (const [clave, definicion] of Object.entries(PREGUNTAS_JEV)) {
    const respuesta = answers[clave];
    if (definicion.type === "noul") {
      const p = prob(respuesta?.noul);
      probabilidades[clave] = p;
      senales[clave] = p === null ? null : p >= UMBRAL_SI;
    } else {
      const opciones = Object.keys(definicion.criteria);
      const dist = distribucion(respuesta?.probabilities, opciones);
      probabilidades[clave] = dist;
      senales[clave] = opciones.includes(respuesta?.choice) ? respuesta.choice : masProbable(dist);
    }
  }
  return { senales, probabilidades, modelo: typeof body?.model === "string" ? body.model : null };
}

// Si hay que aclarar la operación, se pregunta por las dos más probables, no
// por un par fijo. Es lo que evita el "¿preferís comprar o vender?" a una
// familia que quiere mudarse: ahí vender casi no tiene masa.
export function opcionesParaAclarar(distOperacion = {}) {
  return OPERACIONES
    .map((op) => [op, Number(distOperacion[op]) || 0])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .filter(([, p]) => p > 0)
    .map(([op]) => op);
}

export function preguntaDeAclaracion(opciones = []) {
  if (opciones.length < 2) return null;
  const [a, b] = opciones.map((op) => ETIQUETA_OPERACION[op]);
  return `¿Están pensando en ${a} o ${b}?`;
}

// Qué haría el backend con estas señales. Es la propuesta que se compara en
// sombra contra el router actual; hoy no decide nada.
//
// "guiado" (el árbol de botones) solo queda para la búsqueda pelada con la
// operación clara. Todo lo que traiga orientación, legal, tasación, una
// decisión o una duda va a la IA con los módulos que correspondan.
export function planSegunJev(senales = {}, probabilidades = {}) {
  const s = senales || {};
  const operacion = s.operacion || "incierto";
  const modulos = {
    supabase: Boolean(s.busqueda_propiedad),
    inversion: Boolean(s.orientacion_inversion),
    legal: Boolean(s.consulta_legal),
    tasador: Boolean(s.consulta_tasacion),
    contenido: Boolean(s.orientacion_inversion || s.consulta_legal || s.decision_comercial),
    aclaracion: Boolean(s.necesita_aclaracion),
  };

  const busquedaPelada =
    modulos.supabase &&
    !modulos.inversion &&
    !modulos.legal &&
    !modulos.tasador &&
    !s.decision_comercial &&
    !modulos.aclaracion &&
    (operacion === "comprar" || operacion === "alquilar");

  // Aclarar la operación solo cuando hace falta para avanzar: una consulta
  // legal o de inversión se contesta igual sin saber si compra o alquila.
  const aclararOperacion =
    operacion === "incierto" && (modulos.aclaracion || modulos.supabase) && !modulos.legal && !modulos.inversion;
  const aclararEntre = aclararOperacion ? opcionesParaAclarar(probabilidades?.operacion) : [];

  return {
    ruta: busquedaPelada ? "guiado" : "ia",
    operacion,
    modulos,
    aclararEntre,
    preguntaSugerida: preguntaDeAclaracion(aclararEntre),
  };
}

// La ruta real puede ser "tasador" (el wizard) o "ia_tasacion" (charla sobre
// una tasación hecha): para comparar, la segunda cuenta como IA.
const rutaComparable = (ruta) => (ruta === "ia_tasacion" ? "ia" : ruta);

// Diferencias con nombre propio, para poder contarlas con un GROUP BY.
export function compararConRouter({ rutaReal, filtrosRouter = {}, plan }) {
  if (!plan) return { coincide: null, diferencias: [] };
  const diferencias = [];
  const real = rutaComparable(rutaReal);

  if (real === "guiado" && plan.ruta === "ia") diferencias.push("router_arbol_jev_ia");
  if (real === "ia" && plan.ruta === "guiado") diferencias.push("router_ia_jev_arbol");
  if (real === "tasador" && !plan.modulos.tasador) diferencias.push("tasador_sin_senal_jev");
  if (real !== "tasador" && plan.modulos.tasador && plan.operacion === "vender") diferencias.push("jev_ve_tasacion_de_venta");

  const operacionRouter = filtrosRouter?.operacion === "alquiler" ? "alquilar" : null;
  if (real === "guiado" && plan.operacion === "alquilar" && !operacionRouter) diferencias.push("router_perdio_alquiler");
  if (operacionRouter && plan.operacion !== "incierto" && plan.operacion !== operacionRouter) diferencias.push("operacion_distinta");
  if (real === "guiado" && plan.operacion === "incierto") diferencias.push("arbol_con_operacion_incierta");

  return { coincide: diferencias.length === 0, diferencias };
}
