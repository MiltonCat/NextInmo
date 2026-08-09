// Métricas de mercado derivadas del modelo predictivo.
// Fuente: repo modelo-predictivo-m2 → `python exportar_mercado.py --ciudad sma`
// → outputs/mercado_sma.json, copiado a app/data/mercado_sma.json.
//
// Centraliza los conteos que antes estaban hardcodeados ("324", desactualizado)
// en ~8 páginas + el blog. Para actualizar TODO el sitio tras un re-scrape:
// regenerar el JSON, copiarlo a app/data/ y `npm run build`.
//
// Dos números, según el contexto de la frase (decisión deliberada de honestidad):
//   RELEVADAS_TOTAL  (1.753) → "relevamos / analizamos N propiedades" (mercado completo).
//   RELEVADAS_MODELO (704)   → "el modelo se entrena con N" (solo Casa + Departamento).
import mercado from "@/app/data/mercado_sma.json";

export const RELEVADAS_TOTAL = mercado.relevadas.total;
export const RELEVADAS_MODELO = mercado.relevadas.usables_modelo;

export const RELEVADAS_TOTAL_FMT = RELEVADAS_TOTAL.toLocaleString("es-AR");
export const RELEVADAS_MODELO_FMT = RELEVADAS_MODELO.toLocaleString("es-AR");

export const MERCADO_GENERADO = mercado.generado;

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
