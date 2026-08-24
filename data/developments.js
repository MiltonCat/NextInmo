// Catálogo de DESARROLLOS INMOBILIARIOS (emprendimientos: loteos, edificios,
// complejos). Es el respaldo estático de `lib/developments.js`, igual que
// `data/properties.js` lo es de `lib/properties.js`.
//
// ── REGLA DE ESTE ARCHIVO ────────────────────────────────────────────────────
// Acá NO se inventa nada. Todo campo que no esté confirmado por el
// desarrollador va en `null` o en `[]`, y la interfaz se banca el hueco: no
// dibuja la sección. Es preferible una ficha con menos datos que una ficha con
// un número inventado, porque el número inventado lo lee un comprador y llama
// preguntando por él.
//
// ── FOTOS ───────────────────────────────────────────────────────────────────
// `image` y `gallery` guardan la RUTA COMPLETA de cada archivo. Nunca renombrar
// ni mover archivos de `public/imgs` para "ordenar": la atadura entre
// desarrollo y foto es esa ruta, y renombrar cruza las fotos entre fichas.
//
// Tampoco reutilizar acá fotos de propiedades del catálogo. Una foto de una
// casa que está en venta a un precio, apareciendo dentro de un emprendimiento
// distinto a otro precio, es exactamente el problema de fotos cruzadas.
// Mientras no haya fotos propias del proyecto, `image` va en null y la tarjeta
// dibuja un fondo neutro con el nombre.
// ─────────────────────────────────────────────────────────────────────────────

// Estados posibles, en el orden en que avanza una obra.
export const ESTADOS = {
  pozo: {
    key: "pozo",
    label: "En pozo",
    descripcion: "Preventa, antes del inicio de obra. El mejor precio por m².",
    color: "amber",
  },
  construccion: {
    key: "construccion",
    label: "En construcción",
    descripcion: "Obra en marcha, con avance verificable.",
    color: "blue",
  },
  terminado: {
    key: "terminado",
    label: "Terminado",
    descripcion: "Obra finalizada, listo para escriturar.",
    color: "emerald",
  },
  entregado: {
    key: "entregado",
    label: "Entregado",
    descripcion: "Unidades ya entregadas a sus dueños.",
    color: "gray",
  },
};

export const ESTADOS_ORDEN = ["pozo", "construccion", "terminado", "entregado"];

// Los cuatro estados de arriba están escritos para un EDIFICIO, y en un loteo
// mienten. "En construcción" sobre un loteo se lee como que hay algo
// levantándose, y lo que hay es un campo con calles y servicios: nadie está
// construyendo una casa. "En pozo" es todavía peor, porque el pozo es
// literalmente el agujero de los cimientos.
//
// Ojo con el reemplazo: tampoco podemos decir "con servicios terminados" ni
// nada que describa el avance de las obras, porque ESO no lo sabemos. Las
// etiquetas de acá abajo dicen en qué punto está el proyecto y nada más.
const ESTADOS_LOTEO = {
  pozo: {
    label: "Preventa",
    descripcion: "Se vende antes de que empiecen las obras del barrio. El mejor precio por lote.",
  },
  construccion: {
    label: "En desarrollo",
    descripcion: "El proyecto está en marcha y hay lotes en venta.",
  },
  terminado: {
    label: "Urbanización terminada",
    descripcion: "Las obras del barrio están finalizadas.",
  },
  entregado: {
    label: "Entregado",
    descripcion: "Los lotes ya fueron escriturados a sus dueños.",
  },
};

// Qué diccionario de estados le toca a cada desarrollo. Se decide por lo que
// vende: si vende lotes, habla de loteo. Un desarrollo nuevo no necesita
// configurar nada — le alcanza con declarar su `unidad`.
export function estadoDe(development) {
  const base = ESTADOS[development?.estado] ?? ESTADOS.pozo;
  const esLoteo = (development?.unidad?.singular ?? "") === "lote";
  const especifico = esLoteo ? ESTADOS_LOTEO[base.key] : null;
  return especifico ? { ...base, ...especifico } : base;
}

// Cómo se llama lo que se vende en cada proyecto. Un loteo vende LOTES y un
// edificio vende DEPARTAMENTOS; llamarlos "unidades" a los dos suena a folleto
// genérico y, en un loteo, "12 unidades disponibles" se lee como si hubiera
// casas construidas. Si un desarrollo no lo define, cae en "unidades".
const UNIDAD_POR_DEFECTO = { singular: "unidad", plural: "unidades" };

export function unidadLabel(development, cantidad = 2) {
  const u = development?.unidad ?? UNIDAD_POR_DEFECTO;
  return cantidad === 1 ? u.singular : u.plural;
}

