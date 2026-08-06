import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { avatarDeGoogle, nombreVisible, inicial } from "@/lib/perfilVisitante";

/**
 * Foto y nombre del visitante logueado, para pintarlos en la barra superior.
 *
 * ¿Por qué una ruta de API y no leer la sesión en `app/layout.js`?
 *
 * El layout raíz envuelve TODO el sitio. Leer las cookies ahí obligaría a Next
 * a renderizar cada página en cada visita, y hoy las páginas de propiedades y
 * de barrios se generan estáticas: son las que traen el tráfico orgánico, que
 * es el único motor de crecimiento del proyecto. Cambiar eso para mostrar una
 * miniatura sería un pésimo negocio.
 *
 * Así, la barra se sirve estática como siempre y la foto aparece un instante
 * después, solo para quien tiene sesión.
 *
 * No devuelve nada más que estos tres campos: es una ruta pública en el sentido
 * de que cualquiera puede llamarla, y responde según la cookie de quien llama.
 * Sin sesión devuelve un objeto vacío, nunca un error.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();

  // `no-store` es obligatorio: es una respuesta personal. Sin esto, cualquier
  // caché intermedia podría servirle la foto de una persona a otra.
  const headers = { "Cache-Control": "no-store, private" };

  if (!user) return NextResponse.json({}, { headers });

  return NextResponse.json(
    {
      avatar: avatarDeGoogle(user),
      nombre: nombreVisible(user),
      inicial: inicial(user),
    },
    { headers }
  );
}
