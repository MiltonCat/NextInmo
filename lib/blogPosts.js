// Fuente de verdad única de los posts del blog.
//
// Antes esta lista vivía dentro de `app/blog/page.js` y el sitemap tenía su
// propia copia hardcodeada en `app/sitemap.js`. Las dos se desincronizaron:
// tres posts publicados (score de inversión, alquiler temporario y el del
// plano) quedaron fuera del sitemap, o sea invisibles para Google.
//
// Ahora `app/blog/page.js` y `app/sitemap.js` leen de acá. Publicar un post
// nuevo es agregar una entrada en este archivo y nada más.
//
// Campos:
//   id            slug de la carpeta en `app/blog/<id>/` — define la URL.
//   dateTime      fecha que se muestra en el <time> de la tarjeta.
//   updated       fecha real de última actualización (YYYY-MM-DD) → sitemap.
//   sitemapPriority  opcional, 0.9 por defecto. Bajalo para posts viejos.
//   audio         opcional. Si está, el post ofrece la versión escuchada:
//                 { duracion: "mm:ss", generado: "YYYY-MM-DD" }.
//                 El MP3 se deriva del id → /podcast/<id>.mp3, así que no hay
//                 ruta que se pueda desincronizar. Sin este campo, el
//                 reproductor no se muestra (ver components/PodcastPlayer).
//                 `generado` sirve para detectar audio viejo contra `updated`.
//
// El orden del array es el orden en que se ven en /blog: más nuevo primero.

import { RELEVADAS_MODELO_FMT } from "@/lib/mercado";

