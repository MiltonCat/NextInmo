// Capa de datos del mini-CRM (tabla `inquiries`). SOLO servidor: usa la clave
// secreta vía REST (ver lib/supabaseRest.js). Las lecturas/escrituras del panel
// van siempre detrás de requireUser (ver lib/auth.js); la inserción pública va
// detrás de la API route app/api/consultas.
import { rest } from "./supabaseRest";

const TABLE = "inquiries";

// Campos que aceptamos al insertar (lista blanca para no guardar basura del body).
const CAMPOS = ["tipo", "nombre", "telefono", "email", "mensaje", "property_id", "property_title", "detalle"];

export async function insertInquiry(input) {
  const row = {};
  for (const k of CAMPOS) if (input[k] !== undefined) row[k] = input[k];
  const data = await rest(TABLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  return data?.[0] ?? null;
}

export async function getInquiries({ estado, tipo } = {}) {
  const params = new URLSearchParams({ select: "*", order: "created_at.desc" });
  if (estado) params.set("estado", `eq.${estado}`);
  if (tipo) params.set("tipo", `eq.${tipo}`);
  return rest(`${TABLE}?${params.toString()}`);
}

export async function updateInquiry(id, patch) {
  const data = await rest(`${TABLE}?id=eq.${Number(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  return data?.[0] ?? null;
}

export async function deleteInquiry(id) {
  await rest(`${TABLE}?id=eq.${Number(id)}`, { method: "DELETE" });
}

// Cantidad de consultas en estado "nuevo" (para el contador del panel).
export async function countNuevas() {
  const rows = await rest(`${TABLE}?select=id&estado=eq.nuevo`, {
    headers: { Prefer: "count=exact" },
  });
  return Array.isArray(rows) ? rows.length : 0;
}
