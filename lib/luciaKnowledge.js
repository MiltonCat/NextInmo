import "server-only";

import { BARRIOS } from "@/lib/barrios";
import { PERFILES_BARRIO } from "@/lib/barriosPerfil";
import { blogPosts } from "@/lib/blogPosts";
import { FAQ_INVERSIONES } from "@/lib/inversionesFaq";
import { RENTALS, ESCENARIOS, COSTOS_ENTRADA, COSTOS_SALIDA, EQUIPAMIENTO_TURISTICO, REFORMA_REVENTA } from "@/lib/inversionesDatos";
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
  EVOLUCION_SERIE,
  EVOLUCION_VARIACION_TOTAL,
  MERCADO_GENERADO,
  RANGO_M2,
  RELEVADAS_PUBLICO,
  VALOR_M2_CASA,
  VALOR_M2_DEPTO,
} from "@/lib/mercado";
import { barriosConMediana } from "@/lib/precioZonas";
import { buscarEnElSitio, esDeLaCasa, hrefDeLaCasa } from "@/lib/luciaBusqueda";
import { rest } from "@/lib/supabaseRest";
import { getPropertySlug } from "@/data/properties";
import { consultaConHistoria, empaquetarContexto } from "@/lib/luciaContexto.mjs";

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

// "¿Cuál es el último artículo?" no es una pregunta por tema sino por fecha, y
// topMatches() solo sabe de parecido de texto: la palabra "último" no aparece en
// ningún post, así que la pregunta más obvia sobre el blog devolvía o nada (con
// "cuál es el último blog" Lucía no recibía un solo post) o un artículo de julio
// como si fuera lo último. Cuando preguntan por lo nuevo hay que pasarle los más
// recientes ordenados por fecha, que es lo único que contesta eso.
const PREGUNTA_POR_LO_NUEVO = /\b(ultim[oa]s?|nuev[oa]s?|recientes?|novedad(?:es)?|publicaron|publicaste|publicado)\b/;

// `updated` es el campo confiable para ordenar: `dateTime` a veces es solo el mes
// ("2026-07") porque es lo que se muestra en la tarjeta.
const fechaDePost = (post) => String(post.updated || post.dateTime || "");
const POSTS_POR_FECHA = [...blogPosts].sort((a, b) => fechaDePost(b).localeCompare(fechaDePost(a)));

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

