import { SITE_URL, WA_NUMBER } from "@/config";

export function whatsappUrl(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message.trim())}`;
}

function cleanTitle(title = "") {
  return title.split("|")[0].trim();
}

export function contextualPageMessage(pathname = "/", title = "") {
  const path = pathname || "/";
  const pageUrl = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const pageTitle = cleanTitle(title);

  if (path.startsWith("/blog/")) {
    return `Hola Milton, estoy leyendo ${pageTitle ? `“${pageTitle}”` : "un artículo del blog"} y quisiera hacerte una consulta sobre este tema.\n\n${pageUrl}`;
  }
  if (path.startsWith("/inversiones")) {
    return `Hola Milton, estoy analizando opciones de inversión en San Martín de los Andes y quisiera contarte mi presupuesto y objetivo.\n\n${pageUrl}`;
  }
  if (path.startsWith("/tasacion") || path.startsWith("/vender")) {
    return `Hola Milton, quiero conocer el valor de mi propiedad y recibir asesoramiento para venderla. ¿Qué datos necesitás?\n\n${pageUrl}`;
  }
  if (path.startsWith("/precio-m2")) {
    return `Hola Milton, estuve viendo los precios por m² de San Martín de los Andes y quisiera consultar por una zona o propiedad puntual.\n\n${pageUrl}`;
  }
  if (path.startsWith("/simulador-credito")) {
    return `Hola Milton, estuve usando el simulador de crédito y quisiera saber qué propiedades podrían ajustarse a mi presupuesto.\n\n${pageUrl}`;
  }
  if (path.startsWith("/favoritos")) {
    return `Hola Milton, guardé algunas propiedades en favoritos y quisiera compararlas con vos.\n\n${pageUrl}`;
  }
  if (path.startsWith("/propiedades") || path.startsWith("/alquileres")) {
    return `Hola Milton, estoy buscando una propiedad en San Martín de los Andes. ¿Te puedo contar qué necesito?\n\n${pageUrl}`;
  }
  if (path.startsWith("/centro-ayuda")) {
    return `Hola Milton, recorrí el centro de ayuda de la web y todavía tengo una consulta. ¿Podés orientarme?\n\n${pageUrl}`;
  }

  return `Hola Milton, estoy recorriendo la web de Catalán Propiedades y quisiera hacerte una consulta.\n\n${pageUrl}`;
}

export function propertyPriceLabel(property) {
  if (property.modalidad === "alquiler_permanente") {
    return property.precioAlquilerARS
      ? `$ ${Number(property.precioAlquilerARS).toLocaleString("es-AR")} por mes`
      : "Precio a consultar";
  }
  return property.price
    ? `USD ${Number(property.price).toLocaleString("es-AR")}`
    : "Precio a consultar";
}

export function propertyWhatsappMessage(property, { action = "consultar", note = "", url = "" } = {}) {
  const intro = action === "visitar"
    ? "quiero coordinar una visita"
    : action === "similar"
      ? "vi esta publicación y estoy buscando una opción similar"
      : "me interesa esta propiedad y quisiera recibir más información";

  return [
    `Hola Milton, ${intro}.`,
    "",
    `Propiedad: ${property.title}`,
    property.location ? `Ubicación: ${property.location}` : "",
    `Precio: ${propertyPriceLabel(property)}`,
    note.trim() ? `Consulta: ${note.trim()}` : "",
    url ? `Enlace: ${url}` : "",
  ].filter(Boolean).join("\n");
}
