import { normalizarConsulta } from "./luciaAdvisor.mjs";

// Un número dicho en una frase se olvida; el mismo número al lado de los otros
// barrios se entiende de una. Pero un gráfico no va nunca "por las dudas": se
// manda solo cuando la pregunta es de las que un gráfico contesta mejor que el
// texto, y siempre acompañando a la respuesta escrita, nunca en su lugar.

// Cuándo la pregunta es sobre el paso del tiempo. Va primero que la del m²
// porque "¿cómo evolucionó el precio del m²?" es las dos cosas, y ahí la
// respuesta es la curva.
const RE_EVOLUCION = /\b(evolucion|evoluciono|evolucionaron|subio|subieron|bajo|bajaron|aumento|aumentaron|vario|variacion|tendencia|historico|historia|ultimos anos|ultimos anios|se valoriz|valoriz|revaloriz|viene el mercado|esta el mercado|conviene comprar|buen momento|mal momento|momento para comprar|momento de comprar|se aprecio)\b/;

// Cuándo la pregunta es "cuánto vale acá vs allá".
const RE_M2_BARRIO = /\b(m2|metro cuadrado|metros cuadrados|valor del metro|precio del metro|cuanto vale|cuanto sale|cuanto cuesta|cuanto esta|que barrio|en que barrio|cual barrio|que zona|en que zona|barrio mas|zona mas|comparar barrios|comparar zonas|mas caro|mas cara|mas baratos?|mas economic)\w*/;

export function graficoParaConsulta(input) {
  const texto = normalizarConsulta(input);
  if (RE_EVOLUCION.test(texto)) return "evolucion";
  if (RE_M2_BARRIO.test(texto)) return "m2_barrio";
  return null;
}

// "General" no es un barrio: es donde el relevamiento junta lo que no pudo
// ubicar. Publicarlo al lado de Centro o Vega Maipú invita a compararlo con
// ellos, y no hay con qué.
const NO_ES_BARRIO = /^general$/i;

// Piso de respaldo. Una mediana sobre tres publicaciones no es un precio de
// zona, y en un gráfico se lee con la misma autoridad que una sobre doscientas.
const MINIMO_RELEVADAS = 8;

export function barriosDelGrafico(porBarrio = [], input = "", { cantidad = 6 } = {}) {
  const texto = normalizarConsulta(input);
  const usables = porBarrio.filter(
    (b) =>
      b?.estado === "usable" &&
      Number(b.mediana_m2_usd) > 0 &&
      Number(b.n) >= MINIMO_RELEVADAS &&
      !NO_ES_BARRIO.test(b.barrio || "")
  );
  if (usables.length < 2) return [];

  // Si la persona nombró un barrio, ese entra sí o sí: es el que vino a mirar.
  // El resto se completa con los de más respaldo, que son la vara para leerlo.
  const nombrado = usables.filter((b) => texto.includes(normalizarConsulta(b.barrio)));
  const porRespaldo = [...usables].sort((a, b) => b.n - a.n);
  const elegidos = [];
  for (const barrio of [...nombrado, ...porRespaldo]) {
    if (elegidos.length >= cantidad) break;
    if (!elegidos.includes(barrio)) elegidos.push(barrio);
  }

  return elegidos
    .sort((a, b) => b.mediana_m2_usd - a.mediana_m2_usd)
    .map((b) => ({
      barrio: b.barrio,
      valor: b.mediana_m2_usd,
      relevadas: b.n,
      destacado: nombrado.includes(b),
    }));
}

// El gráfico de evolución del sitio ya existe y espera estas claves. Se le da
// de comer con el mismo formato para no tener dos curvas distintas diciendo lo
// mismo en dos lugares.
export function serieDelGrafico(serie = []) {
  return serie
    .filter((punto) => Number(punto?.usd_m2) > 0)
    .map((punto) => ({
      anio: punto.anio,
      precio: punto.usd_m2,
      variacion: punto.variacion_pct,
      contexto: punto.descripcion,
      fuente: "Serie de referencia de mercado \u00b7 Catal\u00e1n Propiedades",
    }));
}
