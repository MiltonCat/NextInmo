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

const IMAGE_FIELDS = ["image", "image1", "image2", "image3", "image4"];

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

  // Imágenes: si se subió un archivo nuevo, se sube y se usa su URL;
  // si no, se conserva la URL actual (campo oculto `<campo>_current`).
  for (const field of IMAGE_FIELDS) {
    const file = formData.get(field);
    if (file && typeof file === "object" && typeof file.arrayBuffer === "function" && file.size > 0) {
      row[field] = await uploadImage(file);
    } else {
      row[field] = str(formData.get(`${field}_current`));
    }
  }

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
