// POST /api/favorites/sync
// Sincroniza favoritos de localStorage hacia Supabase después de login

import { requireAuthenticatedUser } from "@/lib/auth";
import { syncFavorites } from "@/lib/userPreferences";

export async function POST(request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const { localFavorites } = body;

    if (!Array.isArray(localFavorites)) {
      return Response.json(
        { error: "Invalid localFavorites format" },
        { status: 400 }
      );
    }

    if (localFavorites.length === 0) {
      return Response.json({ synced: 0 });
    }

    const synced = await syncFavorites(user.id, localFavorites);

    console.log(
      `[favorites/sync] User ${user.id} synced ${synced.length} favorites`
    );

    return Response.json({ synced: synced.length });
  } catch (error) {
    console.error("[favorites/sync] error:", error);
    return Response.json(
      { error: error.message || "Failed to sync" },
      { status: 500 }
    );
  }
}
