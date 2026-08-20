import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/adminAccess";
import { crearSubidaFirmada } from "@/lib/adminDb";

/**
 * Firma un permiso de subida para UNA foto del panel.
 *
 * Existe por el tope de 4,5 MB que Vercel le impone al cuerpo de cualquier
 * request: cinco fotos de propiedad no entran nunca, y el rechazo ocurre antes
 * de que la Server Action llegue a ejecutarse, así que no había forma de
 * mostrar un error decente. Ahora el navegador sube cada archivo directo al
 * Storage de Supabase con el permiso que devuelve esta ruta, y al formulario
 * solo le queda mandar texto.
 *
 * El permiso lo firma la clave secreta, que nunca sale del servidor: sirve para
 * una única ruta del bucket, elegida acá, y caduca en minutos. Aun así la ruta
 * exige sesión de administrador, para que nadie más pueda pedir permisos.
 *
 * `requireUser` no sirve en una route handler: redirige al login y el fetch
 * recibiría el HTML del login en lugar de un error. Por eso se comprueba a mano
 * y se responde 401 en JSON.
 */
export const dynamic = "force-dynamic";

const SIN_CACHE = { "Cache-Control": "no-store, private" };

export async function POST(request) {
  const user = await getSessionUser();
  if (!isAdminUser(user)) {
    return NextResponse.json(
      { error: "Se cerró la sesión del panel. Volvé a entrar y probá de nuevo." },
      { status: 401, headers: SIN_CACHE }
    );
  }

  let cuerpo = {};
  try {
    cuerpo = await request.json();
  } catch {
    // Sin cuerpo se usa la extensión por defecto; no es motivo para fallar.
  }

  try {
    const permiso = await crearSubidaFirmada(cuerpo?.nombre);
    return NextResponse.json(permiso, { headers: SIN_CACHE });
  } catch (e) {
    console.error("[foto-firmada] no se pudo firmar la subida:", e);
    return NextResponse.json(
      { error: `No se pudo preparar la subida de la foto: ${e.message}` },
      { status: 500, headers: SIN_CACHE }
    );
  }
}
