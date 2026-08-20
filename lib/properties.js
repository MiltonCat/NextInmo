// Capa de acceso a datos de propiedades.
// Lee desde Supabase y, si la base no responde, cae automáticamente al array
// estático de data/properties.js (resiliencia: la web nunca queda sin catálogo).
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { properties as fallbackProperties } from "@/data/properties";
import { normalizeImages } from "@/lib/photoImages";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// En servidor usamos la clave secreta; si no está, la publicable (lectura pública con RLS).
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let _client = null;
function getClient() {
  if (!url || !key) return null;
  if (!_client) {
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

// Campos que deben ser número aunque la base los devuelva como texto.
const NUMERIC_FIELDS = [
  "id", "price", "bedrooms", "bathrooms", "area", "roi",
  "lat", "lng", "precioAlquilerARS", "mesesMinimos",
];

function normalize(row) {
  const out = { ...row };
  for (const f of NUMERIC_FIELDS) {
    if (out[f] === null || out[f] === undefined || out[f] === "") {
      out[f] = out[f] === "" ? null : out[f];
    } else {
      const n = Number(out[f]);
      out[f] = Number.isNaN(n) ? out[f] : n;
    }
  }
  // features puede venir null; el código espera array.
  if (!Array.isArray(out.features)) out.features = out.features ?? [];

  // Galería completa: la columna `images` (sin límite de cantidad, cada foto
  // con su ambiente) si está cargada; si no —propiedades anteriores a la
  // migración, o el respaldo estático—, se arma desde los cinco campos
  // históricos. Siempre queda como array de { url, category }, así que la ficha
  // nunca tiene que preguntarse de dónde salió.
  //
  // `image`/`image1..4` se dejan intactos: las tarjetas, el SEO, el mapa y los
  // correos siguen leyéndolos y el panel los mantiene como espejo.
  out.images = normalizeImages(out.images, [out.image, out.image1, out.image2, out.image3, out.image4]);

  return out;
}

export async function getProperties() {
  const client = getClient();
  if (!client) return fallbackProperties.map(normalize);

  const { data, error } = await client
    .from("properties")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });

  if (error || !data || data.length === 0) {
    if (error) console.error("[properties] Error leyendo Supabase, uso respaldo:", error.message);
    return fallbackProperties.map(normalize);
  }
  return data.map(normalize);
}

export async function getPropertyById(id) {
  const all = await getProperties();
  return all.find((p) => Number(p.id) === Number(id)) ?? null;
}
