// Capa de datos de SUSCRIPTORES (tabla `subscribers`). SOLO servidor: usa la
// clave secreta vía REST (ver lib/supabaseRest.js). La lectura/borrado del panel
// va detrás de requireUser (ver lib/auth.js); el alta pública va detrás de la
// API route app/api/suscripcion.
import { rest } from "./supabaseRest";

const TABLE = "subscribers";

// Campos que aceptamos al insertar (lista blanca).
const CAMPOS = ["email", "nombre", "interes", "source"];

// Da de alta un suscriptor. Si el email ya existe, no rompe: lo deja como está
// (merge-duplicates sobre la columna única `email`).
export async function insertSubscriber(input) {
  const row = {};
  for (const k of CAMPOS) if (input[k] !== undefined) row[k] = input[k];
  const data = await rest(`${TABLE}?on_conflict=email`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row),
  });
  return data?.[0] ?? null;
}

export async function getSubscribers() {
  return rest(`${TABLE}?select=*&order=created_at.desc`);
}

export async function deleteSubscriber(id) {
  await rest(`${TABLE}?id=eq.${Number(id)}`, { method: "DELETE" });
}

// Cantidad total de suscriptores activos (para el contador del panel).
export async function countSubscribers() {
  const rows = await rest(`${TABLE}?select=id&estado=eq.activo`);
  return Array.isArray(rows) ? rows.length : 0;
}