export const blogPosts = [
  {
    id: "creditos-uva-autos-viviendas",
    title: "Créditos UVA para autos y casas: qué cambia en la cuota y en la deuda",
    excerpt:
      "Qué significa tasa 0% en UVA, cómo se compone el débito y por qué financiar a 4 años no es lo mismo que hacerlo a 30. Una comparación con cálculos, datos oficiales de UVA y salarios, y escenarios para entender el riesgo.",
    category: "Guía de Crédito",
    date: "Septiembre 2026",
    dateTime: "2026-09-08",
    updated: "2026-09-08",
    readTime: "10 min",
    image: "/finanzas.jpg",
  },
  {
    id: "nuevo-credito-hipotecario-2026-san-martin-de-los-andes",
    title: "Nuevo crédito hipotecario: alcanza para 17.000 familias en todo el país",
    excerpt:
      "El Gobierno anunció $2 billones para financiar hipotecarios con tope de UVA + 7,5%. Qué superficie compra ese crédito con los valores del m² local, cómo se compara la cuota con el alquiler y por qué acá el efecto no es el mismo que en Buenos Aires.",
    category: "Mercado",
    date: "Agosto 2026",
    dateTime: "2026-08-29",
    updated: "2026-08-29",
    readTime: "9 min",
    image: "/hipotecario.jpeg",
    audio: { duracion: "35:52", generado: "2026-08-29" },
  },
  {
    id: "sena-reserva-compraventa-inquilino",
    title: "Seña o reserva: qué firmás y qué pasa si el comprador ya vive adentro",
    excerpt:
      "Qué diferencia una reserva de una seña, cuándo existe derecho a arrepentirse y cómo se ordenan el alquiler, el boleto y el depósito cuando el inquilino compra la propiedad que ocupa.",
    category: "Guía legal",
    date: "Agosto 2026",
    dateTime: "2026-08-12",
    updated: "2026-08-12",
    readTime: "8 min",
    image: "/planos.jpg",
    audio: { duracion: "25:44", generado: "2026-08-12" },
  },
  {
    id: "cuando-el-plano-no-coincide-con-la-casa",
    title: "Cuando el plano no coincide con la casa: el problema que aparece siempre al vender",
    excerpt:
      "Certificado catastral, Ley 26.209 y Ley provincial 2217: por qué una construcción no declarada frena la escrituración, los tres tipos de discrepancia y cómo resolverla antes de firmar el boleto.",
    category: "Guía legal",
    date: "Julio 2026",
    dateTime: "2026-07-24",
    updated: "2026-07-24",
    readTime: "8 min",
    image: "/eme1.jpg",
    audio: { duracion: "17:49", generado: "2026-07-27" },
  },
  {
    id: "alquileres-san-martin-de-los-andes-2026",
    title: "Alquileres en San Martín de los Andes 2026: qué revisar antes de firmar",
    excerpt:
      "Una guía jurídica para revisar contratos de alquiler permanente y temporario: plazo, actualización, reparaciones, gastos, devolución de llaves y garantías, con artículos del Código Civil y Comercial y jurisprudencia real de Neuquén.",
    category: "Guía legal",
    date: "Julio 2026",
    dateTime: "2026-07",
    updated: "2026-07-17",
    readTime: "10 min",
    image: "/volcan-lanin-card.jpg",
  },
  {
    id: "airbnb-facil-san-martin-de-los-andes-2026",
    title: "¿Se terminó el Airbnb fácil en San Martín de los Andes?",
    excerpt:
      "La oferta crece, la ocupación mejora, pero las tarifas y los ingresos promedio retroceden. Qué cambian los nuevos controles con datos para propietarios e inversores en 2026.",
    category: "Mercado",
    date: "Julio 2026",
    dateTime: "2026-07-14",
    updated: "2026-07-14",
    readTime: "9 min",
    image: "/chapelco-invierno-sma-2026.webp",
    audio: { duracion: "19:11", generado: "2026-07-28" },
  },
  {
    id: "cuanto-rinde-alquiler-temporario-san-martin-de-los-andes",
    title: "Cuánto rinde un alquiler temporario en San Martín de los Andes",
    excerpt:
      "Todos hablan de la rentabilidad del alquiler turístico, pero pocos ponen números. Cuánto factura y cuánto deja realmente un temporario en San Martín de los Andes: ocupación por temporada, precio por noche, costos de gestión y comparación con el alquiler permanente, con datos reales.",
    category: "Inversión",
    date: "Junio 2026",
    dateTime: "2026-06",
    updated: "2026-07-14",
    readTime: "8 min",
    image: "/patagon.jpg",
    audio: { duracion: "21:17", generado: "2026-07-28" },
  },
  {
    id: "score-de-inversion-san-martin-de-los-andes",
    title: "Score de inversión: cómo leer una propiedad como un activo",
    excerpt:
      "El marco que usamos para evaluar una propiedad de San Martín de los Andes como un activo financiero: ubicación, revalorización, rentabilidad, liquidez y riesgo, con datos reales del mercado patagónico.",
    category: "Inversión",
    date: "Junio 2026",
    dateTime: "2026-06",
    updated: "2026-07-14",
    readTime: "9 min",
    image: "/patagonia-activo.jpg",
  },
  {
    id: "credito-hipotecario-neuquen-2026",
    title: "Crédito hipotecario de Neuquén 2026: cómo construir o refaccionar tu casa",
    excerpt:
      "La provincia lanzó créditos propios (plan Neuquén Habita) para construir, ampliar o refaccionar tu vivienda: tasa 2%, hasta el 100% de la obra y hasta $150 millones. Requisitos, montos y por qué alcanza a San Martín de los Andes y Villa la Angostura.",
    category: "Guía de Crédito",
    date: "Junio 2026",
    dateTime: "2026-06",
    updated: "2026-06-22",
    readTime: "7 min",
    image: "/hipotecario.jpeg",
  },
  {
    id: "cuanto-cuesta-una-casa-en-san-martin-de-los-andes",
    title: "¿Cuánto cuesta una casa en San Martín de los Andes? (2026)",
    excerpt:
      "Qué define el precio de una casa: zona, superficie, estado y vista. Cómo estimarlo con datos reales del m² por zona, por qué el precio publicado no es el valor real y cómo saber el precio justo de una propiedad puntual.",
    category: "Precios",
    date: "Junio 2026",
    dateTime: "2026-06",
    updated: "2026-06-16",
    readTime: "7 min",
    image: "/cartel-san-martin-de-los-andes.webp",
  },
  {
    id: "como-tasamos-tu-propiedad-con-datos",
    title: "Cómo tasamos tu propiedad con datos (y por qué te damos un rango)",
    excerpt: `Cómo funciona nuestro tasador por dentro: un modelo entrenado con ${RELEVADAS_MODELO_FMT} casas y departamentos reales de San Martín de los Andes. Qué mira, por qué te da un rango y no un número mágico, y qué cosas un modelo nunca puede ver.`,
    category: "Tasación con Datos",
    date: "Junio 2026",
    dateTime: "2026-06",
    updated: "2026-06-16",
    readTime: "8 min",
    image: "/portada.jpg",
  },
  {
    id: "comprar-en-san-martin-de-los-andes-desde-buenos-aires",
    title: "Cómo comprar en San Martín de los Andes desde Buenos Aires",
    excerpt:
      "Guía paso a paso para comprar a distancia: cuántas veces viajar, los gastos reales de la operación, cómo se transfiere el dinero en dólares y cómo evitar estafas. Lo que le explico a cada comprador de otra provincia.",
    category: "Guía para Compradores",
    date: "Junio 2026",
    dateTime: "2026-06",
    updated: "2026-06-12",
    readTime: "9 min",
    image: "/muelle.jpg",
  },
  {
    id: "donde-vivir-san-martin-de-los-andes",
    title: "¿Dónde vivir en San Martín de los Andes? Guía por barrios 2026",
    excerpt:
      "Análisis real de cada barrio: precio del m², tranquilidad, servicios y potencial de inversión. Lo que le diría a un amigo que me pregunta dónde comprar o mudarse.",
    category: "Guía de Barrios",
    date: "Junio 2026",
    dateTime: "2026-06",
    updated: "2026-06-02",
    readTime: "7 min",
    image: "/sanmartin.jpeg",
  },
  {
    id: "creditos-hipotecarios-uva-2026",
    title: "Créditos Hipotecarios UVA: La Llave para tu Casa Propia en la Patagonia",
    excerpt:
      "El crédito hipotecario volvió a Argentina. Descubrí cómo los créditos UVA te abren la puerta a comprar una propiedad en San Martín de los Andes: requisitos, bancos y guía paso a paso.",
    category: "Guía de Compra",
    date: "Mayo 2026",
    dateTime: "2026-05",
    updated: "2026-05-26",
    sitemapPriority: 0.8,
    readTime: "9 min",
    image: "/hipotecario.jpeg",
  },
  {
    id: "bitcoin-ladrillos-patagonicos",
    title: "El Bitcoin de los Ladrillos Patagónicos",
    excerpt:
      "¿Por qué invertir en propiedades en San Martín de los Andes es como comprar Bitcoin en 2013? Descubrí la tokenización del mercado inmobiliario patagónico.",
    category: "Inversión",
    date: "Mayo 2026",
    dateTime: "2026-05",
    updated: "2026-05-26",
    sitemapPriority: 0.7,
    readTime: "8 min",
    image: "/fintech.jpeg",
    audio: { duracion: "21:39", generado: "2026-07-27" },
  },
];

export default blogPosts;
