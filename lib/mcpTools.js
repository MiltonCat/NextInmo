import "server-only";

import { SITE_URL } from "@/config";
import { PERFILES_BARRIO } from "@/lib/barriosPerfil";
import { eligibleProperties } from "@/lib/luciaAdvisor.mjs";
import { MERCADO_GENERADO, RANGO_M2, RELEVADAS_PUBLICO, VALOR_M2 } from "@/lib/mercado";
import { barriosConMediana, medianaDeBarrioPorTipo } from "@/lib/precioZonas";
import { rest } from "@/lib/supabaseRest";
import { getPropertySlug } from "@/data/properties";

// Las tres herramientas que este sitio le ofrece a un asistente de IA.
//
// Reglas, las mismas que rigen a Lucía:
//  - Solo se devuelve lo que ya está publicado en el sitio.
//  - Si el catálogo en vivo no contesta, NO se sirve el respaldo estático como
//    si fuera disponibilidad actual: se avisa que no se pudo confirmar.
//  - Todo precio de mercado viaja con su fecha y con la aclaración de que es
//    precio publicado, no de cierre.
//  - Cada resultado lleva su URL en el sitio, para que el asistente pueda citar.

const LIMITE_DEFECTO = 5;
const LIMITE_MAXIMO = 10;

const url = (path) => `${SITE_URL}${path}`;
const normalizar = (valor) =>
  String(valor || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Igual que en luciaKnowledge: se pide el catálogo en vivo y se sabe si llegó.
async function catalogoEnVivo() {
  try {
    // select=* a propósito. La tabla NO tiene exactamente las columnas del array
    // de respaldo de data/properties.js — "noDisponible", por ejemplo, no existe
    // en la base—, y pedir una columna inexistente hace fallar la consulta
    // entera: el server queda diciendo "no pude confirmar el catálogo" para
    // siempre. Es exactamente lo que pasó la primera vez que se probó esto.
    // hasPublicPage() lee esa bandera igual: si no viene, queda undefined, que
    // es lo mismo que hacen el resto de las pantallas del sitio.
    const filas = await rest(`properties?select=*&order=sort_order.asc.nullslast`, { cache: "no-store" });
    return { filas: Array.isArray(filas) ? filas : [], fresco: true };
  } catch (error) {
    console.error("[MCP/catalogo]", error?.message || error);
    return { filas: [], fresco: false };
  }
}

function fichaDePropiedad(p, alquiler) {
  return {
    titulo: p.title,
    operacion: alquiler ? "alquiler permanente" : "venta",
    tipo: p.type || null,
    barrio: p.barrio || p.location || null,
    precio: alquiler ? p.precioAlquilerARS ?? null : p.price ?? null,
    moneda: alquiler ? "ARS por mes" : "USD",
    dormitorios: p.bedrooms ?? null,
    banos: p.bathrooms ?? null,
    superficie_m2: p.area ?? null,
    url: url(`/propiedades/${getPropertySlug(p)}/`),
  };
}

function texto(lineas) {
  return [{ type: "text", text: lineas.filter(Boolean).join("\n") }];
}

function errorDeHerramienta(mensaje) {
  return { content: [{ type: "text", text: mensaje }], isError: true };
}

// ---------------------------------------------------------------- herramientas

async function buscarPropiedades(args = {}) {
  const alquiler = normalizar(args.operacion) === "alquiler";
  const limite = Math.min(Math.max(Number(args.limite) || LIMITE_DEFECTO, 1), LIMITE_MAXIMO);

  const catalogo = await catalogoEnVivo();
  if (!catalogo.fresco) {
    return errorDeHerramienta(
      "No se pudo consultar el catálogo en este momento, así que no puedo confirmar qué hay disponible. " +
      `El listado siempre actualizado está en ${url("/propiedades/")}.`
    );
  }

  const filtros = {
    operacion: alquiler ? "alquiler" : "venta",
    types: args.tipo ? [String(args.tipo)] : undefined,
    minBedrooms: Number.isFinite(Number(args.dormitorios_min)) ? Number(args.dormitorios_min) : undefined,
    maxPrice: !alquiler && Number(args.presupuesto_max_usd) ? Number(args.presupuesto_max_usd) : undefined,
  };

  let encontradas = eligibleProperties(filtros, catalogo.filas);
  if (args.barrio) {
    const buscado = normalizar(args.barrio);
    const porBarrio = encontradas.filter((p) =>
      normalizar(`${p.barrio || ""} ${p.location || ""}`).includes(buscado));
    if (porBarrio.length) encontradas = porBarrio;
  }

  const total = encontradas.length;
  const items = encontradas.slice(0, limite).map((p) => fichaDePropiedad(p, alquiler));
  const listado = url(alquiler ? "/alquileres/" : "/propiedades/");

  if (!total) {
    return {
      content: texto([
        "No hay nada publicado que cumpla con eso ahora mismo.",
        `Todo lo que hay está en ${listado}.`,
      ]),
      structuredContent: { total: 0, propiedades: [], listado },
    };
  }

  return {
    content: texto([
      `${total} propiedad${total === 1 ? "" : "es"} de ${alquiler ? "alquiler permanente" : "venta"}${total > items.length ? `, muestro ${items.length}` : ""}:`,
      ...items.map((p) => {
        const precio = p.precio === null
          ? "precio a consultar"
          : alquiler ? `$${Number(p.precio).toLocaleString("es-AR")}/mes` : `USD ${Number(p.precio).toLocaleString("es-AR")}`;
        return `- ${p.titulo} — ${precio}${p.barrio ? ` — ${p.barrio}` : ""}${p.dormitorios ? ` — ${p.dormitorios} dorm.` : ""} — ${p.url}`;
      }),
      total > items.length ? `Listado completo: ${listado}` : null,
    ]),
    structuredContent: { total, propiedades: items, listado },
  };
}

async function precioM2PorBarrio(args = {}) {
  const aclaracion =
    "Son medianas de precios PUBLICADOS relevados, no precios de cierre de operaciones. " +
    `Relevamiento sobre ${RELEVADAS_PUBLICO} propiedades, datos al ${MERCADO_GENERADO}.`;
  const fuente = url("/precio-m2/");
  const tipo = args.tipo ? String(args.tipo) : null;

  if (args.barrio) {
    const buscado = normalizar(args.barrio);
    const perfil = PERFILES_BARRIO.find(
      (b) => normalizar(b.nombre) === buscado || normalizar(b.slug) === buscado || normalizar(b.nombre).includes(buscado));
    if (!perfil) {
      return errorDeHerramienta(
        `No tengo un relevamiento propio de "${args.barrio}". Los barrios con dato publicado son: ` +
        `${PERFILES_BARRIO.map((b) => b.nombre).join(", ")}.`
      );
    }
    const porTipo = tipo ? medianaDeBarrioPorTipo(perfil.slug, tipo) : null;
    const dato = porTipo ?? barriosConMediana().find((b) => b.slug === perfil.slug) ?? null;
    if (!dato) {
      return {
        content: texto([
          `Para ${perfil.nombre} hay menos de 4 propiedades relevadas, así que no publicamos una mediana.`,
          aclaracion,
        ]),
        structuredContent: { barrio: perfil.nombre, mediana_m2_usd: null, aclaracion, fuente },
      };
    }
    const mediana = dato.medianaM2 ?? dato.mediana ?? null;
    return {
      content: texto([
        `${perfil.nombre}${tipo ? ` (${tipo})` : ""}: mediana de USD ${Number(mediana).toLocaleString("es-AR")} por m².`,
        aclaracion,
        `Detalle por zona: ${fuente}`,
      ]),
      structuredContent: {
        barrio: perfil.nombre, tipo, mediana_m2_usd: mediana,
        propiedades_relevadas: dato.n ?? null, datos_al: MERCADO_GENERADO, aclaracion, fuente,
      },
    };
  }

  const barrios = barriosConMediana().map((b) => ({
    barrio: b.nombre ?? b.slug,
    mediana_m2_usd: b.medianaM2 ?? b.mediana ?? null,
    propiedades_relevadas: b.n ?? null,
  }));
  return {
    content: texto([
      `Valor del m² en San Martín de los Andes, datos al ${MERCADO_GENERADO}:`,
      ...Object.entries(VALOR_M2).map(([t, v]) => `- ${t}: mediana USD ${Number(v).toLocaleString("es-AR")}/m²`),
      barrios.length ? "Por barrio:" : null,
      ...barrios.map((b) => `- ${b.barrio}: USD ${Number(b.mediana_m2_usd).toLocaleString("es-AR")}/m²`),
      aclaracion,
      `Metodología y fuentes: ${fuente}`,
    ]),
    structuredContent: {
      datos_al: MERCADO_GENERADO, mediana_por_tipo_usd: VALOR_M2,
      rango_por_tipo_usd: RANGO_M2, por_barrio: barrios, aclaracion, fuente,
    },
  };
}

async function perfilBarrio(args = {}) {
  const buscado = normalizar(args.barrio);
  if (!buscado) {
    return {
      content: texto([
        "Barrios de San Martín de los Andes con perfil publicado:",
        ...PERFILES_BARRIO.map((b) => `- ${b.nombre}: ${b.descripcion}`),
        `Detalle de cada uno: ${url("/barrios/")}`,
      ]),
      structuredContent: {
        barrios: PERFILES_BARRIO.map((b) => ({
          nombre: b.nombre, descripcion: b.descripcion, url: url(`/barrios/${b.slug}/`),
        })),
      },
    };
  }

  const perfil = PERFILES_BARRIO.find(
    (b) => normalizar(b.nombre) === buscado || normalizar(b.slug) === buscado ||
      normalizar(b.nombre).includes(buscado) || (b.alias || []).some((a) => normalizar(a) === buscado));
  if (!perfil) {
    return errorDeHerramienta(
      `No tengo perfil publicado de "${args.barrio}". Los que sí: ${PERFILES_BARRIO.map((b) => b.nombre).join(", ")}.`
    );
  }

  const ficha = {
    nombre: perfil.nombre,
    descripcion: perfil.descripcion,
    para_quien: perfil.perfil ?? [],
    ventajas: perfil.ventajas ?? [],
    desventajas: perfil.desventajas ?? [],
    precio_m2: perfil.precioM2,
    precio_fuente: perfil.precioFuente,
    auto_obligatorio: Boolean(perfil.autoObligatorio),
    internet: perfil.internet?.detalle ?? null,
    transporte: perfil.transporte?.detalle ?? null,
    url: url(`/barrios/${perfil.slug}/`),
  };

  return {
    content: texto([
      `${perfil.nombre} — ${perfil.descripcion}`,
      ficha.para_quien.length ? `Para: ${ficha.para_quien.join(", ")}.` : null,
      ficha.ventajas.length ? `A favor: ${ficha.ventajas.join(" · ")}` : null,
      ficha.desventajas.length ? `En contra: ${ficha.desventajas.join(" · ")}` : null,
      `Auto: ${ficha.auto_obligatorio ? "es prácticamente obligatorio" : "se puede vivir sin auto"}.`,
      ficha.internet ? `Internet: ${ficha.internet}` : null,
      `Valor del m²: ${ficha.precio_m2} (${ficha.precio_fuente}).`,
      `Ficha completa: ${ficha.url}`,
    ]),
    structuredContent: ficha,
  };
}

// ------------------------------------------------------------------ el catálogo

export const HERRAMIENTAS = [
  {
    name: "buscar_propiedades",
    title: "Buscar propiedades en San Martín de los Andes",
    description:
      "Busca en el catálogo publicado de Catalán Propiedades en San Martín de los Andes (Neuquén, Patagonia argentina). " +
      "Devuelve solo propiedades disponibles hoy, con su precio, barrio y el link a la ficha. " +
      "Los precios de venta van en dólares y los de alquiler permanente en pesos por mes.",
    inputSchema: {
      type: "object",
      properties: {
        operacion: { type: "string", enum: ["venta", "alquiler"], description: "venta (dólares) o alquiler permanente (pesos por mes). Por defecto, venta." },
        tipo: { type: "string", description: "Casa, Departamento, Lote, Cabaña, Monoambiente." },
        presupuesto_max_usd: { type: "number", description: "Tope en dólares. Solo aplica a venta." },
        dormitorios_min: { type: "integer", description: "Mínimo de dormitorios." },
        barrio: { type: "string", description: "Nombre del barrio o zona." },
        limite: { type: "integer", description: `Cuántas devolver, de 1 a ${LIMITE_MAXIMO}. Por defecto ${LIMITE_DEFECTO}.` },
      },
      additionalProperties: false,
    },
  },
  {
    name: "precio_m2_por_barrio",
    title: "Valor del metro cuadrado por barrio",
    description:
      "Devuelve el valor del metro cuadrado en San Martín de los Andes, general o de un barrio puntual, " +
      "según el relevamiento propio de Catalán Propiedades. Son medianas de precios publicados, no de cierre, " +
      "y viajan siempre con la fecha del relevamiento.",
    inputSchema: {
      type: "object",
      properties: {
        barrio: { type: "string", description: "Barrio a consultar. Si se omite, devuelve el panorama general y todos los barrios." },
        tipo: { type: "string", description: "Casa o Departamento, para acotar la mediana." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "perfil_barrio",
    title: "Cómo es cada barrio de San Martín de los Andes",
    description:
      "Describe un barrio de San Martín de los Andes: para quién es, ventajas y desventajas, si hace falta auto, " +
      "internet, transporte y el valor del m². Sin argumento devuelve la lista de todos los barrios con perfil publicado.",
    inputSchema: {
      type: "object",
      properties: { barrio: { type: "string", description: "Barrio a describir. Si se omite, devuelve todos." } },
      additionalProperties: false,
    },
  },
];

const EJECUTORES = {
  buscar_propiedades: buscarPropiedades,
  precio_m2_por_barrio: precioM2PorBarrio,
  perfil_barrio: perfilBarrio,
};

export function existeHerramienta(nombre) {
  return Object.hasOwn(EJECUTORES, nombre);
}

export async function ejecutarHerramienta(nombre, args) {
  try {
    return await EJECUTORES[nombre](args || {});
  } catch (error) {
    console.error(`[MCP/${nombre}]`, error?.message || error);
    return errorDeHerramienta("No pude resolver la consulta en este momento. Probá de nuevo en un rato.");
  }
}
