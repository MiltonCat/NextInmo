// Chequeo de salud de las fuentes de datos.
//
// Existe para que un monitor externo (UptimeRobot, Better Stack, o el que sea)
// pueda preguntar "¿está sano el sitio?" sin depender de que alguien mire los
// logs de Vercel. Devuelve 200 si todas las fuentes contestan y 503 si alguna
// está caída, que es el contrato que entienden todos esos servicios: no hace
// falta configurar nada más que la URL para que avise por correo.
//
// Es público a propósito —un monitor gratuito no manda cabeceras de auth— así
// que la respuesta no incluye nada que no se pueda ver desde afuera: nombres de
// fuente, estado y latencia. Los mensajes de error de Supabase o de la API se
// quedan en los logs del servidor, donde ya los escribe `estadoDeSalud`.
import { estadoDeSalud } from "@/lib/salud";

export const runtime = "nodejs";
// Sin esto Next serviría una respuesta cacheada y el chequeo diría "ok" durante
// horas después de que algo se cayó, que es justo el problema que vino a
// resolver.
export const dynamic = "force-dynamic";

export async function GET() {
  const salud = await estadoDeSalud();

  // Se recorta a lo publicable: `motivo` lleva mensajes crudos de la base o de
  // la API y no tiene por qué salir del servidor.
  const fuentes = Object.fromEntries(
    Object.entries(salud.fuentes).map(([nombre, v]) => [nombre, { estado: v.estado, ms: v.ms }])
  );

  return Response.json(
    { ok: salud.ok, verificado: salud.verificado, fuentes, caidas: salud.caidas },
    {
      status: salud.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
