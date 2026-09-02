"use client";
import { useState, useRef, useEffect, useEffectEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPropertySlug } from "@/data/properties";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAnalytics } from "@/hooks/useAnalytics";
import { contextualPageMessage, whatsappUrl } from "@/lib/whatsapp";
import { registrarConsulta } from "@/lib/registrarConsulta";
import { useLucia } from "@/components/LuciaProvider";
import {
  comparisonRows,
  decorateRecommendations,
  eligibleProperties,
  nextLuciaStep,
  parseLuciaText,
  recommendProperties,
} from "@/lib/luciaAdvisor.mjs";

// ────────────────────────────────────────────────────────────────────────────
// Lectura del catálogo
// ────────────────────────────────────────────────────────────────────────────
// El chat consulta la base desde el navegador, así que NO pasa por
// lib/properties.js, que es server-only y normaliza cada fila. Todo lo que ese
// archivo garantiza —número donde tiene que haber número, una foto elegida— hay
// que resolverlo acá, o una fila incompleta llega tal cual hasta la tarjeta.

// ── Venta vs. alquiler ──────────────────────────────────────────────────────
// El sitio entero separa las dos operaciones por UN solo campo: `modalidad`.
// Lo usan el listado (`PropertiesClient`), /alquileres, la ficha, PropertyCard,
// favoritos, precio-m2 y lib/whatsapp.js. `operation` NO es un segundo criterio:
// el panel lo deriva de él —`modalidad = operation === "alquiler" ?
// "alquiler_permanente" : operation`— y además tiene el valor "ambas", una
// propiedad que se vende Y se alquila, que sí tiene que entrar al embudo de
// compra. Preguntar por `operation === "alquiler"` es inventar un criterio
// paralelo: acá se pregunta por modalidad y por nada más.
//
// En plata: lo que está en dólares se vende, lo que está en pesos se alquila.
// El alquiler permanente guarda su precio en precioAlquilerARS y deja `price`
// en 0; si se cuela en el embudo de compra, Lucía lo ofrece como "USD 0".
const esVenta = (p) => p.modalidad !== "alquiler_permanente";

// Primera foto disponible. Las filas migradas guardan la galería en `images` y
// pueden tener `image` vacío; sin esto la tarjeta queda con la imagen rota.
function fotoDe(p) {
  if (p.image) return p.image;
  const primera = Array.isArray(p.images) ? p.images.find((i) => i?.url) : null;
  return primera?.url || null;
}

