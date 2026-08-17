// POST /api/favorites/toggle
// Agrega o remueve una propiedad de favoritos para user autenticado

import { requireAuthenticatedUser } from "@/lib/auth";
import { addFavorite, removeFavorite } from "@/lib/userPreferences";

export async function POST(request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const { propertyId, isFavorite } = body;

    if (!propertyId) {
      return Response.json(
        { error: "Missing propertyId" },
        { status: 400 }
      );
    }

    if (isFavorite) {
      await addFavorite(user.id, Number(propertyId));
      console.log(`[favorites/toggle] User ${user.id} added ${propertyId}`);
    } else {
      await removeFavorite(user.id, Number(propertyId));
      console.log(`[favorites/toggle] User ${user.id} removed ${propertyId}`);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[favorites/toggle] error:", error);
    return Response.json(
      { error: error.message || "Failed to toggle" },
      { status: 500 }
    );
  }
}
