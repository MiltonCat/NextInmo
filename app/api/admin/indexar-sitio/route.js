import { NextResponse } from "next/server";
import { SITE_URL } from "@/config";
import { indexarSitio } from "@/lib/indexadorSitio.mjs";
import { respuestasIndexables } from "@/data/respuestasDeLaCasa";
import { getSessionUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/adminAccess";

/**
 * Pone al día, a pedido, el índice semántico que usa Lucía (sitio_fragmentos).
 *
 * Existe porque el cron corre una vez por día a las 9: si se publica una nota a
 * las diez de la mañana, hasta el día siguiente Lucía no la ve. Esta ruta es el
 * "ya está publicado, miralo ahora" — el mismo motor y el mismo criterio de
 * hashes que la corrida diaria, sin esperar el turno.
 *
 * No usa CRON_SECRET: eso es para las invocaciones de Vercel. Acá hay una
 * persona logueada, así que se exige sesión de administrador. `requireUser` no
 * sirve en una route handler —redirige al login y el fetch recibiría el HTML
 * del login en lugar de un error—, así que se comprueba a mano y se responde
 * 401 en JSON, igual que en /api/admin/foto-firmada.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Leer el sitio entero y embeber lo que cambió no entra en el default.
export const maxDuration = 60;

const SIN_CACHE = { "Cache-Control": "no-store, private" };

// Más alto que el techo del cron: cuando alguien aprieta el botón está mirando
// la pantalla y lo que quiere es que entre TODO lo que subió, no una tanda.
const MAX_PAGINAS = 20;
const MS_DISPONIBLES = 45_000;

export async function POST() {
  const user = await getSessionUser();
  if (!isAdminUser(user)) {
    return NextResponse.json(
      { error: "Se cerró la sesión del panel. Volvé a entrar y probá de nuevo." },
      { status: 401, headers: SIN_CACHE }
    );
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
      log: (linea) => console.info("[indexar-sitio/admin]", linea),
    });

    return NextResponse.json(
      {
        ok: true,
        indexadas: resumen.indexadas,
        fragmentos: resumen.fragmentos,
        sinCambios: resumen.sinCambios,
        pendientes: resumen.pendientes,
        paginas: resumen.paginas,
        segundos: resumen.segundos,
      },
      { headers: SIN_CACHE }
    );
  } catch (e) {
    console.error("[indexar-sitio/admin] no se pudo actualizar el índice:", e);
    return NextResponse.json(
      { error: `No se pudo actualizar el índice: ${e.message}` },
      { status: 500, headers: SIN_CACHE }
    );
  }
}
