"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireUser } from "@/lib/auth";
import { notifyUsersAboutNewProperty } from "@/lib/emailNuevaPropiedad";
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
    // Barrio elegido a mano. `location` es texto libre y casi nunca lo nombra,
    // así que sin este campo la propiedad no aparece en su ficha de barrio ni
    // en el bloque de /precio-m2 (ver barrioDePropiedad en lib/barrios.js).
    barrio: str(formData.get("barrio")),
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

// ¿Corresponde avisar por correo de esta propiedad recién cargada?
//
// Se exige que el aviso esté tildado, que haya barrio (sin él no hay con qué
// cruzar los favoritos) y que la propiedad esté efectivamente disponible.
// Devuelve el motivo cuando no corresponde, para dejarlo en el log: si Milton
// espera un correo y no llega, el log dice exactamente por qué.
function motivoParaNoAvisar(row, pidioAviso) {
  if (!pidioAviso) return "el aviso quedó destildado en el formulario";
  if (!row.barrio) return "la propiedad no tiene barrio cargado";
  if (row.vendida) return "está marcada como vendida";
  if (row.alquilada) return "está marcada como alquilada";
  if (row.reservada) return "está marcada como reservada";
  return null;
}

export async function createProperty(prevState, formData) {
  await requireUser();
  let row;
  try {
    row = await buildRowFromForm(formData);
    if (!row.title) return { error: "El título es obligatorio." };
    const { nextId, nextSort } = await getNextIds();
    row.id = nextId;
    row.sort_order = nextSort;
    await insertProperty(row);
  } catch (e) {
    return { error: e.message };
  }

  // El aviso va DESPUÉS de que la propiedad quedó guardada, y fuera del camino
  // de la respuesta: mandar varios correos por SMTP tarda segundos y no puede
  // dejar a Milton mirando un formulario colgado. `after()` los manda una vez
  // que la página ya respondió.
  //
  // Un fallo acá nunca revierte el alta: la propiedad ya está publicada y eso
  // es lo que importa. El error queda en el log de Vercel.
  const motivo = motivoParaNoAvisar(row, bool(formData.get("avisarPorCorreo")));
  if (motivo) {
    console.log(`[alta de propiedad ${row.id}] sin aviso por correo: ${motivo}.`);
  } else {
    after(async () => {
      try {
        const r = await notifyUsersAboutNewProperty(row);
        console.log(
          `[alta de propiedad ${row.id}] aviso enviado a ${r.enviados} de ${r.destinatarios} personas con favoritos en "${row.barrio}".`
        );
      } catch (e) {
        console.error(`[alta de propiedad ${row.id}] falló el aviso por correo:`, e);
      }
    });
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
