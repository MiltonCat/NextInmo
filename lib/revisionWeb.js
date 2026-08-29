// Arma la foto de analítica del sitio (GA4 + Search Console) en un solo objeto.
//
// Vive acá y no dentro de la route porque hay dos consumidores del mismo
// payload: `/api/revision-web` (lo pide el script de la máquina de Milton) y
// `/api/cron/revision-web-mail` (lo manda por correo todas las mañanas para
// que el bot de guardia lo lea sin necesitar el CRON_SECRET afuera de Vercel).

import {
  isAnalyticsConfigured,
  getAnalyticsOverview,
  summarizeCauses,
} from "@/lib/analytics";
import {
  isSearchConsoleConfigured,
  getSearchConsoleOverview,
  getSeoRadar,
} from "@/lib/searchConsole";

// Solo los rangos que ya expone el panel: evita que un ?dias=3650 dispare
// consultas carísimas contra la API de Google.
export const RANGOS_VALIDOS = [7, 28, 90];

export function normalizarDias(valor) {
  const pedido = Number(valor);
  return RANGOS_VALIDOS.includes(pedido) ? pedido : 28;
}

export async function construirRevisionWeb(dias) {
  const salida = {
    ok: true,
    generado: new Date().toISOString(),
    rangoDias: dias,
    ga4: { configurado: isAnalyticsConfigured() },
    searchConsole: { configurado: isSearchConsoleConfigured() },
    errores: [],
  };

  // Cada fuente se resuelve por separado: si Search Console falla, los datos
  // de GA4 igual sirven para la revisión. Un error parcial no vacía la
  // respuesta, solo se anota en `errores`.
  if (salida.ga4.configurado) {
    try {
      const overview = await getAnalyticsOverview(dias);
      salida.ga4.overview = overview;
      // Reutiliza la heurística del panel para explicar caídas.
      salida.ga4.causas = summarizeCauses(overview);
    } catch (error) {
      console.error("[revision-web] GA4", error);
      salida.errores.push("No se pudieron leer los datos de GA4.");
    }
  } else {
    salida.errores.push("GA4 sin configurar en este entorno.");
  }

  if (salida.searchConsole.configurado) {
    try {
      salida.searchConsole.overview = await getSearchConsoleOverview(dias);
    } catch (error) {
      console.error("[revision-web] GSC overview", error);
      salida.errores.push("No se pudo leer el resumen de Search Console.");
    }
    try {
      // Keywords en posición 5-20: las que están a un empujón del top 3.
      salida.searchConsole.radar = await getSeoRadar(dias);
    } catch (error) {
      console.error("[revision-web] GSC radar", error);
      salida.errores.push("No se pudo calcular el Radar SEO.");
    }
  } else {
    salida.errores.push("Search Console sin configurar en este entorno.");
  }

  return salida;
}