export const developments = [
  {
    id: 1,
    name: "Pueblo Chapelco",
    unidad: { singular: "lote", plural: "lotes" },
    desarrollador: "Lugares del Sur",
    // Textual de la ficha del desarrollador.
    concepto: "Barrio semi abierto en San Martín de los Andes",
    tagline: "283 lotes de 800 m² sobre 76 hectáreas, a 20 minutos del centro",
    location: "Cuesta Sepúlveda S/N",
    city: "San Martín de los Andes",
    provincia: "Neuquén",
    departamento: "Lácar",

    // Coordenadas del acceso al barrio. Salen del pin de Google Maps que pasó
    // Manuel (Pueblo Chapelco, place id 0x961109bc41bff3a7), no de una
    // estimación sobre el mapa: en un loteo de 76 hectáreas un pin puesto a ojo
    // manda gente a la ladera equivocada.
    lat: -40.1518592,
    lng: -71.2665786,

    estado: "construccion",

    // El desarrollador publica "Marzo de 2020" como fecha de entrega y al mismo
    // tiempo marca el proyecto "en construcción" en 2026. Una de las dos cosas
    // está vieja. Se guarda lo que dice la fuente, pero no se muestra como
    // fecha de entrega vigente hasta confirmarlo con ellos.
    entregaSegunDesarrollador: "Marzo de 2020",
    entrega: null,
    entregaISO: null,

    // Sin dato del desarrollador. `avance: null` apaga la barra de progreso.
    avance: null,
    etapas: [],

    destacado: true,
    fideicomiso: null,

    precioDesde: 67000,
    // No publican valor por m². 67.000 ÷ 800 daría 83,75 pero el lote más
    // barato no tiene por qué ser de 800 m² —800 es el PROMEDIO—, así que la
    // cuenta sería un número inventado con cara de dato.
    precioM2Desde: null,

    unidadesTotales: 283,

    // 11 rojos + 21 azules + 12 violetas, contados uno por uno sobre el
    // masterplan de julio de 2026 que mandó el desarrollador (en ese plano el
    // verde es "vendido" y cada color es un precio).
    //
    // OJO con la resta: el masterplan numera hasta el lote 225 y la ficha
    // comercial habla de 283 lotes. Mientras esa diferencia no se aclare, NO se
    // publica "239 vendidos": los 58 que faltan pueden ser una etapa que
    // todavía no se lanzó. Por eso existe `unidadesDisponiblesRelevado`, que
    // apaga la resta en la ficha y muestra la fecha del relevamiento.
    unidadesDisponibles: 44,
    unidadesDisponiblesRelevado: "13/07/2026",

    image: null,
    gallery: [],

    // Video de presentación del propio desarrollador, público en su canal de
    // YouTube. Embeberlo es el uso para el que YouTube lo publica —y la
    // miniatura viene del embed, no es una foto copiada de ningún lado—, así
    // que no depende del permiso escrito que sí hace falta para publicar sus
    // fotos. Mientras no manden material propio, esta es la cara de la ficha.
    video: {
      youtubeId: "XIb-X0EHhDQ",
      titulo: "Pueblo Chapelco - San Martín de los Andes",
      canal: "Lugares del Sur",
    },

    descripcionCorta:
      "Urbanización semi abierta de 76 hectáreas en San Martín de los Andes, con 283 lotes de 800 m² promedio y financiación a seis años en dólares.",

    // Reescrito a partir de la ficha del desarrollador, sin agregarle datos.
    descripcion:
      "Pueblo Chapelco es una urbanización semi abierta y sin expensas, a tres kilómetros de la ruta 40 —a la altura de la zona comercial de La Vega— y a veinte minutos del centro de San Martín de los Andes. La idea del proyecto es vivir en la montaña sin quedar aislado: tiene conexión directa al centro urbano, a colegios y a los servicios esenciales.\n\nEstá desarrollada sobre 76 hectáreas y cuenta con 283 lotes de 800 metros cuadrados en promedio. De esa superficie total, solo 24 hectáreas están urbanizadas: las 52 restantes quedan reservadas para uso común, y ahí entran el arroyo Pichi Chacay, una laguna, bosques, miradores, plazas, la huerta de producción orgánica y unos seis kilómetros de senderos de trekking que recorren el campo. Todo el loteo tiene orientación norte, que es lo que define cuánto sol entra en invierno.\n\nEl proyecto se apoya en tres conceptos. Sustentable, por la eficiencia energética de las construcciones. Smart, por soluciones como el minibús interno para usar menos el auto. Y slow, por el diseño del barrio con amplios espacios comunes. Dentro del predio funciona además una casa de té abierta a quien va a conocer el lugar.",

    // Las tres categorías de lote. Un loteo no tiene dormitorios ni baños, así
    // que esos campos no van: la fila se arma sola con lo que existe.
    //
    // El precio NO depende del tamaño. Lo dijo el desarrollador con todas las
    // letras: los lotes "varían en su valor de acuerdo a la ubicación, vistas y
    // otras características, que no necesariamente tienen que ver con el tamaño
    // de los mismos". Por eso acá no hay m² por categoría ni precio por m²:
    // dividir 67.000 por 800 daría un número con cara de dato que no explica
    // nada de por qué un lote vale 18.000 dólares más que el de al lado.
    //
    // `total` va en null a propósito: sabemos cuántos quedan de cada color
    // (contados del masterplan), no cuántos hubo en total de cada color.
    tipologias: [
      {
        nombre: "Lote rojo",
        // El color con el que ese lote figura en el masterplan del
        // desarrollador. No es decoración: es como el comprador identifica su
        // categoría cuando mira el plano.
        color: "#CD4645",
        precioDesde: 67000,
        precioContado: 60000,
        disponibles: 11,
        total: null,
        // Anticipo + cuota fija en dólares, tal cual la tabla de agosto de 2026.
        // Los de 72 meses son dos alternativas del mismo plazo: más anticipo,
        // cuota más baja.
        planes: [
          { meses: 12, anticipo: 26800, cuota: 3550 },
          { meses: 24, anticipo: 26800, cuota: 1860 },
          { meses: 72, anticipo: 20100, cuota: 950 },
          { meses: 72, anticipo: 33500, cuota: 700 },
        ],
      },
      {
        nombre: "Lote azul",
        // El color con el que ese lote figura en el masterplan del
        // desarrollador. No es decoración: es como el comprador identifica su
        // categoría cuando mira el plano.
        color: "#0096B8",
        precioDesde: 78000,
        precioContado: 70000,
        disponibles: 21,
        total: null,
        planes: [
          { meses: 12, anticipo: 31200, cuota: 4120 },
          { meses: 24, anticipo: 31200, cuota: 2160 },
          { meses: 72, anticipo: 23400, cuota: 1150 },
          { meses: 72, anticipo: 39000, cuota: 800 },
        ],
      },
      {
        nombre: "Lote violeta",
        // El color con el que ese lote figura en el masterplan del
        // desarrollador. No es decoración: es como el comprador identifica su
        // categoría cuando mira el plano.
        color: "#9C50B5",
        precioDesde: 85000,
        precioContado: 80000,
        disponibles: 12,
        total: null,
        // El violeta tiene una sola opción a 72 meses en la tabla de agosto,
        // no dos como el rojo y el azul. No es un olvido de carga: la lista
        // viene así. Si mañana aparece la de anticipo bajo, se agrega.
        planes: [
          { meses: 12, anticipo: 34000, cuota: 4490 },
          { meses: 24, anticipo: 34000, cuota: 2360 },
          { meses: 72, anticipo: 42500, cuota: 900 },
        ],
      },
    ],

    // Solo lo que figura textualmente en el material del desarrollador.
    //
    // Lo que todavía NO existe va escrito como proyectado. El flyer oficial es
    // explícito: "se proyecta también la construcción de un sector deportivo y
    // un sector comercial". En el masterplan esas dos áreas ya están dibujadas,
    // y un plano dibujado se lee como un lugar que está. Publicarlas sin la
    // aclaración sería vender una cancha que no está construida.
    amenities: [
      "52 hectáreas de uso común",
      "6 km de senderos de trekking",
      "Arroyo Pichi Chacay y laguna dentro del predio",
      "Bosques, miradores y plazas",
      "Huerta y producción orgánica de frutas y hortalizas",
      "Casa de té dentro del barrio",
      "Todo el loteo con orientación norte",
      "Sin expensas",
      "Minibús interno",
      "Conexión directa al centro urbano",
      "Cerca de colegios y servicios esenciales",
      "Sector deportivo (proyectado)",
      "Sector comercial y proveeduría (proyectados)",
    ],

    financiacion: {
      // El anticipo ya no es un misterio, pero tampoco es un número único:
      // 40% a 12 y 24 meses, y 30% o 50% a 72 según la alternativa. Como no es
      // uno solo, sigue en null acá y se muestra abierto por plan en la tabla
      // de cada categoría.
      anticipo: null,
      cuotas: 72,
      ajuste: "Fijas en dólares, sin interés indexado",
      contraEntrega: null,
      nota: "Financiación propia del desarrollador, sin banco: un anticipo más cuotas mensuales fijas en dólares, a 12, 24 o 72 meses. El plan más largo llega a seis años. Pagando de contado el lote baja entre 5.000 y 8.000 dólares según la categoría.",
    },

    fichaTecnica: [
      { label: "Superficie total", value: "76 hectáreas" },
      { label: "Cantidad de lotes", value: "283" },
      { label: "Superficie por lote", value: "800 m² promedio" },
      { label: "Superficie urbanizada", value: "24 hectáreas" },
      { label: "Superficie de uso común", value: "52 hectáreas" },
      { label: "Orientación", value: "Norte" },
      { label: "Expensas", value: "Sin expensas" },
      { label: "Distancia al centro", value: "20 minutos" },
      { label: "Distancia a la ruta 40", value: "3 km, a la altura de La Vega" },
      { label: "Tipo de barrio", value: "Semi abierto" },
    ],

    // La ficha del desarrollador, que en un emprendimiento de terceros cumple
    // el mismo papel que el perfil del anfitrión en Airbnb: quien pone la plata
    // no está comprándole a Catalán Propiedades, le está comprando a Lugares
    // del Sur, y tiene derecho a saber quiénes son antes que a ver un render.
    //
    // OJO: de acá SOLO se publican `nombre`, `rubro` y `trayectoria`.
    // `web`, `instagram`, `oficinas` y `proyectos` quedan guardados para
    // consulta interna pero NO se renderizan. Catalán Propiedades vende estos
    // lotes y cobra comisión de Lugares del Sur: publicar su sitio, su
    // Instagram o la dirección de su oficina de ventas es entregarle al
    // comprador el camino para comprar sin nosotros y perder la comisión.
    // Lo mismo vale para `fuente.url` más abajo.
    desarrolladorInfo: {
      nombre: "Lugares del Sur",
      rubro: "Desarrollos urbanísticos",
      trayectoria: "Más de 15 años desarrollando en la Patagonia",
      // Los cuatro que ellos mismos listan en su brochure institucional.
      proyectos: ["Altos de Trevelin", "Pueblo Chapelco", "Terrazas del Wilson", "Praderas"],
      oficinas: [
        "M. Moreno 701, Local 11, San Martín de los Andes",
        "Cuesta Sepúlveda S/N (oficina en el barrio)",
        "Av. San Martín 451, Trevelin, Chubut",
      ],
      web: "https://www.lugaresdelsur.com/",
      instagram: "https://www.instagram.com/lugaresdelsur.ok/",
    },

    // De dónde salió cada dato de arriba. Si mañana el desarrollador cambia
    // precios y alguien pregunta de dónde salió el número, está acá.
    fuente: {
      nombre: "Material comercial de Lugares del Sur",
      url: "https://lugaresdelsur.com/emprendimiento/cuesta-sepulveda-s-n/63751/",
      relevado: "2026-08-22",
      // Qué documento respalda qué, por si mañana un comprador pregunta de
      // dónde salió un número.
      documentos: [
        "Lista de precios y financiación a 12, 24 y 72 meses — agosto de 2026",
        "Masterplan con lotes disponibles — 13 de julio de 2026",
        "Flyer institucional de Pueblo Chapelco",
        "Brochure institucional de Lugares del Sur",
      ],
    },
  },
];

