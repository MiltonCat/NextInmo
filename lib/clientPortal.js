import "server-only";

import { createSupabaseServerClient } from "./supabaseServer";
import { getProperties } from "./properties";

function throwQueryError(label, error) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

export async function getClientPortalData(userId) {
  const supabase = await createSupabaseServerClient();

  // Incluso para un admin, /cuenta fija el user_id: este portal jamás es una
  // vista global ni depende de que la UI oculte filas.
  const [profileResult, favoritesResult, valuationsResult, ownersResult] = await Promise.all([
    supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle(),
    supabase
      .from("client_favorites")
      .select("property_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_valuations")
      .select("id, label, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("property_owners")
      .select("property_id, assigned_at")
      .eq("user_id", userId)
      .order("assigned_at", { ascending: false }),
  ]);

  throwQueryError("profiles", profileResult.error);
  throwQueryError("client_favorites", favoritesResult.error);
  throwQueryError("saved_valuations", valuationsResult.error);
  throwQueryError("property_owners", ownersResult.error);

  const favoriteIds = (favoritesResult.data || []).map((row) => Number(row.property_id));
  const ownedIds = (ownersResult.data || []).map((row) => Number(row.property_id));

  const [allProperties, inquiriesResult, performanceResult] = await Promise.all([
    getProperties(),
    ownedIds.length
      ? supabase
          .from("inquiries")
          .select("id, created_at, tipo, nombre, email, telefono, mensaje, property_id, property_title, estado")
          .in("property_id", ownedIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    ownedIds.length
      ? supabase
          .from("property_performance_daily")
          .select("property_id, metric_date, detail_views, favorite_adds, inquiries_received")
          .in("property_id", ownedIds)
          .order("metric_date", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  throwQueryError("inquiries", inquiriesResult.error);
  throwQueryError("property_performance_daily", performanceResult.error);

  const byId = new Map(allProperties.map((property) => [Number(property.id), property]));

  return {
    role: profileResult.data?.role || "client",
    favorites: favoriteIds.map((id) => byId.get(id)).filter(Boolean),
    valuations: valuationsResult.data || [],
    ownedProperties: ownedIds.map((id) => byId.get(id)).filter(Boolean),
    ownerInquiries: inquiriesResult.data || [],
    performance: (performanceResult.data || []).map((row) => ({
      ...row,
      property: byId.get(Number(row.property_id)) || null,
    })),
  };
}
