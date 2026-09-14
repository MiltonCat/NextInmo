// Métricas de mercado derivadas del modelo predictivo.
// Fuente: repo modelo-predictivo-m2 → `python exportar_mercado.py --ciudad sma`
// → outputs/mercado_sma.json, copiado a app/data/mercado_sma.json.
//
// Centraliza los conteos que antes estaban hardcodeados ("324", desactualizado)
// en ~8 páginas + el blog. Para actualizar TODO el sitio tras un re-scrape:
// regenerar el JSON, copiarlo a app/data/ y `npm run build`.
//
// Dos números, según el contexto de la frase (decisión deliberada de honestidad):
//   RELEVADAS_TOTAL  → "relevamos / analizamos N propiedades" (mercado completo).
//   RELEVADAS_MODELO → "el modelo se entrena con N" (solo Casa + Departamento).
// Al 2026-08-06 son 1.597 y 1.017. No se escriben acá: este comentario ya tuvo
// los valores de un export viejo (1.753 / 704) durante meses.
//
// OJO, hay un tercer número que NO es ninguno de estos dos: `rango_por_tipo[].n`
// cuenta las propiedades sobre las que se calculó la mediana de ese tipo, ya
// descartadas las que el modelo no puede medir. Para casas son 188, no 512.
// Cuando se publique "USD X/m² sobre N propiedades", N es ESE número.
import mercado from "@/app/data/mercado_sma.json";

export const RELEVADAS_TOTAL = mercado.relevadas.total;
export const RELEVADAS_MODELO = mercado.relevadas.usables_modelo;

export const RELEVADAS_TOTAL_FMT = RELEVADAS_TOTAL.toLocaleString("es-AR");
export const RELEVADAS_MODELO_FMT = RELEVADAS_MODELO.toLocaleString("es-AR");

// ─── LO QUE SE PUBLICA ──────────────────────────────────────────────────────
//
// RELEVADAS_PUBLICO es el ÚNICO número de propiedades que va a la web. Los dos
// de arriba son para uso interno y para el panel /admin.
//
// Por qué uno solo, y redondeado hacia abajo:
//
//   1. Un visitante que ve "1.597" en una página y "1.017" en otra no piensa
//      "son métricas distintas", piensa que alguien se equivocó. Dos números
//      exactos conviven mal aunque los dos sean correctos.
//   2. El total cambia en cada re-scrape. Con la cifra exacta publicada, cada
//      número del sitio queda viejo apenas se regenera el JSON.
//   3. "Más de 1.500" es verdad hoy y va a seguir siendo verdad después del
//      próximo relevamiento. No se puede refutar, no promete cobertura del
//      mercado y no expone cómo se arma el dataset.
//
// Se redondea al medio millar de abajo: 1.597 → "más de 1.500". Si el
// relevamiento crece a 2.100, pasa solo a "más de 2.000".
const piso = Math.floor(RELEVADAS_TOTAL / 500) * 500;

export const RELEVADAS_PUBLICO = `más de ${piso.toLocaleString("es-AR")}`;

// Fecha DE LOS DATOS, no del archivo. Son cosas distintas: `generado` es cuándo
// se corrió el export y `datos_al` es la última vez que el scraper vio una
// publicación. Coinciden solo si se exporta el mismo día que se relevó.
//
// El sitio dice "los datos publicados son del X", así que lo que corresponde es
// `datos_al`. Cuando esto leía `generado`, regenerar el JSON por un cambio de
// formato —sin volver a scrapear— movía la fecha hacia adelante y el sitio
// anunciaba un relevamiento que no había pasado.
//
// El `?? mercado.generado` es para los JSON de ciudades exportadas antes de que
// existiera el campo; se puede sacar cuando estén todos regenerados.
export const MERCADO_GENERADO = mercado.datos_al ?? mercado.generado;

// Valor del m² POR TIPO. Publicar esto y no un número único: casas y departamentos
// difieren ~58% (2.085 vs 3.292 al 2026-08-06), así que el promedio mezclado no le
// sirve a nadie — ni al que vende una casa ni al que vende un departamento.
export const VALOR_M2 = mercado.valor_m2_usd.por_tipo;
export const VALOR_M2_CASA = VALOR_M2.Casa;
export const VALOR_M2_DEPTO = VALOR_M2.Departamento;

// Rango intercuartil (el 50% central del mercado) por tipo, con su n.
// Solo existe para Casa y Departamento; el resto no tiene datos suficientes.
export const RANGO_M2 = mercado.valor_m2_usd.rango_por_tipo ?? {};

