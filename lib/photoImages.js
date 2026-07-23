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

// Normaliza una entrada de la galería a { url, category }.
// Acepta el formato viejo (string plano) y el nuevo (objeto), para no romper
// datos cargados antes de este cambio.
export function normalizeImageEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string") return { url: entry, category: null };
  if (typeof entry === "object" && entry.url) {
    return { url: entry.url, category: entry.category || null };
  }
  return null;
}

// Arma la galería completa a partir de la columna `images` (array, cualquier
// formato) o, si no existe, de los 5 campos legacy (image, image1..4).
export function normalizeImages(rawImages, legacyFields = []) {
  const source = Array.isArray(rawImages) && rawImages.length > 0 ? rawImages : legacyFields;
  return (source || []).map(normalizeImageEntry).filter(Boolean);
}