// ── PENDIENTE, para pedirle a Lugares del Sur ───────────────────────────────
// Resuelto el 22/08/2026 con el material que mandó Manuel: precios por
// categoría, planes de financiación, anticipos, descuento por pago contado,
// lotes disponibles y coordenadas del acceso.
//
// Sigue faltando, y nada de esto se puede deducir:
//   · Fotos y renders propios, con permiso escrito para publicarlos. Sin ese
//     permiso no se sube una sola imagen de su Instagram ni de sus PDF.
//   · Fecha de entrega vigente (la publicada, marzo de 2020, quedó vieja).
//   · Porcentaje de avance de obra y etapas con fecha.
//   · Superficie de cada categoría de lote (el 800 m² es promedio general).
//   · Por qué el masterplan numera hasta el lote 225 y la ficha habla de 283.
//   · Estructura legal (fideicomiso o venta directa) y escribanía interviniente.
//   · Si los 44 lotes del masterplan de julio siguen libres hoy.
// ─────────────────────────────────────────────────────────────────────────────

// --- Slugs ------------------------------------------------------------------
export function slugifyDevelopment(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function getDevelopmentSlug(development) {
  return `${slugifyDevelopment(development.name)}-${development.id}`;
}

export function findDevelopmentBySlug(slug) {
  const match = String(slug).match(/(\d+)$/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return developments.find((d) => d.id === id) ?? null;
}