// Mediana del m² por barrio, con su n y un estado ("usable" / "en_observacion").
// El tasador la usa para mostrar contexto mientras la persona completa el
// formulario: es lo que hace que el número final no aparezca de la nada.
//
// OJO — `mediana_m2_usd` de cada fila MEZCLA casa y departamento, igual que el
// número general de la ciudad. Cada fila trae además `por_tipo` con el desglose,
// que es lo que conviene publicar cuando se sabe de qué tipo se está hablando:
// en el Centro la mezcla da 3.400, pero las casas están en 2.564 y los deptos en
// 3.455. Ver medianaDeBarrioPorTipo() en lib/precioZonas.js.
export const M2_POR_BARRIO = mercado.valor_m2_usd.por_barrio ?? [];

// Los nombres de barrio del JSON de mercado y los que acepta la API del modelo
// no coinciden siempre ("La Cascada" vs "Barrio La Cascada", acentos, etc.).
// Normalizamos para poder cruzarlos sin mantener una tabla de equivalencias a
// mano, que se desactualizaría en el próximo re-scrape.
function normalizarBarrio(nombre) {
  return String(nombre || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^barrio\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const INDICE_BARRIOS = new Map(
  M2_POR_BARRIO.map((b) => [normalizarBarrio(b.barrio), b])
);

// Devuelve la referencia de un barrio, o null si no tenemos datos suficientes.
// Solo se publica lo marcado "usable": los barrios con 1 o 2 propiedades
// relevadas dan medianas que no significan nada y confundirían más que ayudar.
export function referenciaBarrio(nombre, { minimo = 4 } = {}) {
  const b = INDICE_BARRIOS.get(normalizarBarrio(nombre));
  if (!b || b.estado !== "usable" || b.n < minimo) return null;
  return { barrio: b.barrio, medianaM2: b.mediana_m2_usd, n: b.n };
}

// Lo mismo que referenciaBarrio(), pero para UN TIPO ("Casa" | "Departamento").
//
// Existe porque `mediana_m2_usd` de cada barrio mezcla casa y departamento, y
// esa mezcla es lo que el tasador venía comparando contra el m² de UNA
// propiedad de un tipo conocido. En el Centro hay 280 departamentos relevados
// contra 32 casas: la mediana "del Centro" es, en los hechos, la de los
// departamentos, y al que tasa una casa le muestra una diferencia que no es
// suya. Con los datos del 13/09/2026, una casa del Centro comparada contra la
// mezcla da -6% y contra las casas del barrio da +24%: cambia de signo.
//
// Ya existe medianaDeBarrioPorTipo() en lib/precioZonas.js, que hace esto
// mismo, pero toma el SLUG de una página del sitio. Acá el nombre llega desde
// el tasador, así que se resuelve por el mismo índice normalizado que usa
// referenciaBarrio(): no hace falta que el barrio tenga ficha publicada.
//
// Devuelve null —y nunca cae a la mezcla en silencio— cuando el barrio no tiene
// suficientes propiedades relevadas de ese tipo. Quien lo llame decide qué
// mostrar: un fallback mudo sería volver al problema que esto arregla.
export function referenciaBarrioPorTipo(nombre, tipo, { minimo = 4 } = {}) {
  const b = INDICE_BARRIOS.get(normalizarBarrio(nombre));
  const dato = b?.por_tipo?.[tipo];
  if (!dato?.mediana_m2_usd || !(dato.n >= minimo)) return null;
  return { barrio: b.barrio, tipo, medianaM2: dato.mediana_m2_usd, n: dato.n };
}

// Los barrios con más propiedades relevadas, ya ordenados. Es lo que se publica
// cuando hay que mostrar "algunos barrios" sin elegirlos a dedo: el criterio es
// el volumen de datos, no la preferencia comercial.
export function barriosDestacados(cantidad = 4) {
  return M2_POR_BARRIO.filter((b) => b.estado === "usable")
    .slice(0, cantidad)
    .map((b) => ({ barrio: b.barrio, medianaM2: b.mediana_m2_usd, n: b.n }));
}

// Serie histórica del m². OJO: está marcada como `referencia_curada` en el JSON
// —se carga a mano, no sale del scraping— así que se publica como referencia de
// mercado y nunca como un dato medido por el modelo.
export const EVOLUCION_SERIE = mercado.evolucion_precios?.serie ?? [];
export const EVOLUCION_VARIACION_TOTAL = mercado.evolucion_precios?.variacion_total_pct ?? null;

export const fmtUSD = (n) =>
  typeof n === "number" ? `USD ${n.toLocaleString("es-AR")}` : "—";

export default mercado;
