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

export default mercado;
