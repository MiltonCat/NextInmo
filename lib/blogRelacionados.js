// Qué se muestra en "Seguí leyendo" al final de cada post.
//
// Antes cada post tenía sus relacionados escritos a mano. Consecuencia: un post
// nuevo no recibía ni un link desde los viejos hasta que alguien los editara uno
// por uno, y Google tarda en rastrear (y posiciona peor) una página a la que no
// apunta nadie. Ahora la lista se arma sola desde `lib/blogPosts.js`: publicar
// un post nuevo ya lo enlaza desde todos los de su tema.
//
// Función pura, sin imports: recibe la lista de posts por parámetro para poder
// probarla con `node --test` sin resolver los alias de Next.

// Categorías que hablan de lo mismo aunque se llamen distinto.
export const GRUPOS = {
  "Guía de Crédito": "credito",
  "Guía de Compra": "credito",
  Mercado: "mercado",
  Inversión: "mercado",
  Precios: "precios",
  "Tasación con Datos": "precios",
  "Guía legal": "legal",
  "Guía para Compradores": "compra",
  "Guía de Barrios": "barrios",
};

// Temas vecinos: completan la lista cuando el propio tema tiene pocas notas.
// Sin esto, el hueco se llenaba por novedad y el post más nuevo terminaba
// enlazado desde casi todos, aunque no tuviera nada que ver (una guía legal
// mandando a una nota de costos de obra).
export const VECINOS = {
  credito: ["precios", "compra"],
  mercado: ["precios"],
  precios: ["mercado", "barrios", "credito"],
  legal: ["compra"],
  compra: ["barrios", "credito", "legal"],
  barrios: ["precios", "compra"],
};

// La sección del sitio que continúa cada tema. Solo rutas que existen en app/.
export const HERRAMIENTAS = {
  credito: {
    href: "/simulador-credito",
    titulo: "Simulá la cuota de tu crédito UVA",
    texto: "Anticipo, plazo y tasa: la cuota inicial y el ingreso mínimo que te piden.",
  },
  mercado: {
    href: "/precio-m2",
    titulo: "Precio del m² en San Martín de los Andes, por barrio",
    texto: "Nuestro relevamiento de valores por barrio, con metodología y fuentes.",
  },
  precios: {
    href: "/tasacion",
    titulo: "Tasá tu propiedad online",
    texto: "Un rango de valor para tu casa o departamento, calculado con datos reales de la zona.",
  },
  legal: {
    href: "/contacto",
    titulo: "¿Estás por firmar?",
    texto: "Contanos tu caso y te orientamos antes de firmar.",
  },
  compra: {
    href: "/propiedades",
    titulo: "Propiedades en venta",
    texto: "El catálogo actualizado de casas, departamentos y lotes.",
  },
  barrios: {
    href: "/barrios",
    titulo: "Guía de barrios de San Martín de los Andes",
    texto: "La ficha de cada barrio para elegir dónde comprar o mudarte.",
  },
};

export const MAX_RELACIONADOS = 4;
export const MAX_DESTACADOS = 2;
export const MIN_RELACIONADOS = 2;

/**
 * @param {Array} posts   lista de blogPosts, más nuevo primero
 * @param {string} slug   id del post actual
 * @param {string[]} destacados  ids elegidos a mano; entran primero (hasta 2)
 *   para que la elección editorial se respete sin tapar a los posts nuevos.
 */
export function elegirRelacionados(posts, slug, destacados = []) {
  const actual = posts.find((p) => p.id === slug);
  if (!actual) return [];
  const grupo = GRUPOS[actual.category];

  const elegibles = posts.filter((p) => p.id !== slug);
  const porId = new Map(elegibles.map((p) => [p.id, p]));

  const primeros = destacados
    .map((id) => porId.get(id))
    .filter(Boolean)
    .slice(0, MAX_DESTACADOS);
  const yaEstan = new Set(primeros.map((p) => p.id));

  // Afinidad temática primero; a igual afinidad, el más nuevo (orden de la lista).
  const vecinos = VECINOS[grupo] ?? [];
  const afinidad = (p) => {
    const g = GRUPOS[p.category];
    if (p.category === actual.category) return 3;
    if (g === grupo) return 2;
    return vecinos.includes(g) ? 1 : 0;
  };
  const ordenados = elegibles
    .map((p, orden) => ({ p, orden, a: afinidad(p) }))
    .filter(({ p }) => !yaEstan.has(p.id) && p.recomendar !== false)
    .sort((x, y) => y.a - x.a || x.orden - y.orden);

  // Sin afinidad solo entra para no dejar la sección casi vacía.
  const conTema = ordenados.filter((x) => x.a > 0).map((x) => x.p);
  const sinTema = ordenados.filter((x) => x.a === 0).map((x) => x.p);
  const faltan = Math.max(0, MIN_RELACIONADOS - primeros.length - conTema.length);

  return [...primeros, ...conTema, ...sinTema.slice(0, faltan)].slice(0, MAX_RELACIONADOS);
}

export function herramientaDelPost(posts, slug) {
  const actual = posts.find((p) => p.id === slug);
  return (actual && HERRAMIENTAS[GRUPOS[actual.category]]) || null;
}
