// Categorías de fotos por ambiente (estilo "Recorrido fotográfico" de Airbnb).
// Se comparte entre el admin (selector por foto) y la ficha pública (agrupado).
export const PHOTO_CATEGORIES = [
  { value: "cocina", label: "Cocina" },
  { value: "dormitorio", label: "Dormitorio" },
  { value: "bano", label: "Baño" },
  { value: "exterior", label: "Exterior" },
  { value: "otros", label: "Otros" },
];

// Fotos sin categoría asignada (todas las cargadas antes de esta función,
// y cualquier foto nueva mientras no se le elija un ambiente). Se agrupan
// al final, como "Fotos adicionales" en Airbnb.
export const UNCATEGORIZED = { value: null, label: "Fotos adicionales" };

// ── Video ───────────────────────────────────────────────────────────────────
//
// La galería mezcla fotos y video en un solo array ordenado, y cada entrada
// dice qué es con `kind` ("image" | "video").
//
// El tipo NO se confía a lo que venga guardado: se deduce de la extensión de
// la URL. Así las entradas cargadas antes de este cambio —que no tienen
// `kind`— se clasifican bien igual, y una entrada con el `kind` mal puesto (a
// mano, por script, por un JSON viejo) no puede lograr que un mp4 termine
// dibujado como <img>. Manda la extensión porque es lo que el navegador va a
// respetar cuando pida el archivo.
export const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v"]);

export function esVideo(url) {
  const limpia = String(url || "").split("?")[0].split("#")[0];
  const ext = limpia.split(".").pop()?.toLowerCase() || "";
  return VIDEO_EXTENSIONS.has(ext);
}

// Normaliza una entrada de la galería a { url, category, kind }.
// Acepta el formato viejo (string plano) y el nuevo (objeto), para no romper
// datos cargados antes de este cambio.
export function normalizeImageEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string") {
    return { url: entry, category: null, kind: esVideo(entry) ? "video" : "image" };
  }
  if (typeof entry === "object" && entry.url) {
    return {
      url: entry.url,
      category: entry.category || null,
      kind: esVideo(entry.url) ? "video" : "image",
    };
  }
  return null;
}

// Solo las fotos. Lo usa todo lo que no sabe reproducir video: la grilla de la
// ficha, el Lightbox, las tarjetas del listado, el SEO, el mapa y los correos.
export function soloFotos(entries = []) {
  return (entries || []).filter((e) => e && e.kind !== "video");
}

export function soloVideos(entries = []) {
  return (entries || []).filter((e) => e && e.kind === "video");
}

// Garantiza que la primera entrada de la galería sea una foto.
//
// `images[0]` es la portada, y de ahí salen la tarjeta del listado, la imagen
// del SEO (og:image) y la del correo de aviso de propiedad nueva. Ninguno de
// los tres sabe qué hacer con un mp4: la tarjeta dibuja un <img> roto y el
// correo manda <img src="…mp4">, que en Gmail se ve como un cuadro vacío. Si
// el video quedó primero, se lo baja detrás de la primera foto y el resto
// conserva su orden.
//
// Si la galería es solo video no hay nada que reordenar y se devuelve igual:
// quien consuma la portada tiene que bancarse que no haya (ver soloFotos).
export function conPortadaDeFoto(entries = []) {
  const lista = entries || [];
  const primeraFoto = lista.findIndex((e) => e && e.kind !== "video");
  if (primeraFoto <= 0) return lista;
  return [lista[primeraFoto], ...lista.filter((_, i) => i !== primeraFoto)];
}


// ¿La foto se sirve desde el Storage de Supabase (URL absoluta) o desde
// public/imgs (ruta local)?
//
// Importa porque las dos se dibujan con next/image pero no se pueden servir
// igual: las locales las optimiza Vercel sin problema —son parte del deploy—
// mientras que las remotas dependen de que el optimizador pueda ir a buscarlas
// al bucket, y cuando eso falla la foto no se dibuja y no hay aviso en ningún
// lado: el visitante ve un hueco. Por eso las galerías le pasan
// `unoptimized` a next/image cuando la URL es remota: la foto va del bucket al
// navegador sin intermediario.
export function esRemota(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

// Arma la galería completa a partir de la columna `images` (array, cualquier
// formato) o, si no existe, de los 5 campos legacy (image, image1..4).
export function normalizeImages(rawImages, legacyFields = []) {
  const source = Array.isArray(rawImages) && rawImages.length > 0 ? rawImages : legacyFields;
  return (source || []).map(normalizeImageEntry).filter(Boolean);
}
