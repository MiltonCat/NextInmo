// Fuente de verdad única de los barrios de San Martín de los Andes.
//
// Antes había tres listas distintas que no coincidían: la del post
// /blog/donde-vivir-san-martin-de-los-andes (6 barrios con perfil completo), la
// de /precio-m2 (5 zonas con precio) y la del formulario de la Guía de Barrios
// (9 opciones). Solo Centro y Chapelco Golf estaban en las tres, así que las
// opiniones que entraban por el formulario no se podían cruzar con nada.
//
// Acá viven los nombres canónicos y sus slugs. Todo lo que agregue opiniones,
// muestre fichas o cruce precios tiene que leer de este archivo.
//
// `alias` existe porque el nombre escrito varía según la fuente ("La Cascada"
// vs "Barrio La Cascada", "Lácar" vs "Lacar"). Sirve para normalizar tanto los
// datos viejos como el campo `location` de las propiedades.

import { BARRIOS_NUEVOS_LISTOS } from "@/data/barriosNuevos";

export const BARRIOS = [
  {
    slug: "centro",
    nombre: "Centro",
    alias: ["centro", "el centro", "casco centrico", "casco céntrico"],
    perfilCompleto: true,
    tienePrecio: true,
  },
  {
    slug: "chapelco-golf",
    nombre: "Chapelco Golf",
    alias: ["chapelco golf", "chapelco", "chapelco golf & resort"],
    perfilCompleto: true,
    tienePrecio: true,
  },
  {
    slug: "la-cascada",
    nombre: "La Cascada",
    alias: ["la cascada", "barrio la cascada"],
    perfilCompleto: true,
    tienePrecio: false,
  },
  {
    slug: "vega-maipu",
    nombre: "Vega Maipú",
    alias: ["vega maipu", "vega maipú", "barrio vega maipu"],
    perfilCompleto: true,
    tienePrecio: false,
  },
  {
    slug: "penon-de-lolog",
    nombre: "Peñón de Lolog",
    alias: ["penon de lolog", "peñón de lolog", "peñon de lolog", "lolog"],
    perfilCompleto: true,
    tienePrecio: false,
  },
  {
    slug: "caleuche",
    nombre: "Caleuche",
    alias: ["caleuche", "barrio caleuche"],
    perfilCompleto: true,
    tienePrecio: false,
  },
  {
    slug: "costanera",
    nombre: "Costanera",
    alias: ["costanera", "la costanera"],
    perfilCompleto: false,
    tienePrecio: true,
  },
  {
    slug: "las-marias",
    nombre: "Las Marías",
    alias: ["las marias", "las marías"],
    perfilCompleto: false,
    tienePrecio: true,
  },
  {
    slug: "las-pendientes",
    nombre: "Las Pendientes",
    alias: ["las pendientes", "pendientes"],
    perfilCompleto: false,
    tienePrecio: true,
  },
  {
    slug: "via-blanca",
    nombre: "Vía Blanca",
    alias: ["via blanca", "vía blanca"],
    perfilCompleto: false,
    tienePrecio: false,
  },
  {
    slug: "arrayan",
    nombre: "Arrayán",
    alias: ["arrayan", "arrayán", "cerro arrayan", "cerro arrayán"],
    perfilCompleto: false,
    tienePrecio: false,
  },
  {
    slug: "lacar",
    nombre: "Lácar",
    alias: ["lacar", "lácar", "barrio lacar"],
    perfilCompleto: false,
    tienePrecio: false,
  },
  {
    slug: "patagonia-norte",
    nombre: "Patagonia Norte",
    alias: ["patagonia norte"],
    perfilCompleto: false,
    tienePrecio: false,
  },

  // ── Agregados el 2026-08-14 ────────────────────────────────────────────────
  //
  // Salieron de cargar el barrio de la cartera real: son las zonas donde Milton
  // tiene propiedades publicadas y que esta lista todavía no contemplaba. Sin
  // ellas, esas propiedades no podían guardar su barrio (la restricción de la
  // base las rechaza) y quedaban fuera de las fichas de zona.
  //
  // Van con `tienePrecio: false` porque el relevamiento del modelo no llega al
  // mínimo de propiedades para publicarles una mediana. Eso es correcto: se
  // muestran con su m² y sin comparación, en vez de con un número inventado.
  {
    slug: "vega-san-martin",
    nombre: "Vega San Martín",
    alias: ["vega san martin", "vega san martín", "barrio vega san martin"],
    perfilCompleto: false,
    tienePrecio: false,
  },
  {
    slug: "orillas-del-quilquihue",
    nombre: "Orillas del Quilquihue",
    alias: [
      "orillas del quilquihue",
      "orillas del quilquihué",
      "quilquihue",
      "quilquihué",
    ],
    perfilCompleto: false,
    tienePrecio: false,
  },
  {
    slug: "san-fernando",
    nombre: "San Fernando",
    alias: ["san fernando", "barrio san fernando"],
    perfilCompleto: false,
    tienePrecio: false,
  },
  {
    slug: "las-nalcas",
    nombre: "Las Nalcas",
    alias: ["las nalcas", "barrio las nalcas", "nalcas"],
    perfilCompleto: false,
    tienePrecio: false,
  },
  {
    slug: "ruca-hue",
    nombre: "Ruca Hue",
    alias: ["ruca hue", "barrio ruca hue", "rucahue"],
    perfilCompleto: false,
    tienePrecio: false,
  },
];

