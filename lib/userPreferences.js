// Capa de datos de preferencias de usuario (favoritos).
// SOLO servidor: usa REST con clave secreta.

import { rest } from "./supabaseRest";

const TABLE = "user_preferences";

// Obtener array de IDs de propiedades favoritas de un usuario
export async function getUserFavorites(userId) {
  if (!userId) return [];

  try {
    const rows = await rest(
      `${TABLE}?select=property_id&user_id=eq.${encodeURIComponent(userId)}`
    );
    return Array.isArray(rows) ? rows.map((r) => r.property_id) : [];
  } catch (err) {
    console.error("[getUserFavorites] error:", err);
    return [];
  }
}

// Agregar una propiedad a favoritos (upsert)
export async function addFavorite(userId, propertyId) {
  if (!userId || !propertyId) return null;

  try {
    const data = await rest(`${TABLE}?on_conflict=user_id,property_id`, {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        property_id: propertyId,
      }),
    });

    return data?.[0] ?? null;
  } catch (err) {
    console.error("[addFavorite] error:", err);
    return null;
  }
}

// Remover una propiedad de favoritos
export async function removeFavorite(userId, propertyId) {
  if (!userId || !propertyId) return;

  try {
    await rest(
      `${TABLE}?user_id=eq.${encodeURIComponent(userId)}&property_id=eq.${propertyId}`,
      { method: "DELETE" }
    );
  } catch (err) {
    console.error("[removeFavorite] error:", err);
  }
}

// Sincronizar múltiples favoritos (bulk insert)
export async function syncFavorites(userId, propertyIds) {
  if (!userId || !Array.isArray(propertyIds) || propertyIds.length === 0) {
    return [];
  }

  try {
    const results = [];
    for (const propId of propertyIds) {
      const result = await addFavorite(userId, Number(propId));
      if (result) results.push(result);
    }
    return results;
  } catch (err) {
    console.error("[syncFavorites] error:", err);
    return [];
  }
}

// Obtener lista de usuarios que tienen favoritas en un barrio específico
// Usado para enviar emails cuando llega propiedad nueva
export async function getUsersWithFavoritesInLocation(location) {
  if (!location) return [];

  try {
    // Query compleja: user_preferences JOIN properties para filtrar por location
    const query = `${TABLE}?select=user_id&properties(location,barrio)&properties.location=eq.${encodeURIComponent(location)}`;

    const rows = await rest(query);

    if (!Array.isArray(rows)) return [];

    // Extraer IDs únicos de usuarios
    const uniqueUserIds = [...new Set(rows.map((r) => r.user_id))];

    return uniqueUserIds;
  } catch (err) {
    console.error("[getUsersWithFavoritesInLocation] error:", err);
    return [];
  }
}

// Obtener detalles completos de propiedades favoritas de un user
// Útil para dashboard de favoritos
export async function getUserFavoritesWithDetails(userId) {
  if (!userId) return [];

  try {
    const rows = await rest(
      `${TABLE}?select=property_id,properties(id,title,price,location,barrio,bedrooms,bathrooms,area,photo,slug,roi)&user_id=eq.${encodeURIComponent(userId)}`
    );

    if (!Array.isArray(rows)) return [];

    return rows
      .map((r) => r.properties)
      .filter((p) => p)
      .flat();
  } catch (err) {
    console.error("[getUserFavoritesWithDetails] error:", err);
    return [];
  }
}

// Contar cuántas personas tienen una propiedad como favorita
export async function getPropertyFavoriteCount(propertyId) {
  if (!propertyId) return 0;

  try {
    const rows = await rest(
      `${TABLE}?select=id&property_id=eq.${propertyId}`
    );

    return Array.isArray(rows) ? rows.length : 0;
  } catch (err) {
    console.error("[getPropertyFavoriteCount] error:", err);
    return 0;
  }
}
