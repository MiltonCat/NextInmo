import "server-only";

import { BARRIOS } from "@/lib/barrios";
import { PERFILES_BARRIO } from "@/lib/barriosPerfil";
import { blogPosts } from "@/lib/blogPosts";
import { textoDistancias } from "@/data/distanciasBarrios";
import { developments as developmentsBase } from "@/data/developments";
import { getDevelopments, getDevelopmentSlug, paraPublicar } from "@/lib/developments";
import { eligibleProperties } from "@/lib/luciaAdvisor.mjs";
import {
  BUSINESS_HOURS,
  CONTACT_EMAIL,
  LOCATION_DISPLAY,
  PHONE_DISPLAY,
  WA_URL,
} from "@/config";
import {
  MERCADO_GENERADO,
  RANGO_M2,
  RELEVADAS_PUBLICO,
  VALOR_M2_CASA,
  VALOR_M2_DEPTO,
} from "@/lib/mercado";
import { barriosConMediana } from "@/lib/precioZonas";
import { rest } from "@/lib/supabaseRest";
import { getPropertySlug } from "@/data/properties";

const MAX_CONTEXT_CHARS = 14_000;
const STOP_WORDS = new Set([
  "para", "como", "donde", "cuando", "cuanto", "cual", "quiero", "puedo",
  "sobre", "entre", "desde", "hasta", "tiene", "tienen", "esto", "esta",
  "propiedad", "propiedades", "martin", "andes", "lucia", "catalan",
]);

const normalize = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

function termsOf(value) {
  return [...new Set(normalize(value).split(/[^a-z0-9]+/).filter((term) => term.length > 2 && !STOP_WORDS.has(term)))];
}

function relevance(question, text) {
  const haystack = termsOf(text);
  return termsOf(question).reduce((score, term) => {
    const matches = haystack.some((candidate) =>
      candidate === term ||
      (candidate.length >= 5 && term.length >= 5 && candidate.slice(0, 5) === term.slice(0, 5))
    );
    return score + (matches ? 1 : 0);
  }, 0);
}

