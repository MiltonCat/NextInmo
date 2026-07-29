// Endpoint de solo lectura que devuelve la foto de analítica del sitio
// (GA4 + Search Console) en un único JSON.
//
// Existe para que la revisión diaria pueda hacerse desde afuera —el skill
// /revision-web— sin bajar las credenciales de Google a una máquina local:
// corre en Vercel, donde GA_PRIVATE_KEY y compañía ya viven.
//
// Auth: Bearer con CRON_SECRET, el mismo esquema que /api/cron/seo-radar.
// No usa requireUser porque eso hace redirect() al login, útil en páginas e
// inservible para un cliente que espera JSON.
//
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//        "https://<tu-dominio>/api/revision-web?dias=7"

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

// La API de GA4 usa gRPC: necesita runtime Node y datos siempre frescos.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Solo los rangos que ya expone el panel: evita que un ?dias=3650 dispare
// consultas carísimas contra la API de Google.
const RANGOS_VALIDOS = [7, 28, 90];

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const pedido = Number(new URL(request.url).searchParams.get("dias"));
  const dias = RANGOS_VALIDOS.includes(pedido) ? pedido : 28;

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

  return Response.json(salida);
}
