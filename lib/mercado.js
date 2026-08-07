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

export const fmtUSD = (n) =>
  typeof n === "number" ? `USD ${n.toLocaleString("es-AR")}` : "—";

export default mercado;