function topMatches(question, items, textOf, limit) {
  return items
    .map((item, index) => ({ item, index, score: relevance(question, textOf(item)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}

// Espejo de lo publicado en /nosotros y en la guía legal de alquileres. Si esas
// páginas cambian, este bloque cambia con ellas: Lucía no puede afirmar del
// equipo nada que el visitante no pueda verificar en el sitio.
const EQUIPO = {
  titular: {
    nombre: "Milton Catalán",
    rol: "Asesor inmobiliario y fundador de Catalán Propiedades",
    formacion: "Administrador de empresas. Gestionó carteras en Wealth Management en ING y elaboró proyecciones de mercado para la industria salmonera.",
    experiencia: "Más de 10 años en el mercado de San Martín de los Andes.",
    enfoque: "Analiza cada propiedad como un activo financiero: rentabilidad esperada, riesgo y proyección de valor.",
    proyecto: "Desarrolla un modelo predictivo propio del valor del m² en San Martín de los Andes hasta 2031.",
  },
  abogada: {
    nombre: "Carolina Godoy",
    rol: "Socia de Catalán Propiedades y asesora legal inmobiliaria, desde 2020.",
    credencial: "Abogada matriculada en la Provincia del Neuquén, Mat. Pcial. N° 344.",
    hace: [
      "Redacción y revisión de contratos de compraventa, boletos de reserva y contratos de alquiler.",
      "Control de la documentación de cada operación.",
      "Sucesiones de inmuebles.",
      "Administración de consorcios y conflictos entre propietarios, inquilinos y consorcios.",
    ],
    publicado: "Es la autora de la guía legal de alquileres del sitio, escrita sobre el Código Civil y Comercial y jurisprudencia de Neuquén.",
    telefono: "2944-630649",
    comoMencionarla: "Se la puede nombrar como socia y abogada del equipo, decir que está matriculada y dar su teléfono: todo eso está publicado en el sitio. No atribuirle opiniones ni conclusiones sobre un caso concreto.",
  },
  servicios: [
    "Asesoría de inversión",
    "Valuación predictiva del m²",
    "Análisis de mercado",
    "Acompañamiento en la compra",
  ],
  limites: "Ninguna respuesta de Lucía reemplaza la consulta con Carolina sobre un caso concreto: para eso está su teléfono. No atribuirle opiniones ni conclusiones que no estén en este contexto.",
};

const KNOWLEDGE_CARDS = [
  {
    topic: "compra",
    title: "Proceso de compra",
    text: "Catalán Propiedades acompaña la búsqueda, visita, reserva, revisión de documentación, boleto y escritura. Los gastos y requisitos dependen de cada operación; para una cifra o conclusión legal puntual debe confirmarlo Milton o el profesional interviniente.",
    href: "/centro-ayuda/",
  },
  {
    topic: "venta tasacion",
    title: "Venta y tasación",
    text: "La tasación online entrega una estimación orientativa basada en datos. Una tasación comercial definitiva requiere revisar estado, ubicación y documentación. Publicar con Catalán Propiedades no tiene costo inicial; la comisión se cobra al concretar la operación.",
    href: "/vender/",
  },
  {
    topic: "credito hipotecario uva cuota banco",
    title: "Crédito hipotecario",
    text: "El sitio ofrece un simulador orientativo de crédito UVA. La aprobación, tasa, relación cuota-ingreso y aptitud de la propiedad dependen del banco y deben confirmarse con la entidad.",
    href: "/simulador-credito/",
  },
  {
    topic: "inversion rentabilidad roi retorno alquiler temporario",
    title: "Herramientas para inversión",
    text: "El sitio analiza ubicación, revalorización, rentabilidad, liquidez y riesgo. Ningún retorno está garantizado: los indicadores son referencias y supuestos que deben contrastarse con gastos, ocupación y situación de cada propiedad.",
    href: "/inversiones/",
  },
  {
    topic: "privacidad datos personales",
    title: "Privacidad",
    text: "La política de privacidad publicada explica qué datos se solicitan y cómo se utilizan. Para cuestiones jurídicas debe prevalecer el texto completo de esa página.",
    href: "/privacidad/",
  },
];

async function liveProperties() {
  try {
    const fields = [
      "id", "title", "type", "modalidad", "location", "barrio", "price",
      "bedrooms", "bathrooms", "area", "description", "features", "roi",
      "precioAlquilerARS", "disponibleDesde", "mesesMinimos", "condiciones",
      "alquilada", "reservada", "status", "vendida", "sort_order", "created_at",
    ].join(",");
    const rows = await rest(`properties?select=${fields}&order=sort_order.asc.nullslast`, { cache: "no-store" });
    return { rows: Array.isArray(rows) ? rows : [], fresh: true };
  } catch {
    return { rows: [], fresh: false };
  }
}

function propertyFacts(property) {
  const renting = property.modalidad === "alquiler_permanente";
  return {
    id: property.id,
    titulo: property.title,
    operacion: renting ? "alquiler permanente" : "venta",
    tipo: property.type,
    ubicacion: property.location,
    precio: renting ? property.precioAlquilerARS : property.price,
    moneda: renting ? "ARS por mes" : "USD",
    dormitorios: property.bedrooms,
    banos: property.bathrooms,
    superficieM2: property.area,
    caracteristicas: Array.isArray(property.features) ? property.features.slice(0, 8) : [],
    roiInformado: property.roi ?? null,
    condiciones: renting ? property.condiciones ?? null : null,
  };
}

function propertyText(property) {
  return [property.title, property.type, property.location, property.description, ...(property.features || [])].join(" ");
}

function source(title, href, detail) {
  return { title, href, detail: String(detail || "").slice(0, 180) };
}

export async function buildLuciaKnowledge(question) {
  const normalized = normalize(question);
  const snippets = [];
  const sources = [];
  const warnings = [];

  snippets.push({
    topic: "empresa",
    facts: {
      nombre: "Catalán Propiedades",
      ubicacion: LOCATION_DISPLAY,
      telefono: PHONE_DISPLAY,
      email: CONTACT_EMAIL,
      horario: BUSINESS_HOURS,
      whatsapp: WA_URL,
    },
  });
  if (/contact|telefono|whatsapp|mail|email|horario|atienden|atencion|oficina|ubicacion/.test(normalized)) {
    sources.push(source("Contacto", "/contacto/", BUSINESS_HOURS));
  }

  const asksProcess = /gasto|comision|escrit|document|impuesto|sello|reserva|seña|proceso|requisito|tramite/.test(normalized);
  const propertyQuestion = !asksProcess && (
    /\bbusco\b|estoy buscando|mostrame|catalogo|que (?:propiedades|casas|departamentos|lotes).*tienen|que .*hay disponible|subieron|publicaron|propiedad concreta|oportunidad concreta/.test(normalized) ||
    /(?:casa|departamento|depto|cabana|lote|terreno).*(?:dormitorio|habitacion|jardin|patio|cochera|hasta usd|presupuesto|disponible)/.test(normalized)
  );
  if (propertyQuestion) {
    const catalog = await liveProperties();
    if (catalog.fresh) {
      const sales = eligibleProperties({}, catalog.rows);
      const rentals = eligibleProperties({ operacion: "alquiler" }, catalog.rows);
      const pool = /alquil/.test(normalized) ? rentals : /compr|venta|casa|departamento|lote|terreno/.test(normalized) ? sales : [...sales, ...rentals];
      let matches = topMatches(question, pool, propertyText, 5);
      if (!matches.length && /subieron|nuevo|reciente/.test(normalized)) {
        matches = [...pool].sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || ""))).slice(0, 5);
      } else if (!matches.length && /disponib|public|catalogo/.test(normalized)) {
        matches = pool.slice(0, 5);
      }
      if (matches.length) {
        snippets.push({ topic: "catalogo_vivo", actualizado: "en esta consulta", items: matches.map(propertyFacts) });
        for (const property of matches.slice(0, 3)) {
          sources.push(source(property.title, `/propiedades/${getPropertySlug(property)}/`, property.location));
        }
      }
    } else {
      warnings.push("No se pudo confirmar el catálogo en vivo. No afirmar disponibilidad ni recomendar el respaldo estático.");
    }
  }

  const namedNeighborhoodSlugs = BARRIOS
    .filter((neighborhood) => [neighborhood.nombre, neighborhood.slug, ...neighborhood.alias]
      .some((name) => normalized.includes(normalize(name))))
    .map((neighborhood) => neighborhood.slug);
  const namedNeighborhoods = PERFILES_BARRIO.filter((profile) => namedNeighborhoodSlugs.includes(profile.slug));
  const neighborhoodQuestion = /barrio|zona|donde vivir|mudarse|mudanza|comparar.*(?:centro|chapelco|cascada|vega|lolog|caleuche)/.test(normalized);
  if (namedNeighborhoods.length || neighborhoodQuestion) {
    const neighborhoodMatches = topMatches(
      question,
      PERFILES_BARRIO,
      (profile) => [profile.nombre, profile.descripcion, ...profile.perfil, ...profile.tags, ...profile.ventajas, ...profile.desventajas].join(" "),
      3
    );
    const selected = namedNeighborhoods.length
      ? namedNeighborhoods.slice(0, 3)
      : neighborhoodMatches.length ? neighborhoodMatches : PERFILES_BARRIO.slice(0, 3);
    snippets.push({
      topic: "barrios",
      // "¿es bueno para vivir?" y "¿a qué distancia está?" son las dos preguntas
      // reales del que no conoce la ciudad. Todo esto ya estaba escrito en los
      // perfiles y Lucía no lo recibía: contestaba con la descripción y poco más.
      items: selected.map((profile) => ({
        nombre: profile.nombre,
        descripcion: profile.descripcion,
        perfiles: profile.perfil,
        ventajas: profile.ventajas,
        desventajas: profile.desventajas,
        precioM2: profile.precioM2,
        precioFuente: profile.precioFuente,
        autoObligatorio: profile.autoObligatorio,
        // Los puntajes van de 1 a 5. Se mandan con la escala escrita al lado
        // para que no se lean como porcentajes ni como notas del 1 al 10.
        puntajes_sobre_5: {
          tranquilidad: profile.tranquilidad,
          servicios: profile.servicios,
          acceso: profile.acceso,
          seguridad: profile.seguridad?.nivel,
          potencialDeInversion: profile.inversion,
        },
        // Estos tres son texto, no puntaje: "Asfalto completo", "En expansión",
        // "Seguridad privada 24h". El detalle dice más que el número.
        calles: profile.calles?.estado ?? null,
        cloacas: profile.cloacas?.estado ?? null,
        seguridadDetalle: profile.seguridad?.detalle ?? null,
        internet: profile.internet?.detalle ?? null,
        transporte: profile.transporte?.detalle ?? null,
        salud: (profile.hospital?.items || []).slice(0, 3)
          .map((item) => `${item.nombre} (${item.distancia})`),
        petFriendly: profile.petFriendly ?? null,
        distancias: textoDistancias(profile.slug),
      })),
    });
    for (const profile of selected) sources.push(source(profile.nombre, `/barrios/${profile.slug}/`, profile.descripcion));
  }

  if (/precio|m2|metro cuadrado|mercado|valor|cotiz|inversion|rentabilidad/.test(normalized)) {
    snippets.push({
      topic: "mercado",
      facts: {
        datosAl: MERCADO_GENERADO,
        universoPublico: RELEVADAS_PUBLICO,
        medianaCasaM2USD: VALOR_M2_CASA,
        medianaDepartamentoM2USD: VALOR_M2_DEPTO,
        rangosPorTipo: RANGO_M2,
        aclaracion: "Son precios publicados relevados, no precios de cierre de operaciones.",
        barrios: barriosConMediana().slice(0, 8),
      },
    });
    sources.push(source("Precio del m²", "/precio-m2/", `Datos al ${MERCADO_GENERADO}`));
  }

  // "¿Quiénes son?", "¿tienen abogado?", "¿es confiable?" son la misma pregunta
  // de fondo: quién responde si algo sale mal.
  const teamQuestion = /quien(?:es)? (?:son|sos|es|esta|estan)|sobre ustedes|con quien trabaj|\bequipo\b|abogad|juridic|escriban|matricul|confiab|confianza|estafa|respaldo|trayectoria|inmobiliaria seria|milton|carolina|contrato|boleto de reserva|sucesion|consorcio|asesoramiento legal/.test(normalized);
  if (teamQuestion) {
    snippets.push({ topic: "equipo", facts: EQUIPO });
    sources.push(source("Nosotros", "/nosotros/", "El equipo de Catalán Propiedades"));
    if (/abogad|legal|juridic|contrato|locacion|inquilin|boleto|sucesion|consorcio/.test(normalized)) {
      sources.push(source(
        "Guía legal de alquileres",
        "/blog/alquileres-san-martin-de-los-andes-2026/",
        "Escrita por Carolina Godoy sobre el Código Civil y Comercial y jurisprudencia de Neuquén."
      ));
    }
  }

  // El vocabulario general alcanza para "¿tienen algo en pozo?", pero no para
  // quien ya escuchó el nombre del emprendimiento y lo escribe tal cual. Los
  // nombres salen del archivo estático: un desarrollo que exista SOLO en
  // Supabase se sigue encontrando por vocabulario, no por su nombre propio.
  const namedDevelopment = developmentsBase.some((item) => {
    const name = normalize(item?.name || "");
    return name.length > 3 && normalized.includes(name);
  });
  if (namedDevelopment || /desarrollo|emprendimiento|pozo|cuota|financia|loteo|preventa|fideicomiso|barrio cerrado|unidades|en construccion/.test(normalized)) {
    const developments = (await getDevelopments()).map(paraPublicar);
    let matches = topMatches(question, developments, (item) => [item.name, item.location, item.concepto, item.tagline, item.descripcionCorta].join(" "), 3);
    if (!matches.length) matches = developments.slice(0, 2);
    snippets.push({
      topic: "desarrollos",
      items: matches.map((item) => ({
        nombre: item.name,
        estado: item.estado,
        ubicacion: item.location,
        descripcion: item.descripcionCorta,
        precioDesdeUSD: item.precioDesde,
        disponibles: item.unidadesDisponibles,
        disponibilidadRelevada: item.unidadesDisponiblesRelevado,
        tipologias: item.tipologias?.slice(0, 4),
      })),
    });
    for (const item of matches) sources.push(source(item.name, `/desarrollos/${getDevelopmentSlug(item)}/`, item.descripcionCorta));
  }

  const requestedCardTopics = [
    asksProcess ? "compra" : null,
    /vender|venta de mi|tasar|tasacion|publicar mi/.test(normalized) ? "venta tasacion" : null,
    /credito|hipoteca|uva|cuota|banco/.test(normalized) ? "credito hipotecario uva cuota banco" : null,
    /inversion|invertir|rentabilidad|retorno|roi|alquiler temporario|airbnb/.test(normalized) ? "inversion rentabilidad roi retorno alquiler temporario" : null,
    /privacidad|datos personales/.test(normalized) ? "privacidad datos personales" : null,
  ].filter(Boolean);
  const cards = KNOWLEDGE_CARDS.filter((card) => requestedCardTopics.includes(card.topic));
  for (const card of cards) {
    snippets.push({ topic: card.topic, text: card.text });
    sources.push(source(card.title, card.href, card.text));
  }

  const posts = topMatches(question, blogPosts, (post) => `${post.title} ${post.excerpt} ${post.category}`, 2);
  if (posts.length) {
    snippets.push({
      topic: "blog",
      items: posts.map((post) => ({ titulo: post.title, resumen: post.excerpt, actualizado: post.updated })),
    });
    for (const post of posts) sources.push(source(post.title, `/blog/${post.id}/`, post.excerpt));
  }

  const uniqueSources = [...new Map(sources.map((item) => [item.href, item])).values()].slice(0, 4);
  const selectedSnippets = [...snippets];
  let context = JSON.stringify({ snippets: selectedSnippets, warnings });
  while (context.length > MAX_CONTEXT_CHARS && selectedSnippets.length > 1) {
    selectedSnippets.pop();
    context = JSON.stringify({ snippets: selectedSnippets, warnings });
  }

  return { context, sources: uniqueSources, warnings };
}
