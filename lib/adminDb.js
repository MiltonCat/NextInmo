// Operaciones de ESCRITURA sobre Supabase para el panel /admin.
// Usa la API REST (PostgREST + Storage) con la clave secreta, sin supabase-js,
// para máxima fiabilidad en el servidor. SOLO servidor; siempre detrás de
// una verificación de sesión (ver requireUser en lib/auth.js).
import "server-only";

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

// Nombre de archivo dentro del bucket. Lo elige siempre el servidor: del
// nombre original solo se aprovecha la extensión, y validada contra una lista,
// porque termina formando parte de una ruta pública.
const EXTENSIONES_DE_IMAGEN = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "heic",
  "heif",
]);

function rutaParaFoto(nombreOriginal, prefix = "prop") {
  const ext = String(nombreOriginal || "").split(".").pop()?.toLowerCase() || "";
  const extension = EXTENSIONES_DE_IMAGEN.has(ext) ? ext : "jpg";
  return `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
}

// Sube un File al bucket y devuelve la URL pública.
//
// Camino de respaldo: hoy el panel sube las fotos desde el navegador (ver
// crearSubidaFirmada). Esto sigue acá porque las Server Actions tienen que
// funcionar igual si el JavaScript del formulario no llegó a cargar, y porque
// lo usan las cargas por script. Ojo: por acá la foto viaja dentro del request
// a Vercel, así que le aplica el tope de 4,5 MB.
export async function uploadImage(file, prefix = "prop") {
  const path = rutaParaFoto(file.name, prefix);
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

// Prepara una subida DIRECTA del navegador al bucket, sin pasar por Vercel.
//
// Vercel rechaza con 413 cualquier request de más de 4,5 MB *antes* de invocar
// la función. Es un tope de la plataforma: `serverActions.bodySizeLimit` de
// Next no lo puede levantar (solo aplica en `next dev`, y de ahí venía la
// confusión). Mandar cinco fotos de ~2 MB dentro de la Server Action lo
// superaba siempre, y en vez del formulario aparecía la pantalla de error de
// Vercel, sin pasar nunca por el catch de createProperty.
//
// Ahora el servidor solo firma un permiso de un solo uso —vale unos minutos y
// sirve únicamente para esa ruta del bucket—; el archivo viaja del navegador a
// Supabase y a la Server Action le llega nada más que la URL pública.
export async function crearSubidaFirmada(nombreOriginal, prefix = "prop") {
  const path = rutaParaFoto(nombreOriginal, prefix);

  const res = await fetch(`${URL_BASE}/storage/v1/object/upload/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: "{}",
  });
  const texto = await res.text();
  if (!res.ok) throw new Error(`Storage ${res.status}: ${texto}`);

  // Supabase devuelve { url: "/object/upload/sign/<bucket>/<path>?token=..." }.
  const { url } = JSON.parse(texto);
  const token = new URL(`${URL_BASE}/storage/v1${url}`).searchParams.get("token");
  if (!token) throw new Error("Supabase no devolvió el permiso de subida.");

  return {
    bucket: BUCKET,
    path,
    token,
    urlPublica: `${URL_BASE}/storage/v1/object/public/${BUCKET}/${path}`,
  };
}
