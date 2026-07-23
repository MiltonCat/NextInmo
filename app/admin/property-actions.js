"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getNextIds,
  insertProperty,
  updateProperty as dbUpdate,
  deleteProperty as dbDelete,
  uploadImage,
} from "@/lib/adminDb";

// --- helpers de parseo del formulario ---
function num(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
function str(v) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}
function bool(v) {
  return v === "on" || v === "true" || v === true;
}
function featuresArr(v) {
  return String(v ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function buildRowFromForm(formData) {
  const row = {
    title: str(formData.get("title")),
    type: str(formData.get("type")),
    operation: str(formData.get("operation")),
    location: str(formData.get("location")),
    price: num(formData.get("price")),
    bedrooms: num(formData.get("bedrooms")),
    bathrooms: num(formData.get("bathrooms")),
    area: num(formData.get("area")),
    description: str(formData.get("description")),
    features: featuresArr(formData.get("features")),
    roi: num(formData.get("roi")),
    lat: num(formData.get("lat")),
    lng: num(formData.get("lng")),
    precioAlquilerARS: num(formData.get("precioAlquilerARS")),
    disponibleDesde: str(formData.get("disponibleDesde")),
    mesesMinimos: num(formData.get("mesesMinimos")),
    condiciones: str(formData.get("condiciones")),
    vendida: bool(formData.get("vendida")),
    alquilada: bool(formData.get("alquilada")),
    reservada: bool(formData.get("reservada")),
  };

  row.modalidad = row.operation === "alquiler" ? "alquiler_permanente" : row.operation;

  // Imágenes: cantidad libre, cada una con su categoría de ambiente (Cocina,
  // Dormitorio, etc.) para armar el recorrido fotográfico agrupado.
  // `existing_images` (JSON de {url,category}) trae las fotos ya guardadas
  // en el orden final que eligió el admin (reordenadas/eliminadas/recategorizadas
  // vía ImagesManager); `new_images` son los archivos nuevos, que se suben y
  // se agregan al final con la categoría paralela de `new_images_categories`.
  // `images[0]` es siempre la portada.
  let existingImages = [];
  try {
    const parsed = JSON.parse(str(formData.get("existing_images")) || "[]");
    existingImages = Array.isArray(parsed)
      ? parsed.map((img) => ({ url: img?.url, category: img?.category || null })).filter((img) => img.url)
      : [];
  } catch {
    existingImages = [];
  }

  let newCategories = [];
  try {
    const parsed = JSON.parse(str(formData.get("new_images_categories")) || "[]");
    newCategories = Array.isArray(parsed) ? parsed : [];
  } catch {
    newCategories = [];
  }

  const newFiles = formData.getAll("new_images")
    .filter((f) => f && typeof f === "object" && typeof f.arrayBuffer === "function" && f.size > 0);
  const uploadedEntries = [];
  for (let i = 0; i < newFiles.length; i++) {
    const url = await uploadImage(newFiles[i]);
    uploadedEntries.push({ url, category: newCategories[i] || null });
  }

  const images = [...existingImages, ...uploadedEntries].filter((img) => img.url);
  row.images = images;
  // Mirror de los primeros 5 (solo la url) en las columnas legacy, por
  // compatibilidad con el resto del sitio (tarjetas, SEO, mapa) que todavía
  // lee `image`/`image1..4`.
  row.image = images[0]?.url ?? null;
  row.image1 = images[1]?.url ?? null;
  row.image2 = images[2]?.url ?? null;
  row.image3 = images[3]?.url ?? null;
  row.image4 = images[4]?.url ?? null;

  return row;
}

// Refresca las páginas públicas que muestran propiedades.
function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath("/alquileres");
  revalidatePath("/favoritos");
  revalidatePath("/propiedades/[slug]", "page");
  revalidatePath("/admin");
}

export async function createProperty(prevState, formData) {
  await requireUser();
  try {
    const row = await buildRowFromForm(formData);
    if (!row.title) return { error: "El título es obligatorio." };
    const { nextId, nextSort } = await getNextIds();
    row.id = nextId;
    row.sort_order = nextSort;
    await insertProperty(row);
  } catch (e) {
    return { error: e.message };
  }
  revalidatePublic();
  redirect("/admin");
}

export async function editProperty(prevState, formData) {
  await requireUser();
  const id = num(formData.get("id"));
  if (!id) return { error: "Falta el identificador de la propiedad." };
  try {
    const row = await buildRowFromForm(formData);
    if (!row.title) return { error: "El título es obligatorio." };
    await dbUpdate(id, row);
  } catch (e) {
    return { error: e.message };
  }
  revalidatePublic();
  redirect("/admin");
}

export async function removeProperty(formData) {
  await requireUser();
  const id = num(formData.get("id"));
  if (!id) return;
  await dbDelete(id);
  revalidatePublic();
  redirect("/admin");
}