// Slug reservado para quien elige "Otro" en el formulario. No es un barrio real:
// existe para no perder la respuesta de alguien que vive en una zona que
// todavía no listamos. Se revisa en moderación y, si aparece seguido, se
// promueve a barrio propio en este mismo archivo.
export const BARRIO_OTRO = "otro";

export const BARRIO_SLUGS = BARRIOS.map((b) => b.slug);

// Slugs válidos para guardar una opinión (incluye "otro").
export const SLUGS_VALIDOS = new Set([...BARRIO_SLUGS, BARRIO_OTRO]);

const PORNOMBRE = new Map();
for (const b of BARRIOS) {
  PORNOMBRE.set(b.slug, b);
  for (const a of b.alias) PORNOMBRE.set(a, b);
}

// Quita acentos y normaliza para poder comparar strings escritos a mano.
function limpiar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Devuelve el barrio canónico a partir de un slug, nombre o alias.
// Null si no matchea ninguno.
export function getBarrio(valor) {
  if (!valor) return null;
  const limpio = limpiar(valor);
  for (const [clave, barrio] of PORNOMBRE) {
    if (limpiar(clave) === limpio) return barrio;
  }
  return null;
}

// Nombre legible de un slug. "otro" tiene su propia etiqueta.
export function nombreDeBarrio(slug) {
  if (slug === BARRIO_OTRO) return "Otro / no listado";
  return getBarrio(slug)?.nombre ?? slug;
}

// Intenta deducir el barrio desde el campo `location` de una propiedad, que hoy
// es texto libre ("Peñón de Lolog, San Martín de los Andes"). Devuelve el
// barrio o null si no se puede determinar — nunca adivina.
export function barrioDesdeLocation(location) {
  const limpio = limpiar(location);
  if (!limpio) return null;
  for (const barrio of BARRIOS) {
    for (const alias of barrio.alias) {
      if (limpio.includes(limpiar(alias))) return barrio;
    }
  }
  return null;
}

// Barrio de una propiedad. Primero el campo `barrio` cargado a mano; si no está,
// se intenta deducir del texto de `location`.
//
// Por qué existe (2026-08-14): hasta hoy el barrio se deducía SOLO de
// `location`, que es texto libre y en la mayoría de las fichas trae la
// dirección sola — "Rivadavia 155, San Martín de los Andes". Al medirlo, 6 de
// las 8 propiedades en venta no matcheaban ningún barrio. Como
// /barrios/[slug] usa esta misma deducción para listar sus propiedades, las
// fichas de barrio quedaban vacías: Centro, con 281 propiedades relevadas y el
// barrio más buscado del sitio, no mostraba ninguna.
//
// El campo explícito es la fuente de verdad y el texto libre queda como red:
// una propiedad vieja sin `barrio` cargado sigue funcionando como antes, y una
// nueva con el barrio elegido en el panel no depende de cómo se escribió la
// dirección.
export function barrioDePropiedad(propiedad) {
  if (!propiedad) return null;
  return getBarrio(propiedad.barrio) ?? barrioDesdeLocation(propiedad.location);
}

// Barrios que ya tienen ficha con datos propios (los 6 del post del blog).
// Un barrio tiene ficha si está marcado a mano acá (los seis originales) o si
// alguien le escribió una descripción en data/barriosNuevos.js. Se deriva del
// dato y no de una segunda bandera a propósito: si hubiera que acordarse de
// poner `perfilCompleto: true` además de escribir el perfil, el barrio nuevo
// quedaría publicado en su URL pero invisible en el listado y en el sitemap.
//
// Se importa el archivo de datos, que no importa nada, y no lib/barriosPerfil:
// ese pasa por precioZonas, que importa este archivo, y sería un ciclo.
const SLUGS_NUEVOS_LISTOS = new Set(BARRIOS_NUEVOS_LISTOS.map((b) => b.slug));

export function barriosConPerfil() {
  return BARRIOS.filter((b) => b.perfilCompleto || SLUGS_NUEVOS_LISTOS.has(b.slug));
}