export async function buildLuciaKnowledge(question, history = []) {
  question = consultaConHistoria(question, history);
  const normalized = normalize(question);
  const snippets = [];
  const addSources = (...items) => {
    const snippet = snippets.at(-1);
    if (snippet) snippet.referencias = [...(snippet.referencias || []), ...items];
  };
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
    addSources(source("Contacto", "/contacto/", BUSINESS_HOURS));
  }

  // Busqueda semantica sobre TODO lo publicado. Va antes del blog porque lo
  // reemplaza en la practica: el bloque de abajo solo conoce titulo y resumen de
  // cada nota, este trae los parrafos que de verdad responden. Se deja el otro
  // como respaldo para cuando el indice todavia no esta cargado.
  const fragmentos = await buscarEnElSitio(question, { cantidad: 5 });
  const respuestasCasa = fragmentos.filter(esDeLaCasa);
  const delSitio = fragmentos.filter((fila) => !esDeLaCasa(fila));

  // La palabra de la casa va en su propio bloque, separada del contenido
  // general. Mezcladas, el modelo las pesa igual que un parrafo cualquiera del
  // blog; separadas y rotuladas, sabe que eso es lo que contesta Milton y que
  // no tiene que buscarle la vuelta.
  if (respuestasCasa.length) {
    snippets.push({
      topic: "respuesta_de_la_casa",
      fuente: "Escrito por Milton para responder exactamente esto. Es la posición de Catalán Propiedades: usalo como respuesta, con tus palabras y tu tono. No lo contradigas ni lo matices con lo que digan otras fuentes.",
      items: respuestasCasa.map((fila) => ({
        pregunta: fila.titulo,
        respuesta: fila.fragmento,
      })),
    });
    for (const fila of respuestasCasa) {
      const href = hrefDeLaCasa(fila);
      if (href) addSources(source(fila.titulo || href, href, fila.fragmento));
    }
  }

  if (delSitio.length) {
    for (const fila of delSitio) {
      const href = String(fila.url || "").replace(/^https?:\/\/[^/]+/, "");
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      snippets.push({
        topic: "contenido_del_sitio",
        fuente: "Párrafos de páginas publicadas del sitio. Se pueden citar y resumir; no completar lo que no digan.",
        items: [{
          titulo: fila.titulo,
          url: fila.url,
          seccion: fila.seccion,
          texto: String(fila.fragmento || "").slice(0, 1600),
        }],
      });
      addSources(source(fila.titulo || href, href, fila.fragmento));
    }
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
          addSources(source(property.title, `/propiedades/${getPropertySlug(property)}/`, property.location));
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
    for (const profile of selected) addSources(source(profile.nombre, `/barrios/${profile.slug}/`, profile.descripcion));
  }

  // "¿Me conviene comprar ahora o espero?" es la pregunta comercial mas comun y
  // hasta el 02/09/2026 Lucia la contestaba sin nada en la mano: ni el m², ni la
  // evolucion, ni lo que el propio sitio publica en /inversiones. Ninguna de sus
  // palabras —conviene, espero, caro, oportunidad— aparecia en los disparadores,
  // que pedian que la persona dijera "precio" o "inversion" con todas las letras.
  const asksTiming = /convien|convendria|vale la pena|buen momento|mal momento|ahora o|espero|esperar|se viene|va a (?:subir|bajar)|van a (?:subir|bajar)|subir|bajar|proyecc|a futuro|revaloriz|valoriz|se aprecia|caro|carisimo|barato|accesible|oportunidad|burbuja|estanc/.test(normalized);
  const asksInvesting = /inver[st]|rentab|retorno|\broi\b|alquiler temporario|airbnb|renta\b|rendim|rinde|ahorros|capital|ingreso pasivo|liquidez|diversific/.test(normalized);
  const asksValuation = /tasa[crd]|valuac|cuanto vale|precio justo|sobrevalu|subvalu|sobreprecio/.test(normalized);

  if (asksValuation || asksInvesting) {
    snippets.push({
      topic: "tasador_publicado",
      url: "/tasacion/",
      facts: {
        tipos: ["Casa", "Departamento"],
        entradas: "Tipo, barrio de San Martín de los Andes, superficie cubierta y terreno para casas, distribución, cocheras y extras.",
        resultado: "Estimación en USD, rango de valor y precio por m². Es orientativa: no es precio de cierre ni una tasación profesional certificada.",
        usoParaInvertir: "Permite contrastar el precio pedido con una estimación del inmueble. Una diferencia favorable no demuestra por sí sola rentabilidad ni garantiza una oportunidad.",
        acceso: "Se puede completar el tasador dentro de este chat. La primera tasación es gratis sin datos personales; después se solicita correo, igual que en la web.",
        limites: "No calcular una tasación multiplicando la mediana del barrio por los metros. Solo atribuir una cifra al tasador cuando exista un resultado en la conversación. No afirmar que ejecutaste el modelo si no hay resultado. Para lotes, locales o cabañas, ofrecer la tasación personal de Milton.",
      },
    });
    addSources(source("Tasador online", "/tasacion/", "Estimación, rango de valor y comparación por m² de casas y departamentos."));
  }

  if (/precio|m2|metro cuadrado|mercado|valor|cotiz/.test(normalized) || asksTiming || asksInvesting) {
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
    addSources(source("Precio del m²", "/precio-m2/", `Datos al ${MERCADO_GENERADO}`));
  }

  // Lo que el sitio ya publica sobre invertir y sobre como se mueve el mercado.
  // Va junto porque responden la misma pregunta: si el momento es bueno o no.
  // La serie historica se manda aparte y marcada: esta curada a mano, no la
  // midio el modelo, y Lucia no puede presentarla como si fuera medicion propia.
  if (asksTiming || asksInvesting) {
    snippets.push({
      topic: "inversion_publicada",
      fuente: "Es el texto publicado en /inversiones. Se puede citar tal cual; no ampliarlo ni redondear sus numeros.",
      preguntasFrecuentes: FAQ_INVERSIONES.map((item) => ({
        pregunta: item.pregunta,
        respuesta: item.respuesta,
      })),
      simulador: asksInvesting ? {
        alcance: "Supuestos publicados en la calculadora de /inversiones. No son pronósticos ni gastos confirmados de una operación particular. Los porcentajes de las FAQ son orientativos; no equivalen al resultado neto calculado por el simulador.",
        segmentos: RENTALS,
        unidadesSegmentos: "Precio de venta de referencia en USD, alquiler mensual de referencia en USD, rentabilidad anual en porcentaje. No son propiedades disponibles ni alquileres ofrecidos.",
        costosComoFraccionDelCapital: { entrada: COSTOS_ENTRADA, salida: COSTOS_SALIDA, equipamientoTuristico: EQUIPAMIENTO_TURISTICO, reformaReventa: REFORMA_REVENTA },
        escenarios: ESCENARIOS,
        unidadesEscenarios: "valorizacion es porcentaje anual; crecimientoRenta, vacancia, gastosIngreso, reservaCapex, margenReventa, tasaExigida e impactoCostoViaje son fracciones (0.08 = 8%). factorTarifa es un multiplicador. Distinguir supuestos de rentabilidad resultante.",
      } : null,
      evolucionM2: EVOLUCION_SERIE.length
        ? {
            serie: EVOLUCION_SERIE,
            variacionTotalPct: EVOLUCION_VARIACION_TOTAL,
            advertencia: "Referencia de mercado cargada a mano, NO medida por el modelo. Presentarla como referencia y nunca como dato propio.",
          }
        : null,
      loQueNoSeSabe: "Nadie puede afirmar si conviene comprar ahora o esperar. Se puede describir como se movio el mercado y que rinde cada estrategia; la decision depende del objetivo, el plazo y la situacion de cada persona.",
    });
    addSources(source("Invertir en San Martín", "/inversiones/", "Rentabilidad por estrategia, precio del m² y comparativa de activos."));
  }

  // "¿Quiénes son?", "¿tienen abogado?", "¿es confiable?" son la misma pregunta
  // de fondo: quién responde si algo sale mal.
  const teamQuestion = /quien(?:es)? (?:son|sos|es|esta|estan)|sobre ustedes|con quien trabaj|\bequipo\b|abogad|juridic|escriban|matricul|confiab|confianza|estafa|respaldo|trayectoria|inmobiliaria seria|milton|carolina|contrato|boleto de reserva|sucesion|consorcio|asesoramiento legal/.test(normalized);
  if (teamQuestion) {
    snippets.push({ topic: "equipo", facts: EQUIPO });
    addSources(source("Nosotros", "/nosotros/", "El equipo de Catalán Propiedades"));
    if (/abogad|legal|juridic|contrato|locacion|inquilin|boleto|sucesion|consorcio/.test(normalized)) {
      addSources(source(
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
    for (const item of matches) addSources(source(item.name, `/desarrollos/${getDevelopmentSlug(item)}/`, item.descripcionCorta));
  }

  const requestedCardTopics = [
    asksProcess ? "compra" : null,
    /vender|venta de mi|tasar|tasacion|publicar mi/.test(normalized) ? "venta tasacion" : null,
    /credito|hipoteca|uva|cuota|banco/.test(normalized) ? "credito hipotecario uva cuota banco" : null,
    asksInvesting || asksTiming ? "inversion rentabilidad roi retorno alquiler temporario" : null,
    /privacidad|datos personales/.test(normalized) ? "privacidad datos personales" : null,
  ].filter(Boolean);
  const cards = KNOWLEDGE_CARDS.filter((card) => requestedCardTopics.includes(card.topic));
  for (const card of cards) {
    snippets.push({ topic: card.topic, text: card.text });
    addSources(source(card.title, card.href, card.text));
  }

  // Dos entradas al blog, por tema y por fecha. La de fecha es la que faltaba.
  const buscaNovedades = PREGUNTA_POR_LO_NUEVO.test(normalize(question));
  const porTema = topMatches(question, blogPosts, (post) => `${post.title} ${post.excerpt} ${post.category}`, 2);
  const recientes = buscaNovedades ? POSTS_POR_FECHA.slice(0, 3) : [];
  const vistos = new Set();
  const posts = [...recientes, ...porTema]
    .filter((post) => !vistos.has(post.id) && vistos.add(post.id))
    .filter((post) => !delSitio.some((item) => String(item.url).includes(`/blog/${post.id}`)));
  if (posts.length) {
    snippets.push({
      topic: "blog",
      alcance: "Estos son resúmenes del blog; no implican acceso al texto completo. Solo resumir lo que dicen.",
      // Sin esta línea el modelo no tiene cómo saber cuál es el más nuevo: le
      // llegan tres resúmenes sueltos y cualquiera de los tres le parece igual
      // de reciente.
      ...(buscaNovedades
        ? { orden: `Preguntan por lo último publicado. Los primeros ${recientes.length} van del más nuevo al más viejo por fecha de publicación; el más reciente es "${POSTS_POR_FECHA[0].title}" (${fechaDePost(POSTS_POR_FECHA[0])}).` }
        : {}),
      items: posts.map((post) => ({ titulo: post.title, url: `/blog/${post.id}/`, resumen: post.excerpt, publicado: post.dateTime, actualizado: post.updated })),
    });
    for (const post of posts) addSources(source(post.title, `/blog/${post.id}/`, post.excerpt));
  }

  const prioridad = ["empresa", "respuesta_de_la_casa", "tasador_publicado", "inversion_publicada", "mercado", "contenido_del_sitio", "blog"];
  const orden = (topic) => { const index = prioridad.indexOf(topic); return index < 0 ? prioridad.length : index; };
  return empaquetarContexto([...snippets].sort((a, b) => orden(a.topic) - orden(b.topic)), warnings);
}
