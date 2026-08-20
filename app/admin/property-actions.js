"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireUser } from "@/lib/auth";
import { notifyUsersAboutNewProperty } from "@/lib/emailNuevaPropiedad";
import { barrioDePropiedad } from "@/lib/barrios";
import {
  getNextIds,
  insertProperty,
  updateProperty as dbUpdate,
  deleteProperty as dbDelete,
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

  // Imágenes. Ya no viaja ningún archivo por acá: ImagesManager las sube al
  // Storage desde el navegador y manda la galería final —ordenada, con el
  // ambiente de cada foto— en un único campo de texto.
  //
  //   [{"url": "https://…/cocina.jpg", "category": "cocina"}, …]
  //
  // `images[0]` es la portada. Un JSON roto no puede tumbar el alta: se toma
  // como galería vacía y la propiedad se guarda igual, sin fotos.
  row.images = parseImagesJson(formData.get("images_json"));

  // Espejo de las primeras cinco en las columnas históricas. Las tarjetas, el
  // SEO, el mapa, la exportación de ficha y el correo de aviso siguen leyendo
  // `image`/`image1..4`, y así no se enteran del cambio. Se escriben siempre,
  // incluso en null, para que al borrar una foto no quede una URL vieja
  // colgada en la columna.
  row.image = row.images[0]?.url ?? null;
  row.image1 = row.images[1]?.url ?? null;
  row.image2 = row.images[2]?.url ?? null;
  row.image3 = row.images[3]?.url ?? null;
  row.image4 = row.images[4]?.url ?? null;

  return row;
}

// Lee el campo `images_json` del formulario. Descarta entradas sin URL y
// normaliza la categoría ausente a null, para que en la base nunca quede una
// foto a medio formar.
function parseImagesJson(raw) {
  let parsed;
  try {
    parsed = JSON.parse(String(raw ?? "") || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((img) => ({ url: str(img?.url), category: str(img?.category) }))
    .filter((img) => img.url);
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
  // Igual que el resto del sitio: vale el barrio elegido a mano y también el
  // deducido de la Ubicación, que es lo que hace la opción "Deducir de la
  // ubicación" del formulario.
  if (!barrioDePropiedad(row)) {
    return `no se pudo determinar el barrio (campo vacío y la ubicación "${row.location || ""}" no permite deducirlo)`;
  }
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
          `[alta de propiedad ${row.id}] aviso enviado a ${r.enviados} de ${r.destinatarios} personas ` +
            `con favoritos en "${barrioDePropiedad(row)?.slug}".`
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
