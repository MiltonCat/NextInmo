// Operaciones de ESCRITURA sobre Supabase para el panel /admin.
// Usa la API REST (PostgREST + Storage) con la clave secreta, sin supabase-js,
// para máxima fiabilidad en el servidor. SOLO servidor; siempre detrás de
// una verificación de sesión (ver requireUser en lib/auth.js).
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const BUCKET = "property-images";
const TABLE = "properties";

function authHeaders(extra = {}) {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}`, ...extra };
}

async function rest(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: authHeaders({ "Content-Type": "application/json", ...init.headers }),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = body?.message || body?.hint || text || res.statusText;
    throw new Error(`Supabase ${res.status}: ${msg}`);
  }
  return body;
}

// Próximos id y sort_order disponibles (para que las nuevas queden al final).
export async function getNextIds() {
  const rows = await rest(`${TABLE}?select=id,sort_order&order=id.desc&limit=1000`);
  const maxId = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  const maxSort = rows.reduce((m, r) => Math.max(m, Number(r.sort_order) || 0), 0);
  return { nextId: maxId + 1, nextSort: maxSort + 1 };
}

export async function getPropertyByIdAdmin(id) {
  const rows = await rest(`${TABLE}?id=eq.${Number(id)}&select=*&limit=1`);
  return rows?.[0] ?? null;
}

export async function insertProperty(row) {
  const data = await rest(TABLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  return data?.[0] ?? null;
}

export async function updateProperty(id, patch) {
  const data = await rest(`${TABLE}?id=eq.${Number(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  return data?.[0] ?? null;
}

export async function deleteProperty(id) {
  await rest(`${TABLE}?id=eq.${Number(id)}`, { method: "DELETE" });
}

// Sube un File al bucket y devuelve la URL pública.
export async function uploadImage(file, prefix = "prop") {
  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": file.type || "application/octet-stream" }),
    body: buffer,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Storage ${res.status}: ${msg}`);
  }
  return `${URL_BASE}/storage/v1/object/public/${BUCKET}/${path}`;
}