// Precio de venta en dólares, o null. `price` es siempre USD y siempre de
// venta; el alquiler no pasa por acá. Una propiedad de venta sin precio cargado
// no puede responder la pregunta del presupuesto: queda afuera en vez de
// aparecer con un precio vacío.
function precioDe(p) {
  const n = Number(p.price);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Precio de alquiler mensual, en PESOS. El equivalente de precioDe() para la
// otra operación: son campos distintos y nunca se cruzan.
function alquilerDe(p) {
  const n = Number(p.precioAlquilerARS);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// El precio que le corresponde a esa propiedad según su operación. Es el único
// lugar donde se decide qué campo y qué moneda se muestran, así que no hay
// forma de dibujar un alquiler en dólares ni una venta en pesos. Mismo formato
// que FavoritosClient.
function precioTexto(p) {
  if (esVenta(p)) {
    const usd = precioDe(p);
    return usd === null ? null : `USD ${usd.toLocaleString("es-AR")}`;
  }
  const ars = alquilerDe(p);
  return ars === null ? null : `$${ars.toLocaleString("es-AR")}/mes`;
}

// El barrio, que es lo que sirve en una tarjeta chica. Si location viene vacío
// devuelve null y la línea no se dibuja.
function zonaDe(p) {
  const partes = String(p.location || "").split(",").map((t) => t.trim()).filter(Boolean);
  return partes[1] || partes[0] || null;
}

function filterProps(filters, list) {
  return eligibleProperties(filters, list);
}

// Buscador de alquileres permanentes. Es el espejo de filterProps para la otra
// cartera: mismo tipo y dormitorios, pero SIN pregunta de presupuesto —el
// precio va en pesos y se mueve, y la cartera de alquiler es chica, así que
// filtrar por monto deja casi todo afuera. Si la cartera crece, acá va la
// pregunta, con los tramos en pesos y leyendo precioAlquilerARS.
//
// Ojo con la asimetría: `alquilada` SÍ descalifica a un alquiler (está ocupado)
// y NO a una venta (una casa alquilada se sigue vendiendo).
function filterAlquileres(filters, list) {
  return eligibleProperties({ ...filters, operacion: "alquiler" }, list);
}

// ── Lo más parecido cuando no hay nada exacto ─────────────────────
// Hasta acá, una búsqueda sin resultados era un callejón: Lucía pedía los datos
// y la conversación moría ahí, con el catálogo entero ya cargado en memoria.
// Esto reintenta la misma búsqueda cediendo DE A UN criterio por vez y devuelve
// el primer intento que sí encuentra algo, junto con el motivo exacto por el
// que no es lo pedido.
//
// El orden no es arbitrario: primero se cede lo que el visitante puede
// negociar (dormitorios, tipo) y último el presupuesto, que es lo único que
// puede no depender de él. Y el presupuesto se estira hasta +15% y ni un dólar
// más: mostrarle una casa del doble de lo que dijo no es acercarse, es no
// haberlo escuchado.
//
// El motivo se redacta SIEMPRE invariante al número ("el tipo no es el que me
// pediste", no "son de otro tipo"), porque la misma frase acompaña a una sola
// propiedad o a diez. Y va dicho: una propiedad que no cumple, mostrada sin
// aclarar en qué no cumple, es peor que no mostrarla.
const TOLERANCIA_PRECIO = 0.15;

const sinDormitorios = (f) => {
  const { minBedrooms, maxBedrooms, ...resto } = f;
  return resto;
};
const sinTipo = (f) => {
  const { types, ...resto } = f;
  return resto;
};
const pidioDormitorios = (f) => f.minBedrooms !== undefined || f.maxBedrooms !== undefined;

function aflojarFiltros(filters = {}, list = [], buscar = filterProps) {
  const intentos = [];

  if (pidioDormitorios(filters)) {
    intentos.push({
      filtros: sinDormitorios(filters),
      motivo: "la cantidad de dormitorios no es la que me pediste.",
    });
  }
  if (filters.types?.length) {
    intentos.push({
      filtros: sinTipo(filters),
      motivo: "el tipo de propiedad no es el que me pediste.",
    });
  }
  if (pidioDormitorios(filters) && filters.types?.length) {
    intentos.push({
      filtros: sinTipo(sinDormitorios(filters)),
      motivo: "ni el tipo ni la cantidad de dormitorios coinciden con lo que me pediste.",
    });
  }
  // Recién acá se toca la plata, y siempre con el número a la vista.
  if (filters.maxPrice) {
    const estirado = Math.round(filters.maxPrice * (1 + TOLERANCIA_PRECIO));
    const techo = `USD ${estirado.toLocaleString("es-AR")}`;
    intentos.push({
      filtros: { ...filters, maxPrice: estirado },
      motivo: `el precio se va un poco por encima de tu presupuesto, hasta ${techo}.`,
    });
    if (pidioDormitorios(filters)) {
      intentos.push({
        filtros: { ...sinDormitorios(filters), maxPrice: estirado },
        motivo: `el precio llega hasta ${techo} y la cantidad de dormitorios tampoco coincide.`,
      });
    }
  }

  for (const intento of intentos) {
    const found = buscar(intento.filtros, list);
    if (found.length) return { ...intento, found };
  }
  return null;
}

// Link al listado con la misma búsqueda ya aplicada. El listado de venta lee
// `type`, `priceMin`, `priceMax` y `bedrooms` de la URL
// (app/propiedades/PropertiesClient.js), así que el chat no reimplementa nada.
// /alquileres no lee parámetros: va pelado, sin inventar filtros que ese
// listado no aplica.
function urlDelListado(filters = {}) {
  if (filters.operacion === "alquiler") return "/alquileres/";
  const params = new URLSearchParams();
  // `type` compara contra un solo tipo; con varios se manda sin filtrar.
  if (filters.types?.length === 1) params.set("type", filters.types[0]);
  if (filters.minPrice) params.set("priceMin", String(filters.minPrice));
  if (filters.maxPrice) params.set("priceMax", String(filters.maxPrice));
  // El listado interpreta `bedrooms` como mínimo, así que solo va el mínimo.
  if (filters.minBedrooms) params.set("bedrooms", String(filters.minBedrooms));
  const q = params.toString();
  return q ? `/propiedades/?${q}` : "/propiedades/";
}

// Si lo ponés en false, las salidas a WhatsApp de visitantes que todavía no
// dejaron sus datos dejan de guardarse en el CRM (la analítica las sigue
// registrando igual).
const REGISTRAR_SALIDAS_WHATSAPP = true;

// Traduce los filtros de la búsqueda a texto legible. Lo usan el mensaje de
// WhatsApp y el detalle del lead, así siempre describen lo mismo.
function describeFilters(filters = {}) {
  const objetivos = { vivir: "vivir", invertir: "invertir", construir: "construir", explorar: "explorar opciones" };
  const prioridades = { exterior: "espacio exterior", garage: "cochera", center: "ubicación céntrica", space: "mayor superficie" };
  return [
    filters.operacion === "alquiler" ? "Operación: alquiler permanente" : "",
    filters.objective ? `Objetivo: ${objetivos[filters.objective] || filters.objective}` : "",
    filters.types?.length ? `Tipo: ${filters.types.join(", ")}` : "",
    filters.minPrice ? `Presupuesto mínimo: USD ${filters.minPrice.toLocaleString("es-AR")}` : "",
    filters.maxPrice ? `Presupuesto máximo: USD ${filters.maxPrice.toLocaleString("es-AR")}` : "",
    filters.minBedrooms !== undefined ? `Dormitorios desde: ${filters.minBedrooms}` : "",
    filters.maxBedrooms !== undefined ? `Dormitorios hasta: ${filters.maxBedrooms}` : "",
    filters.priority ? `Prioridad: ${prioridades[filters.priority] || filters.priority}` : "",
    filters.cta ? `Próximo paso: ${filters.cta}` : "",
  ].filter(Boolean);
}

// ── Alta en la lista de avisos ──────────────────────────────────────────────
// Hasta acá el lead del chat moría en el CRM: una consulta más para contestar a
// mano, y si el visitante no volvía, se perdía. Con el email entra además a
// `subscribers`, la misma lista del Radar de la home, con su búsqueda anotada.
//
// OJO con la copy: el aviso de propiedad nueva que sale solo (lib/emailNuevaPropiedad)
// cruza `client_favorites` —hace falta cuenta y un favorito en ese barrio—, NO
// esta lista. Al suscriptor le llega el correo de bienvenida y después los que
// Milton manda desde /admin/suscriptores. Por eso Lucía dice "te sumo a la lista
// de avisos" y no "te llega solo".
//
// Estas tres funciones traducen los filtros del chat a los campos que espera
// /api/suscripcion, que los guarda como notas del suscriptor.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tipoDeSuscripcion(filters = {}) {
  // El endpoint valida contra una lista corta de tipos. El primero del grupo es
  // el que lo representa: "Departamento" por Departamento/PH/Monoambiente.
  const tipo = filters.types?.[0];
  return tipo ? tipo.toLowerCase() : null;
}

function presupuestoTexto(filters = {}) {
  const usd = (n) => `USD ${n.toLocaleString("es-AR")}`;
  const { minPrice, maxPrice } = filters;
  if (minPrice && maxPrice) return `${usd(minPrice)} a ${maxPrice.toLocaleString("es-AR")}`;
  if (maxPrice) return `hasta ${usd(maxPrice)}`;
  if (minPrice) return `más de ${usd(minPrice)}`;
  // El embudo de alquiler no pregunta presupuesto: ahí no hay nada que decir.
  return null;
}

function dormitoriosTexto(filters = {}) {
  const { minBedrooms, maxBedrooms } = filters;
  if (maxBedrooms === 0) return "monoambiente";
  if (minBedrooms !== undefined && maxBedrooms !== undefined) {
    return minBedrooms === maxBedrooms ? `${minBedrooms}` : `${minBedrooms} a ${maxBedrooms}`;
  }
  if (maxBedrooms !== undefined) return `hasta ${maxBedrooms}`;
  if (minBedrooms !== undefined) return `${minBedrooms} o más`;
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Horario de atención
// ────────────────────────────────────────────────────────────────────────────
// Los tramos replican BUSINESS_HOURS de config.js ("Lun–Vie: 9:30 a 19:00 ·
// Sáb: 10:00 a 13:00"), en minutos desde la medianoche. Si el horario cambia
// allá, hay que moverlo también acá.
const TRAMOS_ATENCION = {
  Mon: [570, 1140],
  Tue: [570, 1140],
  Wed: [570, 1140],
  Thu: [570, 1140],
  Fri: [570, 1140],
  Sat: [600, 780],
};
const DIAS_ORDEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const NOMBRE_DIA = {
  Sun: "domingo", Mon: "lunes", Tue: "martes", Wed: "miércoles",
  Thu: "jueves", Fri: "viernes", Sat: "sábado",
};

function comoHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h}:${String(m).padStart(2, "0")}` : `${h}`;
}

// Resuelve si hay alguien del otro lado usando SIEMPRE la hora de Argentina y
// no la del dispositivo: buena parte de las consultas llegan de otro huso.
// Devuelve null si el navegador no sabe de husos horarios, y en ese caso el
// header no afirma nada en vez de mentir.
function estadoAtencion(ahora = new Date()) {
  let partes;
  try {
    partes = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .formatToParts(ahora)
        .map((p) => [p.type, p.value])
    );
  } catch {
    return null;
  }

  const dia = partes.weekday;
  const minutos = (Number(partes.hour) % 24) * 60 + Number(partes.minute);
  const tramo = TRAMOS_ATENCION[dia];

  if (tramo && minutos >= tramo[0] && minutos < tramo[1]) {
    return { abierto: true, cierra: comoHora(tramo[1]) };
  }

  // Próxima apertura: recorre como mucho una semana hacia adelante.
  const indiceHoy = DIAS_ORDEN.indexOf(dia);
  for (let salto = 0; salto < 8; salto++) {
    const nombre = DIAS_ORDEN[(indiceHoy + salto) % 7];
    const siguiente = TRAMOS_ATENCION[nombre];
    if (!siguiente) continue;
    if (salto === 0 && minutos >= siguiente[0]) continue; // hoy ya cerró
    const cuando = salto === 0 ? "hoy" : salto === 1 ? "mañana" : `el ${NOMBRE_DIA[nombre]}`;
    return { abierto: false, proximo: `${cuando} desde las ${comoHora(siguiente[0])}` };
  }
  return { abierto: false, proximo: "el lunes" };
}

// ────────────────────────────────────────────────────────────────────────────
// Saludo según la página
// ────────────────────────────────────────────────────────────────────────────
// Mismo criterio de rutas que contextualPageMessage() en lib/whatsapp.js: si
// allá se agrega una sección, conviene agregarla acá también. La última
// burbuja es siempre la pregunta, porque los botones cuelgan del último
// mensaje.
const SOY = "Hola, soy Lucía, la asistente de Catalán Propiedades.";

function contextualGreeting(pathname = "/") {
  const path = pathname || "/";
  const segmentos = path.split("/").filter(Boolean);

  if (path.startsWith("/blog/")) {
    return [SOY, "Si la nota te dejó con alguna duda, Milton te la contesta. ¿Con qué te ayudo?"];
  }
  if (path.startsWith("/inversiones")) {
    return [SOY, "¿Estás mirando para invertir? Contame qué tenés en mente y vemos qué hay disponible."];
  }
  if (path.startsWith("/tasacion") || path.startsWith("/vender")) {
    return [SOY, "Si estás pensando en vender, Milton te da una asesoría sin cargo. ¿Arrancamos por ahí?"];
  }
  if (path.startsWith("/precio-m2")) {
    return [SOY, "¿Querés que veamos qué hay publicado en la zona que estabas mirando?"];
  }
  if (path.startsWith("/simulador-credito")) {
    return [SOY, "¿Vemos qué propiedades entran en el presupuesto que te da el crédito?"];
  }
  if (path.startsWith("/favoritos")) {
    return [SOY, "¿Querés que Milton te ayude a comparar las que guardaste?"];
  }
  if (path.startsWith("/desarrollos")) {
    return [SOY, "Los emprendimientos los comercializamos nosotros. ¿Con qué te ayudo?"];
  }
  if (segmentos[0] === "propiedades" && segmentos.length > 1) {
    return [SOY, "Si querés te busco otras parecidas a esta. ¿O necesitás otra cosa?"];
  }
  if (path.startsWith("/propiedades") || path.startsWith("/alquileres")) {
    return [SOY, "Te ayudo a filtrar entre todo lo que hay publicado. ¿Arrancamos?"];
  }
  if (path.startsWith("/centro-ayuda")) {
    return [SOY, "Si quedó algo sin responder ahí, lo vemos por acá. ¿Qué necesitás?"];
  }
  return [
    "¡Hola! Soy Lucía, la asistente de Catalán Propiedades.",
    "¿Con qué te doy una mano?",
  ];
}

// Comenta el resultado según cuántas encontró, en vez del "¡Encontré N!" fijo.
function reaccionResultados(n) {
  if (n === 1) return "Tengo una sola que encaja con eso, y es bastante puntual:";
  if (n <= 3) return `Tengo ${n} que entran justo en lo que buscás:`;
  if (n <= 8) return `Encontré ${n} opciones. Te dejo las tres que mejor encajan:`;
  return `Hay ${n}, así que tenés de dónde elegir. Te dejo las tres con mayor afinidad:`;
}

// La cartera de alquiler es chica y se mueve rápido: el comentario lo dice en
// vez de fingir abundancia.
function reaccionAlquileres(n) {
  if (n === 1) return "Hay uno solo disponible en este momento:";
  if (n <= 3) return `Tengo ${n} disponibles ahora:`;
  return `Tengo ${n} disponibles. Te dejo los tres que mejor encajan:`;
}

// ── Cómo se cuenta el clima ────────────────────────────────────────────────
// Los datos llegan ya redondeados y validados desde lib/clima.js: acá solo se
// arma la frase. Cada pedazo se dibuja únicamente si vino, así que un campo que
// falte se nota como una frase más corta y nunca como un "undefined°".
function textoClimaAhora(a) {
  // La sensación térmica solo se dice cuando aporta algo. En la montaña suele
  // separarse varios grados de la real; cuando no, repetirla es ruido.
  const sensacion =
    a.sensacion !== null && Math.abs(a.sensacion - a.temperatura) >= 2
      ? ` (sensación ${a.sensacion}°)`
      : "";
  const estado = a.estado ? `, ${a.estado}` : "";
  return `En San Martín de los Andes ahora hay ${a.temperatura}°${sensacion}${estado}.`;
}

function textoClimaDias(dias) {
  if (!dias?.length) return null;
  const lineas = dias
    .map((d) => `${d.nombre}: ${d.min}° a ${d.max}°${d.estado ? `, ${d.estado}` : ""}`)
    .join("\n");
  return `Cómo sigue:\n${lineas}\n\nDatos de Open-Meteo.`;
}

// Las secciones del sitio a las que Lucía puede derivar. Cada texto sale de lo
// que esa página realmente hace: si se agrega una sección nueva, se agrega acá,
// y si una se da de baja hay que sacarla o Lucía manda a un 404.
const RECURSOS = {
  tasacion: {
    href: "/tasacion/",
    titulo: "Tasación online",
    detalle: "Cargás los datos de tu propiedad y te da un valor estimado.",
  },
  vender: {
    href: "/vender/",
    titulo: "Vender tu propiedad",
    detalle: "Cómo trabajamos la venta y qué hace falta para publicar.",
  },
  precio: {
    href: "/precio-m2/",
    titulo: "Precio del m² por barrio",
    detalle: "Cuánto vale el metro en cada zona, actualizado a 2026.",
  },
  credito: {
    href: "/simulador-credito/",
    titulo: "Simulador de crédito UVA",
    detalle: "Para hacerte una idea del presupuesto con el que contás.",
  },
  inversion: {
    href: "/inversiones/",
    titulo: "Invertir en San Martín",
    detalle: "Rentabilidad por zona, calculadora de retorno y comparaciones.",
  },
  barrios: {
    href: "/barrios/",
    titulo: "Guía de barrios",
    detalle: "Precio del m², servicios y acceso en invierno, barrio por barrio.",
  },
  // SIN USO desde el 01/09/2026: Milton pidió sacar las opiniones de vecinos de
  // Lucía. La sección /experiencia-barrio/ sigue viva en el sitio; lo que se
  // quitó son las derivaciones del chat. Se deja la entrada acá para que vuelva
  // agregando `recursos: ["vecinos"]` a una opción, sin reescribir el detalle.
  vecinos: {
    href: "/experiencia-barrio/",
    titulo: "Opiniones de vecinos",
    detalle: "Cómo es vivir en cada barrio, contado por los que viven ahí.",
  },
  desarrollos: {
    href: "/desarrollos/",
    titulo: "Desarrollos",
    detalle: "Emprendimientos en pozo, en obra y terminados, con plan de cuotas.",
  },
  alquileres: {
    href: "/alquileres/",
    titulo: "Alquileres permanentes",
    detalle: "Lo que hay publicado para alquilar todo el año.",
  },
  ayuda: {
    href: "/centro-ayuda/",
    titulo: "Centro de ayuda",
    detalle: "El proceso de compra en Neuquén, los papeles, los impuestos y los gastos.",
  },
  nosotros: {
    href: "/nosotros/",
    titulo: "Quiénes somos",
    detalle: "El equipo: Milton y Carolina Godoy, la abogada que respalda las operaciones.",
  },
  legal: {
    href: "/blog/alquileres-san-martin-de-los-andes-2026/",
    titulo: "Guía legal de alquileres",
    detalle: "Escrita por Carolina Godoy, la abogada del equipo: qué mirar antes de firmar.",
  },
  blog: {
    href: "/blog/",
    titulo: "Notas del blog",
    detalle: "Crédito hipotecario, mercado y lo que va cambiando en el rubro.",
  },
};

const STEPS = {
  welcome: {
    // Este texto solo se usa cuando se vuelve al inicio desde adentro: la
    // primera vez el saludo lo arma contextualGreeting() según la página.
    text: "¿Con qué otra cosa te ayudo?",
    options: [
      { label: "Estoy buscando para comprar", icono: "buscar", reinicia: true, next: "ask_goal" },
      { label: "Busco alquiler permanente", icono: "llave", next: "guia_alquilar" },
      { label: "Quiero vender o tasar", icono: "casa", next: "guia_vender" },
      { label: "Estoy averiguando cómo está el mercado", icono: "grafico", next: "menu_info" },
      { label: "Cómo es vivir en San Martín", icono: "montana", next: "menu_vivir" },
      { label: "Prefiero hablar con Milton", icono: "whatsapp", next: "whatsapp" },
    ],
  },

  guia_vender: {
    text: "¿Por dónde querés arrancar?",
    options: [
      { label: "Cuánto vale mi propiedad", comentario: "Te dejo el tasador. Es gratis y no hace falta que dejes datos para verlo.", recursos: ["tasacion"], next: "guia_vender" },
      { label: "Cómo es el proceso y qué gastos tiene", comentario: "Esto está explicado en el centro de ayuda, con los porcentajes de Neuquén.", recursos: ["ayuda"], next: "guia_vender" },
      { label: "Quiero publicar con ustedes", comentario: "Acá está cómo trabajamos la venta.", recursos: ["vender"], next: "guia_vender" },
      { label: "Que me contacte Milton", icono: "whatsapp", next: "whatsapp" },
      { label: "Volver al inicio", icono: "reiniciar", next: "welcome" },
    ],
  },

  guia_alquilar: {
    text: "Lo que publicamos es alquiler permanente, para vivir todo el año.",
    options: [
      { label: "Buscar entre lo que hay", icono: "buscar", reinicia: true, next: "ask_alq_type" },
      { label: "Ver todos los publicados", comentario: "Ahí está todo lo que hay para alquilar ahora mismo.", recursos: ["alquileres"], next: "guia_alquilar" },
      { label: "Avisame si entra algo", icono: "campana", operacion: "alquiler", next: "lead" },
      { label: "Dudas con el contrato", comentario: "El contrato lo mira Carolina Godoy, la abogada del equipo. Escribió esta guía sobre qué revisar antes de firmar, y podés llamarla al 2944-630649.", recursos: ["legal"], next: "guia_alquilar" },
      { label: "Hablar con Milton", icono: "whatsapp", next: "whatsapp" },
      { label: "Volver al inicio", icono: "reiniciar", next: "welcome" },
    ],
  },

  // El embudo de alquiler no pregunta presupuesto: ver filterAlquileres().
  ask_alq_type: {
    text: "¿Qué estás buscando para alquilar?",
    options: [
      { label: "Una casa", filter: { types: ["Casa"] }, next: "ask_alq_bedrooms" },
      { label: "Un departamento o PH", filter: { types: ["Departamento", "PH", "Monoambiente"] }, next: "ask_alq_bedrooms" },
      { label: "Una cabaña", filter: { types: ["Cabaña", "Cabañas"] }, next: "ask_alq_bedrooms" },
      { label: "Me da igual el tipo", filter: {}, next: "ask_alq_bedrooms" },
    ],
  },
  ask_alq_bedrooms: {
    text: "¿Cuántos dormitorios necesitás?",
    options: [
      { label: "Con uno me alcanza", filter: { maxBedrooms: 1 }, next: "ask_alq_priority" },
      { label: "Dos", filter: { minBedrooms: 2, maxBedrooms: 2 }, next: "ask_alq_priority" },
      { label: "Tres o más", filter: { minBedrooms: 3 }, next: "ask_alq_priority" },
      { label: "Eso me da igual", filter: {}, next: "ask_alq_priority" },
    ],
  },
  ask_alq_priority: {
    text: "¿Qué sería más importante para vos?",
    options: [
      { label: "Espacio exterior", filter: { priority: "exterior" }, next: "results_alquiler" },
      { label: "Cochera", filter: { priority: "garage" }, next: "results_alquiler" },
      { label: "Una ubicación céntrica", filter: { priority: "center" }, next: "results_alquiler" },
      { label: "No tengo otra prioridad", filter: {}, next: "results_alquiler" },
    ],
  },
  after_results_alquiler: {
    text: "¿Seguimos?",
    options: [
      { label: "Comparar estas opciones", icono: "grafico", next: "compare" },
      { label: "Quiero visitar uno", icono: "casa", next: "whatsapp" },
      { label: "Avisame si entra otro así", icono: "campana", next: "lead" },
      { label: "Buscar otra cosa", icono: "reiniciar", reinicia: true, next: "ask_alq_type" },
      { label: "Prefiero hablar con Milton", icono: "whatsapp", next: "whatsapp" },
    ],
  },

  menu_vivir: {
    text: "¿Qué querés saber de San Martín?",
    options: [
      { label: "Cómo está el clima ahora", icono: "clima", next: "clima" },
      { label: "Cómo es cada barrio", comentario: "Acá está cada zona con lo que la caracteriza, los servicios y las distancias.", recursos: ["barrios"], next: "menu_vivir" },
      { label: "Ver qué hay publicado", icono: "buscar", reinicia: true, next: "ask_goal" },
      { label: "Hablar con Milton", icono: "whatsapp", next: "whatsapp" },
      { label: "Volver al inicio", icono: "reiniciar", next: "welcome" },
    ],
  },

  menu_info: {
    text: "¿Qué te interesa mirar?",
    options: [
      { label: "Cuánto vale el m² por barrio", comentario: "Este es el número que más se consulta. Está abierto por zona.", recursos: ["precio"], next: "menu_info" },
      { label: "Con cuánto podría contar", comentario: "El simulador de crédito UVA te ayuda a ponerle un número al presupuesto.", recursos: ["credito"], next: "menu_info" },
      { label: "Si conviene invertir acá", comentario: "Acá está el análisis con la rentabilidad por zona y la calculadora de retorno.", recursos: ["inversion"], next: "menu_info" },
      { label: "En qué barrio me conviene", comentario: "Acá está cada zona con los datos: precio del m², servicios y cómo se accede en invierno.", recursos: ["barrios"], next: "menu_info" },
      { label: "Cómo viene el mercado", comentario: "En el blog vamos siguiendo el crédito y los movimientos del rubro.", recursos: ["blog"], next: "menu_info" },
      { label: "Quiénes están detrás", comentario: "Somos Milton, que hace más de diez años analiza este mercado, y Carolina Godoy, la abogada del equipo, que revisa los contratos y la documentación de cada operación.", recursos: ["nosotros"], next: "menu_info" },
      { label: "Volver al inicio", icono: "reiniciar", next: "welcome" },
    ],
  },
  ask_goal: {
    text: "Primero quiero entender para qué la buscás. ¿Cuál es tu objetivo?",
    options: [
      { label: "Para vivir", filter: { objective: "vivir" }, next: "ask_type" },
      { label: "Para invertir", filter: { objective: "invertir" }, next: "ask_type" },
      { label: "Un lote para construir", filter: { objective: "construir", types: ["Lote"] }, next: "ask_budget" },
      { label: "Estoy explorando opciones", filter: { objective: "explorar" }, next: "ask_type" },
    ],
  },
  ask_type: {
    text: "¿Qué estás buscando?",
    options: [
      { label: "Una casa", filter: { types: ["Casa"] }, next: "ask_budget" },
      { label: "Un departamento o PH", filter: { types: ["Departamento", "PH", "Monoambiente"] }, next: "ask_budget" },
      { label: "Una cabaña", filter: { types: ["Cabaña", "Cabañas"] }, next: "ask_budget" },
      { label: "Un lote para construir", filter: { types: ["Lote"] }, next: "ask_budget" },
      { label: "Un emprendimiento en pozo", comentario: "Los emprendimientos van aparte del listado, porque se compran en cuotas.", recursos: ["desarrollos"], next: "ask_type" },
      { label: "Todavía no lo tengo claro", filter: {}, next: "ask_budget" },
    ],
  },
  // El embudo de compra pregunta DOS cosas antes de mostrar algo, no tres. La
  // de dormitorios era la tercera y empujaba la primera foto a unos 5 segundos
  // (dos burbujas por pregunta, más el ritmo). Ahora sale después del
  // presupuesto y los dormitorios quedan como refinamiento, ya con propiedades
  // a la vista: si la primera tanda alcanza, se ahorró la pregunta entera.
  ask_budget: {
    text: "¿Con qué presupuesto te estás manejando, en dólares?",
    options: [
      { label: "Hasta USD 100.000", filter: { maxPrice: 100000 }, next: "after_budget" },
      { label: "Entre 100 y 200 mil", filter: { minPrice: 100000, maxPrice: 200000 }, next: "after_budget" },
      { label: "Entre 200 y 400 mil", filter: { minPrice: 200000, maxPrice: 400000 }, next: "after_budget" },
      { label: "Más de USD 400.000", filter: { minPrice: 400000 }, next: "after_budget" },
      { label: "Prefiero no definirlo todavía", filter: {}, next: "after_budget" },
    ],
  },
  ask_bedrooms: {
    text: "¿Cuántos dormitorios necesitás?",
    options: [
      { label: "Monoambiente", filter: { minBedrooms: 0, maxBedrooms: 0 }, next: "ask_priority" },
      { label: "Uno o dos", filter: { minBedrooms: 1, maxBedrooms: 2 }, next: "ask_priority" },
      { label: "Tres o más", filter: { minBedrooms: 3 }, next: "ask_priority" },
      { label: "No es decisivo", filter: {}, next: "ask_priority" },
    ],
  },
  ask_priority: {
    text: "¿Qué preferís priorizar si hay que elegir?",
    options: [
      { label: "Espacio exterior", filter: { priority: "exterior" }, next: "results" },
      { label: "Cochera", filter: { priority: "garage" }, next: "results" },
      { label: "Una ubicación céntrica", filter: { priority: "center" }, next: "results" },
      { label: "La mayor superficie", filter: { priority: "space" }, next: "results" },
      { label: "No tengo otra prioridad", filter: {}, next: "results" },
    ],
  },
  ask_priority_lote: {
    text: "¿Qué querés priorizar en el lote?",
    options: [
      { label: "Una ubicación céntrica", filter: { priority: "center" }, next: "results" },
      { label: "La mayor superficie", filter: { priority: "space" }, next: "results" },
      { label: "No tengo otra prioridad", filter: {}, next: "results" },
    ],
  },
  after_results: {
    text: "¿Seguimos?",
    options: [
      { label: "Comparar estas opciones", icono: "grafico", next: "compare" },
      { label: "Quiero visitar una", icono: "casa", next: "whatsapp" },
      { label: "Que Milton me ayude a elegir", icono: "whatsapp", next: "whatsapp" },
      { label: "Avisame si entra algo así", icono: "campana", next: "lead" },
      { label: "Buscar otra cosa", icono: "reiniciar", reinicia: true, next: "ask_goal" },
    ],
  },
  after_ai_capture: {
    options: [
      { label: "Sí, avisame", icono: "campana", next: "lead" },
      { label: "Prefiero hablar con Milton", icono: "whatsapp", next: "whatsapp" },
    ],
  },
  // Paso de captura: no tiene botones, renderiza el formulario de contacto.
  lead: { form: true },
  after_lead: {
    options: [
      { label: "Buscar otra cosa", icono: "reiniciar", reinicia: true, next: "ask_goal" },
      { label: "Hablar con Milton", icono: "whatsapp", next: "whatsapp" },
    ],
  },
};

const AIRBNB = "#FF5A5F";

// Retrato propio de Lucía. Es una copia WebP recortada para conservar nitidez
// tanto en el encabezado como en el botón flotante de 56 px.
const LUCIA_AVATAR = "/lucia-avatar.webp";

// La burbuja de invitación aparece una sola vez por visita. Si la cierran, no
// vuelve en toda la sesión del navegador.
const INVITACION_KEY = "lucia-invitacion-cerrada";
const INVITACION_MS = 12000;
const ANSWER_BY_STEP = {
  ask_goal: "goal",
  ask_type: "type",
  ask_alq_type: "type",
  ask_budget: "budget",
  ask_bedrooms: "bedrooms",
  ask_alq_bedrooms: "bedrooms",
  ask_priority: "priority",
  ask_priority_lote: "priority",
  ask_alq_priority: "priority",
};

// Demoras cortas. La investigación dice que lo que sostiene la percepción es
// el indicador visible, no la espera: esperar de más se lee como lento, no
// como reflexivo. La única pausa larga es la del "no encontré nada".
const beat = (min = 400, max = 900) => Math.round(min + Math.random() * (max - min));

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [activeStep, setActiveStep] = useState("welcome");
  const [filters, setFilters] = useState({});
  const [lastSearchFilters, setLastSearchFilters] = useState({});
  const [writtenAnswers, setWrittenAnswers] = useState({});
  // Una recomendación comercial se hace solo con disponibilidad confirmada.
  const [dataset, setDataset] = useState([]);
  const [leadSent, setLeadSent] = useState(false);
  const [atencion, setAtencion] = useState(null);
  const [clima, setClima] = useState(null);
  const [invitacion, setInvitacion] = useState(null);
  const [invitacionCerrada, setInvitacionCerrada] = useState(false);
  const [composerDraft, setComposerDraft] = useState(null);
  const messagesEndRef = useRef(null);
  // El contenedor scrolleable y el arranque de la última tanda de Lucía. Ver el
  // efecto de scroll: no siempre conviene bajar hasta el fondo.
  const messagesBoxRef = useRef(null);
  const turnStartRef = useRef(null);
  const handledCommandRef = useRef(0);
  const pathname = usePathname();
  const { trackEvent, trackWhatsAppClick } = useAnalytics();
  const { command } = useLucia();

  // Una secuencia de burbujas puede quedar a mitad de camino cuando el
  // visitante reinicia o elige otra opción. flowRef marca cuál es la vigente y
  // las viejas se descartan sin llegar a escribir.
  const flowRef = useRef(0);
  const timersRef = useRef([]);
  const lastRecommendationsRef = useRef([]);
  // La invitación comercial aparece una sola vez y únicamente después de una
  // consulta con intención inmobiliaria. Así Lucía ayuda antes de pedir datos.
  const aiLeadInviteShownRef = useRef(false);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const wait = (ms) =>
    new Promise((resolve) => {
      timersRef.current.push(setTimeout(resolve, ms));
    });

  const cancelPending = () => {
    flowRef.current += 1;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setTyping(false);
  };

  // Publica una o varias burbujas del bot con los puntitos entre medio. El
  // stepKey (y por lo tanto los botones) se cuelga solo de la última.
  const sendBot = async (bubbles, stepKey) => {
    const flow = ++flowRef.current;
    setTyping(true);
    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i];
      await wait(bubble.delay ?? beat());
      if (flowRef.current !== flow) return;
      const ultima = i === bubbles.length - 1;
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: bubble.text, results: bubble.results, recursos: bubble.recursos, listado: bubble.listado, comparison: bubble.comparison, feedback: bubble.feedback, stepKey: ultima ? stepKey : undefined },
      ]);
      if (ultima) setTyping(false);
    }
  };

  const bubblesOf = (step) => {
    const text = step?.text;
    if (Array.isArray(text)) return text.map((t) => ({ text: t }));
    return [{ text }];
  };

  // Guarda en el CRM la salida a WhatsApp de alguien que todavía no dejó datos,
  // para no perder al que abre WhatsApp y después nunca escribe. Queda marcado
  // con sin_datos_de_contacto para poder separarlo de los leads reales.
  const registrarSalidaWhatsApp = (searchFilters, origen, recommendations = []) => {
    if (!REGISTRAR_SALIDAS_WHATSAPP || leadSent) return;
    registrarConsulta({
      tipo: "contacto",
      nombre: "Visitante del chat",
      mensaje: "Abrió WhatsApp desde el asistente Lucía sin dejar sus datos.",
      detalle: {
        origen,
        sin_datos_de_contacto: true,
        filtros: searchFilters || {},
        busqueda: describeFilters(searchFilters),
        recomendaciones: recommendations.map((property) => ({ id: property.id, titulo: property.title })),
      },
    });
  };

  const advisorMessage = (searchFilters = {}, recommendations = []) => {
    const details = describeFilters(searchFilters);

    // Sin búsqueda hecha el mensaje lo arma el contexto de la página, igual que
    // hacía el botón flotante de WhatsApp que este chat reemplazó.
    if (!details.length) return whatsappUrl(contextualPageMessage(pathname));

    const finalists = recommendations.length
      ? `\n\nLas opciones que vi:\n${recommendations.map((property) => `• ${property.title}: ${window.location.origin}/propiedades/${getPropertySlug(property)}/`).join("\n")}`
      : "";

    return whatsappUrl(
      `Hola Milton, usé el asistente de búsqueda de la web y quisiera que me ayudes a encontrar una propiedad.` +
      `\n\nMi búsqueda:\n${details.map((item) => `• ${item}`).join("\n")}${finalists}`
    );
  };

  // El chat NO baja siempre hasta el fondo: alinea el comienzo de lo que Lucía
  // acaba de responder. Bajando al fondo, una respuesta larga quedaba arriba de
  // la pantalla y abajo se veían solo los botones — el visitante apurado se iba
  // creyendo que no le contestó. El clamp contra el máximo hace que, cuando
  // todo entra en pantalla, el resultado sea el de antes: el fondo.
  useEffect(() => {
    if (!open) return;
    const box = messagesBoxRef.current;
    const target = turnStartRef.current;
    if (!box || !target) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const desde = target.getBoundingClientRect().top - box.getBoundingClientRect().top;
    const tope = Math.max(box.scrollHeight - box.clientHeight, 0);
    box.scrollTo({ top: Math.min(box.scrollTop + desde - 12, tope), behavior: "smooth" });
  }, [messages, typing, open]);

  // El catálogo fresco se pide recién cuando alguien abre el chat. La promesa se
  // comparte con el paso de resultados: Lucía espera esa confirmación y nunca
  // presenta el respaldo estático como disponibilidad actual.
  const catalogoPedido = useRef(null);
  const cargarCatalogo = () => {
    if (catalogoPedido.current) return catalogoPedido.current;
    const supabase = supabaseBrowser();
    if (!supabase) return Promise.resolve(null);
    catalogoPedido.current = supabase
      .from("properties")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data?.length) return null;
        setDataset(data);
        return data;
      })
      .catch(() => null);
    return catalogoPedido.current;
  };

  // El clima se pide una sola vez por montaje y lo comparten el chip del header
  // y el paso `clima` del menú. Se guarda la PROMESA, no solo el resultado: si
  // el visitante toca "cómo está el clima" mientras el pedido del chip todavía
  // viaja, se cuelga de ese mismo pedido en vez de disparar otro.
  const promesaClima = useRef(null);
  const pedirClima = () => {
    if (!promesaClima.current) {
      promesaClima.current = (async () => {
        try {
          // Con la barra final: trailingSlash está en true y sin ella hay redirect.
          const res = await fetch("/api/clima/");
          if (!res.ok) return null;
          const json = await res.json();
          return json?.ok ? json : null;
        } catch (e) {
          // Sin red o endpoint caído: se trata igual que un "no hay dato" y el
          // chip no se dibuja.
          return null;
        }
      })().then((dato) => {
        setClima(dato);
        return dato;
      });
    }
    return promesaClima.current;
  };

  // El horario se calcula en el cliente (nunca en el HTML del servidor, que se
  // cachea) y se refresca cada vez que se abre el chat.
  useEffect(() => {
    setAtencion(estadoAtencion());
  }, [open]);

  // Burbuja de invitación: a los 12 segundos Lucía asoma al lado del botón con
  // la misma frase con la que saludaría en esta página. Reemplaza al Toast que
  // vivía en ClientShell, que decía algo parecido pero igual para todo el
  // sitio y llevaba a un listado en vez de a una conversación.
  useEffect(() => {
    if (open || invitacionCerrada || invitacion) return;
    try {
      if (sessionStorage.getItem(INVITACION_KEY) === "1") return;
    } catch (e) {
      // Navegador con el almacenamiento bloqueado: se muestra igual.
    }
    const id = setTimeout(() => {
      const saludo = contextualGreeting(pathname);
      setInvitacion(saludo[saludo.length - 1]);
      trackEvent("chatbot_invitacion_vista", { page_path: pathname });
    }, INVITACION_MS);
    return () => clearTimeout(id);
  }, [open, invitacionCerrada, invitacion, pathname]);

  // `medir` separa las dos formas de que la burbuja desaparezca: la cruz (el
  // visitante la rechaza) y abrir el chat (la burbuja cumplió). Solo la primera
  // cuenta como descarte.
  const descartarInvitacion = ({ medir = true } = {}) => {
    if (medir && invitacion) trackEvent("chatbot_invitacion_cerrada", { page_path: pathname });
    setInvitacion(null);
    setInvitacionCerrada(true);
    try {
      sessionStorage.setItem(INVITACION_KEY, "1");
    } catch (e) {
      // Sin almacenamiento no se recuerda el descarte, pero tampoco molesta:
      // la invitación ya no vuelve mientras la página siga abierta.
    }
  };

  // El único paso del chat que espera a un tercero. El fetch va primero y las
  // burbujas después: si Open-Meteo no contesta, Lucía lo dice y no pasa nada
  // más. Nunca se publica un número que no vino de la API (ver lib/clima.js).
  const mostrarClima = async () => {
    // Si el visitante toca otro botón mientras esto viaja, la respuesta llega
    // tarde a una conversación que ya siguió: se descarta, igual que hace
    // sendBot con las secuencias viejas.
    const flow = flowRef.current;
    setTyping(true);

    const dato = await pedirClima();

    if (flowRef.current !== flow) return;
    setTyping(false);
    trackEvent("chatbot_clima", { ok: Boolean(dato) });

    if (!dato) {
      sendBot(
        [{ text: "Justo ahora no puedo traer el clima. Probá de nuevo en un rato." }],
        "menu_vivir"
      );
      return;
    }

    const burbujas = [{ text: textoClimaAhora(dato.ahora) }];
    const pronostico = textoClimaDias(dato.dias);
    if (pronostico) burbujas.push({ text: pronostico });
    sendBot(burbujas, "menu_vivir");
  };

  const saludar = () => {
    cancelPending();
    const saludo = contextualGreeting(pathname);
    setActiveStep("welcome");
    sendBot(
      saludo.map((text, i) => ({ text, delay: i === 0 ? 350 : beat() })),
      "welcome"
    );
  };

  // `origen` distingue el clic en el botón flotante del clic en la burbuja de
  // invitación. Sin este evento no hay denominador: chatbot_lead solo cuenta a
  // los que ya habían abierto, y no se puede saber si la burbuja suma o molesta.
  const abrirChat = (origen = "boton") => {
    setOpen(true);
    cargarCatalogo();
    pedirClima();
    trackEvent("chatbot_open", { origen, page_path: pathname });
    descartarInvitacion({ medir: false });
    if (messages.length === 0 && !typing) saludar();
  };

  const climaDesdeHeader = () => {
    cancelPending();
    setMessages((prev) => [...prev, { role: "user", text: "¿Cómo está el clima?" }]);
    trackEvent("chatbot_paso", { desde: activeStep, paso: "clima", opcion: "chip del header" });
    setActiveStep("menu_vivir");
    mostrarClima();
  };

  const handleOption = async (opt, currentFilters) => {
    cancelPending();
    setMessages((prev) => [...prev, { role: "user", text: opt.label }]);

    // Un evento por paso, con de dónde viene y a dónde va. Es lo que dibuja el
    // embudo completo en GA4: entre chatbot_open y chatbot_lead antes no había
    // nada, así que no se podía ver en qué pregunta se cae la gente.
    trackEvent("chatbot_paso", {
      desde: activeStep,
      paso: opt.next,
      opcion: opt.written ? "texto_libre" : opt.label,
    });

    if (opt.next === "whatsapp") {
      const baseContext = Object.keys(currentFilters || {}).length ? currentFilters : lastSearchFilters;
      const searchContext = { ...baseContext, cta: opt.label };
      const recommendations = lastRecommendationsRef.current;
      registrarSalidaWhatsApp(searchContext, "chatbot", recommendations);
      trackWhatsAppClick(null, "chatbot");
      trackEvent("chatbot_whatsapp", { has_search_filters: Object.keys(searchContext).length > 0 });
      window.open(advisorMessage(searchContext, recommendations), "_blank");
      setActiveStep("after_results");
      setFilters({});
      sendBot(
        [
          { text: "Te abrí WhatsApp con el resumen de tu búsqueda." },
          {
            text: atencion && !atencion.abierto
              ? `Ojo que ahora estamos fuera de horario, así que puede que Milton te conteste ${atencion.proximo}. Te responde él, no un automático.`
              : "Del otro lado te responde Milton, no un mensaje automático.",
          },
        ],
        "after_results"
      );
      return;
    }

    if (opt.next === "compare") {
      const recommendations = lastRecommendationsRef.current;
      const destination = lastSearchFilters.operacion === "alquiler" ? "after_results_alquiler" : "after_results";
      setActiveStep(destination);
      sendBot(
        recommendations.length > 1
          ? [{ text: "Te las comparo con los datos publicados. La mejor depende de qué quieras priorizar:", comparison: comparisonRows(recommendations) }]
          : [{ text: "Hay una sola finalista, así que por ahora no tengo otra equivalente para compararla." }],
        destination
      );
      return;
    }

    if (opt.next === "lead") {
      // Al aviso se puede llegar sin haber buscado nada, desde el menú de
      // alquiler. Sin esta marca el alta entraría como interés de compra, que
      // es justo lo contrario de lo que pidió.
      const contexto =
        opt.operacion && !lastSearchFilters.operacion
          ? { ...lastSearchFilters, operacion: opt.operacion }
          : lastSearchFilters;
      if (contexto !== lastSearchFilters) setLastSearchFilters(contexto);
      setActiveStep("lead");
      trackEvent("chatbot_lead_form", { operacion: contexto.operacion || "venta", has_search_filters: Object.keys(contexto).length > 0 });
      sendBot(
        [
          { text: "Dale, te aviso apenas entre una que encaje con lo que buscás." },
          {
            text: "Necesito tu nombre y un WhatsApp donde ubicarte. Si me dejás el email, te sumo también a la lista de avisos de propiedades nuevas.",
          },
        ],
        "lead"
      );
      return;
    }

    // El clima no es una sección del sitio ni una búsqueda: es el único paso
    // que trae un dato de afuera. Vuelve al mismo menú, como las derivaciones.
    if (opt.next === "clima") {
      setActiveStep("menu_vivir");
      mostrarClima();
      return;
    }

    // Derivación a una sección del sitio: Lucía comenta y deja la tarjeta. Los
    // botones que vuelven son los del mismo menú, para poder mirar otra cosa
    // sin repetir la pregunta.
    if (opt.recursos) {
      trackEvent("chatbot_guia", { recursos: opt.recursos.join(",") });
      setActiveStep(opt.next);
      sendBot(
        [{ text: opt.comentario, recursos: opt.recursos.map((clave) => RECURSOS[clave]) }],
        opt.next
      );
      return;
    }

    // Las opciones que arrancan un embudo limpian lo que haya quedado del
    // anterior: si no, una búsqueda de compra se filtraba dentro de la de
    // alquiler y viceversa.
    const base = opt.reinicia ? {} : currentFilters || {};
    const merged = opt.filter ? { ...base, ...opt.filter } : base;
    const answerKey = ANSWER_BY_STEP[activeStep];
    if (opt.reinicia) setWrittenAnswers({});
    else if (answerKey) setWrittenAnswers((previous) => ({ ...previous, [answerKey]: true }));

    if (opt.next === "after_budget") {
      const next = merged.objective === "construir" || merged.types?.some((type) => type.toLowerCase() === "lote")
        ? "ask_priority_lote"
        : "ask_bedrooms";
      setActiveStep(next);
      setFilters(merged);
      sendBot(bubblesOf(STEPS[next]), next);
      return;
    }

    if (opt.next === "results") {
      lastRecommendationsRef.current = [];
      setTyping(true);
      const catalog = dataset.length ? dataset : await cargarCatalogo();
      setTyping(false);
      if (!catalog) {
        setActiveStep("after_results");
        setFilters({});
        sendBot(
          [{ text: "No pude confirmar la disponibilidad actual del catálogo. Prefiero no recomendarte algo que podría ya no estar disponible. Si querés, Milton puede revisar tu búsqueda." }],
          "after_results"
        );
        return;
      }

      const found = filterProps(merged, catalog);
      setLastSearchFilters(merged);

      if (found.length === 0) {
        trackEvent("chatbot_sin_resultados", { operacion: "venta", busqueda: describeFilters(merged).join(" · ") });
        setActiveStep("after_results");
        setFilters({});

        // Antes de pedir los datos, mirar si hay algo cerca. El catálogo ya
        // está en memoria, así que no cuesta una consulta más.
        const cerca = aflojarFiltros(merged, catalog, filterProps);
        if (cerca) {
          const aproximadas = decorateRecommendations(cerca.found, merged, 3);
          lastRecommendationsRef.current = aproximadas;
          trackEvent("chatbot_resultados_aproximados", {
            operacion: "venta",
            cantidad: cerca.found.length,
            cedido: cerca.motivo,
          });
          sendBot(
            [
              { text: "Uf. Exactamente eso no lo tengo publicado en este momento.", delay: 1800 },
              {
                text: `Te muestro lo más parecido que hay hoy. Ojo: ${cerca.motivo}`,
                results: aproximadas,
                listado: cerca.found.length > aproximadas.length
                  ? { href: urlDelListado(cerca.filtros), total: cerca.found.length }
                  : undefined,
              },
              { text: "Y si preferís esperar por lo exacto, dejame tus datos y te aviso apenas entre." },
            ],
            "after_results"
          );
          return;
        }

        // Ni aflojando hay nada: acá sí es un catálogo que no tiene con qué
        // responderle. La única pausa larga del chat: cuando la noticia es
        // mala, la demora con lenguaje empático se recibe mejor que la
        // respuesta instantánea.
        sendBot(
          [
            { text: "Uf. Con esos filtros exactos no tengo nada publicado en este momento.", delay: 1800 },
            { text: "Pero acá entran propiedades todas las semanas. Si querés, dejame tus datos y te aviso apenas aparezca algo así." },
          ],
          "after_results"
        );
        return;
      }

      const destino = "after_results";
      setActiveStep(destino);
      setFilters({});

      const mostradas = recommendProperties(merged, catalog, 3);
      lastRecommendationsRef.current = mostradas;
      trackEvent("chatbot_resultados", { operacion: "venta", cantidad: found.length, refina: false });
      sendBot(
        [{
          text: reaccionResultados(found.length),
          results: mostradas,
          // El que quiere ver el resto se iba del chat y arrancaba de cero.
          listado: found.length > mostradas.length
            ? { href: urlDelListado(merged), total: found.length }
            : undefined,
        }],
        destino
      );
      return;
    }

    // Mismo motor, la otra cartera. La búsqueda se guarda con
    // `operacion: "alquiler"` para que el lead, el resumen de WhatsApp y el
    // link al listado sepan de qué operación se está hablando.
    if (opt.next === "results_alquiler") {
      lastRecommendationsRef.current = [];
      const busqueda = { ...merged, operacion: "alquiler" };
      setTyping(true);
      const catalog = dataset.length ? dataset : await cargarCatalogo();
      setTyping(false);
      if (!catalog) {
        setActiveStep("after_results_alquiler");
        setFilters({});
        sendBot(
          [{ text: "No pude confirmar qué alquileres siguen disponibles. Prefiero no mostrarte uno ocupado o reservado. Milton puede revisarlo por vos." }],
          "after_results_alquiler"
        );
        return;
      }

      const found = filterAlquileres(busqueda, catalog);
      setLastSearchFilters(busqueda);
      setActiveStep("after_results_alquiler");
      setFilters({});

      if (found.length === 0) {
        trackEvent("chatbot_sin_resultados", { operacion: "alquiler", busqueda: describeFilters(busqueda).join(" · ") });

        // Mismo criterio que en venta, con la otra cartera. Acá el aflojado
        // nunca toca el precio, porque este embudo no lo pregunta.
        const cerca = aflojarFiltros(busqueda, catalog, filterAlquileres);
        if (cerca) {
          const aproximados = decorateRecommendations(cerca.found, busqueda, 3);
          lastRecommendationsRef.current = aproximados;
          trackEvent("chatbot_resultados_aproximados", {
            operacion: "alquiler",
            cantidad: cerca.found.length,
            cedido: cerca.motivo,
          });
          sendBot(
            [
              { text: "Ahora mismo no tengo ningún alquiler permanente con esas características.", delay: 1800 },
              {
                text: `Esto es lo más parecido que tengo disponible. Ojo: ${cerca.motivo}`,
                results: aproximados,
                listado: cerca.found.length > aproximados.length
                  ? { href: urlDelListado(cerca.filtros), total: cerca.found.length }
                  : undefined,
              },
              { text: "Y si buscás justo lo otro, dejame tus datos: acá los alquileres permanentes duran días y te aviso apenas entre uno." },
            ],
            "after_results_alquiler"
          );
          return;
        }

        sendBot(
          [
            { text: "Ahora mismo no tengo ningún alquiler permanente con esas características.", delay: 1800 },
            { text: "Acá los alquileres permanentes son escasos y duran días. Si me dejás tus datos, te aviso apenas entre uno." },
          ],
          "after_results_alquiler"
        );
        return;
      }

      const mostrados = recommendProperties(busqueda, catalog, 3);
      lastRecommendationsRef.current = mostrados;
      trackEvent("chatbot_resultados", { operacion: "alquiler", cantidad: found.length });
      sendBot(
        [{
          text: reaccionAlquileres(found.length),
          results: mostrados,
          listado: found.length > mostrados.length
            ? { href: urlDelListado(busqueda), total: found.length }
            : undefined,
        }],
        "after_results_alquiler"
      );
      return;
    }

    setActiveStep(opt.next);
    setFilters(merged);
    sendBot(bubblesOf(STEPS[opt.next]), opt.next);
  };

  const askLuciaAI = async (text) => {
    cancelPending();
    const requestFlow = flowRef.current;
    const history = messages
      .filter((message) => message.text && (message.role === "user" || message.role === "bot"))
      .slice(-8)
      .map((message) => ({ role: message.role === "bot" ? "assistant" : "user", content: message.text }));

    setMessages((previous) => [...previous, { role: "user", text }]);
    setTyping(true);
    trackEvent("chatbot_ia_pregunta", { paso: activeStep, largo: text.length });

    try {
      const response = await fetch("/api/lucia/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history }),
      });
      const body = await response.json().catch(() => null);
      if (flowRef.current !== requestFlow) return;
      setTyping(false);

      if (!response.ok || !body?.ok || !body.answer) {
        trackEvent("chatbot_ia_respuesta", { ok: false, error: body?.error || `http_${response.status}` });
        sendBot(
          [{
            text: body?.error === "not_configured"
              ? "La parte conversacional todavía no tiene conectada la clave de OpenAI. Mientras tanto puedo buscar y comparar propiedades con el asistente guiado."
              : "No pude consultar mi conocimiento ahora mismo. Puedo seguir buscando propiedades con las opciones guiadas o pasarte con Milton.",
          }],
          activeStep
        );
        return;
      }

      const resources = (body.sources || []).map((item) => ({
        titulo: item.title,
        href: item.href,
        detalle: item.detail,
      }));
      trackEvent("chatbot_ia_respuesta", { ok: true, fuentes: resources.length });
      const commercialIntent = /\b(compr|alquil|vend|tas|invert|propiedad|casa|departamento|depto|lote|terreno|precio|mercado|credito|hipoteca)\w*/i.test(text);
      const shouldInvite = commercialIntent && !leadSent && !aiLeadInviteShownRef.current;
      if (shouldInvite) {
        aiLeadInviteShownRef.current = true;
        trackEvent("chatbot_lead_invitacion", { origen: "respuesta_ia" });
      }
      sendBot(
        [
          {
            text: body.answer,
            recursos: resources,
            feedback: body.answerId ? { answerId: body.answerId, model: body.model } : null,
          },
          ...(shouldInvite
            ? [{ text: "¿Querés que te avise cuando aparezca una propiedad que encaje con lo que buscás?" }]
            : []),
        ],
        shouldInvite ? "after_ai_capture" : activeStep
      );
    } catch {
      if (flowRef.current !== requestFlow) return;
      setTyping(false);
      trackEvent("chatbot_ia_respuesta", { ok: false, error: "network_error" });
      sendBot(
        [{ text: "Me quedé sin conexión para responder eso. La búsqueda guiada sigue disponible y Milton también puede ayudarte." }],
        activeStep
      );
    }
  };

  const handleText = (text) => {
    const parsed = parseLuciaText(text, activeStep);
    const startsFresh = activeStep === "welcome" || activeStep.startsWith("after_results");
    const base = startsFresh ? {} : filters;
    const plain = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const explicitSearch = /\bbusco\b|estoy buscando|quiero (comprar|alquilar|una casa|un departamento|un depto|un lote)|necesito (una casa|un departamento|un depto|un lote)/.test(plain);
    const openQuestion = text.includes("?") || /^(como|que|cual|donde|cuando|cuanto|por que|conviene|puedo|sabes|contame)/.test(plain.trim());
    const guidedStep = activeStep.startsWith("ask_");

    if (!guidedStep && (!parsed.searchIntent || (openQuestion && !explicitSearch))) {
      askLuciaAI(text);
      return;
    }

    const merged = { ...base, ...parsed.filters };
    const answers = startsFresh
      ? parsed.answered
      : { ...writtenAnswers, ...parsed.answered };
    const next = nextLuciaStep(merged, answers);
    setWrittenAnswers(answers);
    handleOption({ label: text, filter: parsed.filters, next, written: true }, base);
  };

  const receiveCommand = useEffectEvent((nextCommand) => {
    handledCommandRef.current = nextCommand.id;
    abrirChat(nextCommand.source || "internal");
    if (!nextCommand.question) return;
    if (nextCommand.autoSubmit) handleText(nextCommand.question);
    else setComposerDraft({ id: nextCommand.id, text: nextCommand.question });
  });

  // El comando vive en el provider, por lo que tampoco se pierde si el widget
  // dinámico termina de cargar después del clic hecho en la portada.
  useEffect(() => {
    if (!command || command.id === handledCommandRef.current) return;
    const timer = setTimeout(() => receiveCommand(command), 0);
    return () => clearTimeout(timer);
  }, [command]);

  // Envío optimista: registrarConsulta es fire-and-forget, igual que el resto
  // de los formularios del sitio.
  const handleLeadSubmit = ({ nombre, telefono, email }) => {
    cancelPending();
    registrarConsulta({
      tipo: "propiedad",
      nombre,
      telefono,
      email,
      mensaje: lastSearchFilters.operacion === "alquiler"
        ? "Pidió que le avisemos cuando entre un alquiler permanente como el que buscaba (asistente Lucía)."
        : "Pidió que le avisemos cuando entre una propiedad como la que buscaba (asistente Lucía).",
      detalle: {
        origen: "chatbot",
        filtros: lastSearchFilters,
        busqueda: describeFilters(lastSearchFilters),
        recomendaciones: lastRecommendationsRef.current.map((property) => ({
          id: property.id,
          titulo: property.title,
          motivos: property.luciaReasons || [],
        })),
      },
    });
    // Alta en la lista de avisos automáticos. Va aparte de la consulta y
    // también fire-and-forget: si falla, el lead ya quedó en el CRM igual.
    // Con barra final a propósito, ver la regla de trailingSlash del proyecto.
    if (email) {
      const alquiler = lastSearchFilters.operacion === "alquiler";
      fetch("/api/suscripcion/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          email,
          nombre,
          interes: alquiler ? "alquilar" : "comprar",
          source: "chatbot",
          tipo: tipoDeSuscripcion(lastSearchFilters),
          presupuesto: presupuestoTexto(lastSearchFilters),
          dormitorios: dormitoriosTexto(lastSearchFilters),
          whatsapp: telefono,
        }),
      }).catch(() => {});
      trackEvent("chatbot_suscripcion", { operacion: alquiler ? "alquiler" : "venta" });
    }
    trackEvent("chatbot_lead", {
      operacion: lastSearchFilters.operacion || "venta",
      has_search_filters: Object.keys(lastSearchFilters).length > 0,
      con_email: Boolean(email),
    });
    setLeadSent(true);
    setActiveStep("after_lead");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: [nombre, telefono, email].filter(Boolean).join(" · ") },
    ]);
    sendBot(
      [
        { text: `¡Listo, ${nombre.split(" ")[0]}! Ya quedaste anotado.` },
        {
          text: email
            ? "Quedaste también en la lista de avisos por mail. Te escribo apenas entre algo que encaje. ¿Seguimos mirando mientras tanto?"
            : "Te escribo apenas entre algo que encaje. ¿Querés seguir mirando mientras tanto?",
        },
      ],
      "after_lead"
    );
  };

  // leadSent no se resetea a propósito: a quien ya dejó sus datos no se los
  // volvemos a pedir aunque reinicie el chat.
  const resetChat = () => {
    cancelPending();
    setMessages([]);
    setFilters({});
    setLastSearchFilters({});
    setWrittenAnswers({});
    lastRecommendationsRef.current = [];
    saludar();
  };

  // Dónde arranca la respuesta actual de Lucía: el primer mensaje suyo después
  // del último del visitante. Cada camino del chat —botón, texto libre, chip del
  // clima, formulario— deja antes un mensaje del visitante, así que este índice
  // siempre cae en el lugar correcto. Vale -1 mientras no haya respuesta todavía.
  const turnStartIndex = (() => {
    let ultimoDelVisitante = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") { ultimoDelVisitante = i; break; }
    }
    const inicio = ultimoDelVisitante + 1;
    return inicio < messages.length && messages[inicio].role === "bot" ? inicio : -1;
  })();

  return (
    <>
      {open && (
        <div
          className="lucia-panel fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ height: "min(32rem, 70vh)" }}
        >
          <div
            className="text-white px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: AIRBNB, flexShrink: 0 }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden ring-2 ring-white/30">
                  <img src={LUCIA_AVATAR} alt="Lucía" className="h-full w-full object-cover" />
                </div>
                {atencion?.abierto && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2"
                    style={{ borderColor: AIRBNB }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">Lucía</p>
                <p className="text-xs text-white/70 leading-tight truncate">
                  {atencion === null
                    ? "Catalán Propiedades"
                    : atencion.abierto
                      ? `En línea · Milton atiende hasta las ${atencion.cierra}`
                      : `Milton atiende ${atencion.proximo}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {clima && (
                <button
                  onClick={climaDesdeHeader}
                  title={`San Martín de los Andes: ${clima.ahora.temperatura}°${clima.ahora.estado ? `, ${clima.ahora.estado}` : ""}`}
                  className="flex items-center gap-1 rounded-full bg-white/20 hover:bg-white/30 px-2 py-1 text-xs font-semibold leading-none transition"
                >
                  <ClimaIcono nombre={clima.ahora.icono} />
                  {clima.ahora.temperatura}°
                </button>
              )}
              <button onClick={resetChat} className="text-white/70 hover:text-white text-base leading-none" title="Reiniciar chat">↺</button>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-2xl leading-none" aria-label="Cerrar">×</button>
            </div>
          </div>

          <div ref={messagesBoxRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const stepOptions = msg.stepKey ? STEPS[msg.stepKey]?.options : null;

              return (
                <div key={i} ref={i === turnStartIndex ? turnStartRef : null}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "text-white rounded-br-sm"
                          : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                      }`}
                      style={msg.role === "user" ? { backgroundColor: AIRBNB } : {}}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {msg.recursos && msg.recursos.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.recursos.map((recurso) => (
                        <Link
                          key={recurso.href}
                          href={recurso.href}
                          onClick={() => setOpen(false)}
                          className="block bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition border border-gray-100"
                        >
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{recurso.titulo}</p>
                          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{recurso.detalle}</p>
                          <span className="text-[11px] font-semibold mt-1.5 inline-block" style={{ color: AIRBNB }}>
                            Abrir →
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.results && msg.results.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.results.map((prop) => (
                        <Link
                          key={prop.id}
                          href={`/propiedades/${getPropertySlug(prop)}`}
                          data-lucia-property={prop.id}
                          onClick={() => setOpen(false)}
                          className="flex gap-3 bg-white rounded-xl p-2.5 shadow-sm hover:shadow-md transition border border-gray-100"
                        >
                          <Miniatura prop={prop} />
                          <div className="min-w-0 flex flex-col justify-center gap-0.5">
                            <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{prop.title}</p>
                            {zonaDe(prop) && (
                              <p className="text-[11px] text-gray-400 leading-tight">{zonaDe(prop)}</p>
                            )}
                           <p className="text-xs font-bold" style={{ color: AIRBNB }}>
                             {precioTexto(prop)}
                           </p>
                            {prop.luciaReasons?.length > 0 && (
                              <ul className="mt-1 space-y-0.5 text-[10px] leading-snug text-gray-500">
                                {prop.luciaReasons.map((reason) => <li key={reason}>• {reason}</li>)}
                              </ul>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.comparison?.length > 0 && <LuciaComparison rows={msg.comparison} />}

                  {msg.feedback && (
                    <LuciaFeedback
                      feedback={msg.feedback}
                      pagePath={pathname}
                      onTracked={(rating) => trackEvent("chatbot_feedback", { rating })}
                    />
                  )}

                  {msg.listado && (
                    <Link
                      href={msg.listado.href}
                      onClick={() => {
                        trackEvent("chatbot_ver_listado", { total: msg.listado.total, href: msg.listado.href });
                        setOpen(false);
                      }}
                      className="mt-2 block text-center bg-white rounded-xl py-2 shadow-sm hover:shadow-md transition border border-gray-100 text-xs font-semibold"
                      style={{ color: AIRBNB }}
                    >
                      Ver las {msg.listado.total} en el listado →
                    </Link>
                  )}

                  {msg.role === "bot" && isLast && !typing && stepOptions && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                      {stepOptions
                        .filter((opt) => !(opt.next === "lead" && leadSent))
                        .map((opt, j) => (
                          <QuickReply key={j} label={opt.label} icono={opt.icono} onClick={() => handleOption(opt, filters)} />
                        ))}
                    </div>
                  )}

                  {msg.role === "bot" && isLast && !typing && msg.stepKey === "lead" && (
                    <LeadForm onSubmit={handleLeadSubmit} />
                  )}
                </div>
              );
            })}

            {typing && <TypingDots />}
            <div ref={messagesEndRef} />
          </div>
          <LuciaComposer
            key={composerDraft?.id || "composer"}
            onSubmit={handleText}
            disabled={typing}
            initialText={composerDraft?.text || ""}
          />
        </div>
      )}

      {!open && invitacion && (
        <div className="lucia-invitacion fixed bottom-24 right-4 sm:right-6 z-50 flex items-start gap-2" style={{ maxWidth: "18rem" }}>
          <button
            onClick={() => abrirChat("invitacion")}
            className="text-left bg-white text-gray-800 rounded-2xl rounded-br-sm shadow-xl border border-gray-100 px-3.5 py-3 hover:shadow-2xl transition"
          >
            <span className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: AIRBNB }}>
              Lucía
            </span>
            <span className="block text-sm leading-snug">{invitacion}</span>
          </button>
          <button
            onClick={() => descartarInvitacion()}
            aria-label="Cerrar el aviso"
            className="mt-1 w-6 h-6 flex-shrink-0 rounded-full bg-white border border-gray-100 shadow text-gray-400 hover:text-gray-700 text-base leading-none"
          >
            ×
          </button>
        </div>
      )}

      <button
        onClick={() => (open ? setOpen(false) : abrirChat())}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-white p-1 flex items-center justify-center text-gray-500 transition-transform duration-200 hover:scale-110"
        style={{ boxShadow: "0 10px 30px rgba(255,90,95,.30), 0 2px 8px rgba(0,0,0,.12)" }}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? <CloseIcon /> : <img src={LUCIA_AVATAR} alt="" className="h-full w-full rounded-full object-cover" />}
        {!open && invitacion && (
          <span
            className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ backgroundColor: AIRBNB }}
          />
        )}
      </button>
    </>
  );
}

function LuciaComposer({ onSubmit, disabled, initialText }) {
  const [text, setText] = useState(initialText);

  const submit = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    setText("");
    onSubmit(value);
  };

  return (
    <form onSubmit={submit} className="flex flex-shrink-0 gap-2 border-t border-gray-100 bg-white p-2.5">
      <input
        autoFocus={Boolean(initialText)}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Escribile a Lucía..."
        aria-label="Mensaje para Lucía"
        maxLength={300}
        className="min-w-0 flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-full px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
        style={{ backgroundColor: AIRBNB }}
      >
        Enviar
      </button>
    </form>
  );
}

function LuciaFeedback({ feedback, pagePath, onTracked }) {
  const [state, setState] = useState("idle");
  const [showDetails, setShowDetails] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  const send = async (rating, selectedReason = null) => {
    if (state === "sending" || state === "sent") return;
    setState("sending");
    try {
      const response = await fetch("/api/lucia-feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId: feedback.answerId,
          rating,
          reason: selectedReason,
          comment,
          model: feedback.model,
          pagePath,
        }),
      });
      if (!response.ok) throw new Error("feedback_error");
      setState("sent");
      onTracked(rating);
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return <p className="mt-2 pl-1 text-[11px] font-medium text-emerald-700">Gracias, esto nos ayuda a mejorar a Lucía.</p>;
  }

  if (showDetails) {
    return (
      <div className="mt-2 rounded-xl border border-gray-100 bg-white p-2.5 text-[11px] text-gray-600">
        <p className="font-semibold text-gray-700">¿Qué faltó?</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {[
            ["incorrect", "Dato incorrecto"],
            ["outdated", "Desactualizada"],
            ["not_understood", "No entendió"],
            ["incomplete", "Le faltó información"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setReason(value)}
              className={`rounded-full border px-2 py-1 ${reason === value ? "border-rose-300 bg-rose-50 text-rose-700" : "border-gray-200 hover:border-gray-300"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label htmlFor={`lucia-feedback-${feedback.answerId}`} className="mt-2 block font-semibold text-gray-700">
          Comentario <span className="font-normal text-gray-400">opcional</span>
        </label>
        <textarea
          id={`lucia-feedback-${feedback.answerId}`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={500}
          rows={2}
          placeholder="No incluyas datos personales."
          className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 p-2 outline-none focus:border-rose-300"
        />
        <div className="mt-1.5 flex items-center gap-2">
          <button onClick={() => send(-1, reason || null)} disabled={state === "sending"} className="rounded-full bg-gray-900 px-3 py-1.5 font-semibold text-white disabled:opacity-50">
            {state === "sending" ? "Enviando..." : "Enviar"}
          </button>
          {state === "error" && <span className="text-rose-600">No se pudo enviar.</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex items-center gap-1 pl-1 text-[11px] text-gray-400">
      <span>¿Te sirvió?</span>
      <button onClick={() => send(1)} disabled={state === "sending"} aria-label="La respuesta fue útil" className="rounded px-1.5 py-0.5 hover:bg-white hover:text-gray-700 disabled:opacity-50">Sí</button>
      <button onClick={() => setShowDetails(true)} aria-label="La respuesta no fue útil" className="rounded px-1.5 py-0.5 hover:bg-white hover:text-gray-700">No</button>
      {state === "error" && <button onClick={() => send(1)} className="text-rose-600">Reintentar</button>}
    </div>
  );
}

function LuciaComparison({ rows }) {
  const value = (number, suffix = "") => number === null ? "Sin dato" : `${number.toLocaleString("es-AR")}${suffix}`;
  const price = (row) => row.price === null
    ? "Consultar"
    : row.currency === "USD"
      ? `USD ${row.price.toLocaleString("es-AR")}`
      : `$${row.price.toLocaleString("es-AR")}/mes`;

  return (
    <div aria-label="Comparación de propiedades" className="mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {rows.map((row, index) => (
        <div key={row.id} className={`p-2.5 ${index ? "border-t border-gray-100" : ""}`}>
          <p className="text-[11px] font-semibold leading-snug text-gray-800">{row.title}</p>
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-gray-500">
            <span>{price(row)}</span>
            <span>{value(row.area, " m²")}</span>
            <span>{value(row.bedrooms, " dorm.")}</span>
            <span>{value(row.bathrooms, " baños")}</span>
            {row.roi !== null && <span>ROI informado: {value(row.roi, "%")}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Indicador gráfico, no textual: los tres puntitos suben la sensación de
// presencia, mientras que la palabra "escribiendo…" no tuvo efecto medible.
function TypingDots() {
  return (
    <div className="flex justify-start" aria-label="Lucía está escribiendo" role="status">
      <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm px-3.5 py-3 flex items-center gap-1">
        <span className="lucia-dot block w-1.5 h-1.5 rounded-full bg-gray-400" />
        <span className="lucia-dot block w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: "0.18s" }} />
        <span className="lucia-dot block w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: "0.36s" }} />
      </div>
    </div>
  );
}

// La fila puede venir sin `image` (galería migrada a `images`) o sin ninguna
// foto cargada. En ese caso va un bloque neutro, no una imagen rota.
function Miniatura({ prop }) {
  const foto = fotoDe(prop);
  if (!foto) return <div className="w-20 h-16 rounded-lg flex-shrink-0 bg-gray-100" aria-hidden="true" />;
  return <img src={foto} alt={prop.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />;
}

// El email es opcional a propósito: es lo que engancha al visitante con los
// avisos automáticos, pero pedirlo como obligatorio sumaba un campo más a un
// formulario dentro de un chat. El que no lo quiera dar llega al CRM igual.
function LeadForm({ onSubmit }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const emailLimpio = email.trim().toLowerCase();
  const emailValido = emailLimpio === "" || EMAIL_RE.test(emailLimpio);
  const listo = nombre.trim().length >= 2 && telefono.trim().length >= 6 && emailValido;

  const enviar = (e) => {
    e.preventDefault();
    if (!listo || enviado) return;
    setEnviado(true);
    onSubmit({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: emailLimpio || null,
    });
  };

  return (
    <form
      onSubmit={enviar}
      className="mt-2 ml-1 bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 p-3 space-y-2"
    >
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Tu nombre"
        autoComplete="name"
        maxLength={100}
        className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400"
      />
      <input
        type="tel"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        placeholder="Tu WhatsApp"
        autoComplete="tel"
        maxLength={40}
        className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email (opcional)"
        autoComplete="email"
        inputMode="email"
        maxLength={120}
        aria-invalid={!emailValido}
        className={`w-full text-sm px-3 py-2 rounded-xl border focus:outline-none ${
          emailValido
            ? "border-gray-200 focus:border-gray-400"
            : "border-red-300 focus:border-red-400"
        }`}
      />
      <button
        type="submit"
        disabled={!listo || enviado}
        className="w-full py-2 rounded-xl text-white text-sm font-medium transition disabled:opacity-40"
        style={{ backgroundColor: AIRBNB }}
      >
        {enviado ? "Enviando…" : "Avisame"}
      </button>
      <p className="text-[11px] text-gray-400 leading-tight">
        Solo lo usamos para avisarte de propiedades como la que buscás. Con el email
        entrás además a la lista de avisos.
      </p>
    </form>
  );
}

function QuickReply({ label, icono, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-xs px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5"
      style={{ borderColor: AIRBNB, backgroundColor: hovered ? AIRBNB : "white", color: hovered ? "white" : AIRBNB }}
    >
      {icono && <OpcionIcono nombre={icono} />}
      {label}
    </button>
  );
}

// Íconos de línea del mismo grosor que el resto del sitio. Reemplazan a los
// emojis, que leían como plantilla y encima cambian de dibujo en cada sistema.
// El ícono del chip del header. `nombre` sale del código WMO en lib/clima.js,
// nunca de leer la descripción en castellano.
function ClimaIcono({ nombre }) {
  const comun = { className: "w-3.5 h-3.5 flex-shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const nube = <path d="M6.5 18a4 4 0 01.3-8 5.5 5.5 0 0110.6 1.3A3.4 3.4 0 0117 18z" />;
  if (nombre === "sol") {
    return <svg {...comun}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M5 5l1.5 1.5" /><path d="M17.5 17.5L19 19" /><path d="M19 5l-1.5 1.5" /><path d="M6.5 17.5L5 19" /></svg>;
  }
  if (nombre === "nube") return <svg {...comun}>{nube}</svg>;
  if (nombre === "lluvia") {
    return <svg {...comun}><path d="M6.5 15a4 4 0 01.3-8 5.5 5.5 0 0110.6 1.3A3.4 3.4 0 0117 15z" /><path d="M8 19l-1 2" /><path d="M12 19l-1 2" /><path d="M16 19l-1 2" /></svg>;
  }
  if (nombre === "nieve") {
    return <svg {...comun}><path d="M6.5 15a4 4 0 01.3-8 5.5 5.5 0 0110.6 1.3A3.4 3.4 0 0117 15z" /><path d="M9 19h.01" /><path d="M12.5 20.5h.01" /><path d="M16 19h.01" /></svg>;
  }
  if (nombre === "tormenta") {
    return <svg {...comun}><path d="M6.5 15a4 4 0 01.3-8 5.5 5.5 0 0110.6 1.3A3.4 3.4 0 0117 15z" /><path d="M13 17l-2.5 3.5h3L11 24" /></svg>;
  }
  // Código sin familia asignada: el termómetro no afirma nada del cielo.
  return <svg {...comun}><path d="M10 13.5V5a2 2 0 114 0v8.5a4 4 0 11-4 0z" /></svg>;
}

function OpcionIcono({ nombre }) {
  const comun = { className: "w-3.5 h-3.5 flex-shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  if (nombre === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
      </svg>
    );
  }
  if (nombre === "llave") {
    return <svg {...comun}><circle cx="8" cy="15" r="4" /><path d="M10.9 12.1L21 2" /><path d="M17.5 5.5L20 8" /></svg>;
  }
  if (nombre === "casa") {
    return <svg {...comun}><path d="M3 10.5L12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5" /></svg>;
  }
  if (nombre === "grafico") {
    return <svg {...comun}><path d="M4 20v-8" /><path d="M10 20V5" /><path d="M16 20v-6" /><path d="M2 20h20" /></svg>;
  }
  if (nombre === "campana") {
    return <svg {...comun}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>;
  }
  if (nombre === "montana") {
    return <svg {...comun}><path d="M3 20l6.5-11 4 6 2.5-4L21 20z" /><path d="M9.5 9l2 3.5" /></svg>;
  }
  if (nombre === "clima") {
    return <svg {...comun}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M5 5l1.5 1.5" /><path d="M17.5 17.5L19 19" /><path d="M19 5l-1.5 1.5" /><path d="M6.5 17.5L5 19" /></svg>;
  }
  if (nombre === "reiniciar") {
    return <svg {...comun}><path d="M3 12a9 9 0 019-9 9 9 0 016.7 3H21" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 01-9 9 9 9 0 01-6.7-3H3" /><path d="M3 21v-5h5" /></svg>;
  }
  return <svg {...comun}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
  );
}
