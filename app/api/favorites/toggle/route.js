// POST /api/favorites/toggle
//
// Persiste un corazón en la cuenta. El cliente lo llama siempre que alguien
// marca o desmarca, sin saber si hay sesión: si no hay, acá se ignora.
//
// Se usa `getSessionUser` y no `requireAuthenticatedUser` porque ese último
// hace `redirect()`, y un redirect como respuesta a un `fetch` no es un error
// que el cliente pueda interpretar — devuelve HTML del login con status 307.

import { getSessionUser } from "@/lib/auth";
import { addFavorite, removeFavorite } from "@/lib/userPreferences";

export async function POST(request) {
  try {
    const user = await getSessionUser();

    // Sin cuenta el favorito vive solo en localStorage. No es un error.
    if (!user) {
      return Response.json({ authenticated: false, saved: false });
    }

    const body = await request.json();
    const propertyId = Number(body?.propertyId);
    const isFavorite = Boolean(body?.isFavorite);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return Response.json({ error: "propertyId inválido" }, { status: 400 });
    }

    if (isFavorite) {
      await addFavorite(user.id, propertyId);
    } else {
      await removeFavorite(user.id, propertyId);
    }

    return Response.json({ authenticated: true, saved: true });
  } catch (error) {
    console.error("[favorites/toggle] error:", error);
    return Response.json({ error: "Failed to toggle" }, { status: 500 });
  }
}
