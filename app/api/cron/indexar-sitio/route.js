// Mantiene al dia el indice semantico que usa Lucia (tabla sitio_fragmentos).
//
// Corre todas las noches. Compara el hash del texto de cada pagina publicada
// contra lo que ya esta indexado y solo reindexa lo que cambio: en un dia sin
// novedades no gasta un centavo en embeddings, solo lee las paginas.
//
// Es un cron y no un disparador de deploy a proposito: buena parte del sitio se
// arma con datos de Supabase —desarrollos, propiedades, el panel—, asi que hay
// paginas que cambian sin que haya deploy. Un disparador atado al build no las
// veria nunca.
//
// Auth: Bearer con CRON_SECRET. Vercel agrega ese header solo en las
// invocaciones de cron cuando la variable esta definida en el proyecto.
import "server-only";
import { SITE_URL } from "@/config";
import { indexarSitio } from "@/lib/indexadorSitio.mjs";
import { respuestasIndexables } from "@/data/respuestasDeLaCasa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Leer 35 paginas y embeber las que cambiaron no entra en el default.
export const maxDuration = 60;

// La funcion se corta a los 60 s. Se corta sola a los 45 para alcanzar a
// responder, y como maximo toca 8 paginas por corrida: lo que quede pendiente
// entra manana. Un reindexado completo se hace a mano con `npm run
// indexar-sitio -- --todo`, que no tiene este techo.
const MAX_PAGINAS = 8;
const MS_DISPONIBLES = 45_000;

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resumen = await indexarSitio({
      sitio: SITE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      secret: process.env.SUPABASE_SECRET_KEY,
      openaiKey: process.env.OPENAI_API_KEY,
      respuestasDeLaCasa: respuestasIndexables(),
      maxPaginas: MAX_PAGINAS,
      msDisponibles: MS_DISPONIBLES,
      log: (linea) => console.info("[indexar-sitio]", linea),
    });

    console.info("[indexar-sitio] corrida diaria", {
      indexadas: resumen.indexadas,
      fragmentos: resumen.fragmentos,
      sinCambios: resumen.sinCambios,
      retiradas: resumen.retiradas,
      pendientes: resumen.pendientes,
      omitidas: resumen.omitidas,
      segundos: resumen.segundos,
    });
    return Response.json({ ok: true, ...resumen });
  } catch (error) {
    console.error("[indexar-sitio] error", error?.message || error);
    return Response.json({ ok: false, error: "No se pudo indexar el sitio" }, { status: 500 });
  }
}
