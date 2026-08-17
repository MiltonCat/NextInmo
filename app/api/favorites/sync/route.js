// POST /api/favorites/sync
//
// Sube los favoritos guardados en localStorage y devuelve la lista definitiva.
//
// Se llama en CADA carga de página, sin importar si hay sesión: es el servidor
// el que decide qué hacer. Esto es a propósito. La versión anterior gateaba la
// llamada con un hook de cliente que leía la sesión de `supabaseBrowser()`, y
// ese cliente se crea con `persistSession: false`, así que nunca veía sesión y
// el sync no se disparaba jamás. La sesión real vive en cookies httpOnly y solo
// el servidor puede leerla.
//
// Sin sesión responde `authenticated: false` y no escribe nada: el visitante
// anónimo sigue funcionando con localStorage como siempre.

import { getSessionUser } from "@/lib/auth";
import { getUserFavorites, syncFavorites } from "@/lib/userPreferences";

export async function POST(request) {
  try {
    const user = await getSessionUser();

    // Visitante sin cuenta: no es un error, es el caso normal.
    if (!user) {
      return Response.json({ authenticated: false, synced: 0, favorites: null });
    }

    let localFavorites = [];
    try {
      const body = await request.json();
      if (Array.isArray(body?.localFavorites)) {
        // Solo IDs numéricos válidos: lo que viene de localStorage es dato
        // del cliente y puede estar corrupto o manipulado.
        localFavorites = body.localFavorites
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0);
      }
    } catch {
      // Cuerpo inválido: seguimos igual y devolvemos lo que ya hay guardado.
    }

    if (localFavorites.length > 0) {
      await syncFavorites(user.id, localFavorites);
    }

    // La unión de lo local y lo que ya había en la cuenta. Devolverla permite
    // que el cliente adopte los favoritos guardados en otro dispositivo.
    const favorites = await getUserFavorites(user.id);

    return Response.json({
      authenticated: true,
      synced: localFavorites.length,
      favorites,
    });
  } catch (error) {
    console.error("[favorites/sync] error:", error);
    return Response.json({ error: "Failed to sync" }, { status: 500 });
  }
}
