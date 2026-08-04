// Perfiles editoriales de barrio — el dataset de siembra de la Guía de Barrios.
//
// Estos datos vivían dentro de app/blog/donde-vivir-san-martin-de-los-andes/page.js,
// encerrados en un archivo de 767 líneas: se veían en un solo post y en ninguna
// otra parte del sitio. Acá quedan disponibles para el post, para las fichas
// /barrios/[slug] y para lo que venga.
//
// Es la parte EDITORIAL (lo que sabemos nosotros y verificamos). La parte de
// OPINIONES (lo que dicen los vecinos) vive en Supabase y se lee con
// lib/barrioOpiniones.js. Son dos fuentes distintas y en la ficha se muestran
// separadas a propósito: una es nuestra investigación, la otra es el dataset
// que se acumula solo.
//
// `slug` referencia a lib/barrios.js, que es la lista canónica.

export const PERFILES_BARRIO = [
  {
    slug: "centro",
    nombre: "Centro",
    emoji: "🏙️",
    descripcion: "El corazón de San Martín. Acceso a todo a pie: comercios, restaurantes, lago Lácar, costanera y el Hospital Zonal. La zona con mayor demanda de alquiler turístico y permanente.",
    perfil: ["Profesionales", "Familias", "Inversores en alquiler"],
    precioM2: "USD 2.500 – 3.200",
    precioFuente: "Properati / Reporte Inmobiliario 2025",
    tranquilidad: 3,
    servicios: 5,
    inversion: 4,
    acceso: 5,
    internet: { nivel: 5, detalle: "Fibra óptica COTESMA hasta 2.000 Mbps" },
    transporte: { nivel: 5, detalle: "9 líneas urbanas con colectivo" },
    hospital: {
      nivel: 5,
      items: [
        { tipo: "Hospital", nombre: "Hospital Zonal Dr. Ramón Carrillo", distancia: "5–10 min a pie" },
        { tipo: "Clínica", nombre: "Centro Médico Roca (Roca 1358 y Mascardi 955)", distancia: "5 min a pie" },
        { tipo: "Clínica", nombre: "Centro Médico del Sur", distancia: "5–10 min a pie" },
        { tipo: "Clínica", nombre: "Centro Médico San Martín", distancia: "5–10 min a pie" },
        { tipo: "Salita", nombre: "Centro de Salud Dr. Quirno Costa", distancia: "En zona centro" },
      ],
    },
    cloacas: { estado: "Completa", nivel: 5 },
    seguridad: { nivel: 3, detalle: "Mayor concentración de incidentes menores" },
    calles: { estado: "Asfalto completo", nivel: 5 },
    petFriendly: true,
    autoObligatorio: false,
    ventajas: [
      "Todo accesible a pie",
      "Mayor liquidez para vender o alquilar",
      "Alta demanda turística todo el año",
      "Hospital y servicios a metros",
    ],
    desventajas: [
      "Precio del m² más alto",
      "Más ruido y movimiento en temporada alta",
    ],
    tags: ["Alquiler permanente", "Turístico", "Sin auto"],
  },
  {
    slug: "chapelco-golf",
    nombre: "Chapelco Golf",
    emoji: "⛳",
    descripcion: "Barrio privado de alta gama con vistas a la montaña y al campo de golf. El más exclusivo de la ciudad. Seguridad privada 24h, baja densidad y mucho verde. Requiere auto para absolutamente todo.",
    perfil: ["Inversores premium", "Familias de alto poder adquisitivo", "Segunda residencia"],
    precioM2: "USD 2.200 – 3.000+",
    precioFuente: "Argenprop / Zonaprop 2025",
    tranquilidad: 5,
    servicios: 2,
    inversion: 5,
    acceso: 2,
    internet: { nivel: 3, detalle: "Fibra óptica parcial según sector — verificar antes de comprar" },
    transporte: { nivel: 1, detalle: "Sin colectivo urbano — auto obligatorio" },
    hospital: {
      nivel: 2,
      items: [
        { tipo: "Hospital", nombre: "Hospital Zonal Dr. Ramón Carrillo", distancia: "15–25 min en auto" },
        { tipo: "Clínica", nombre: "Centro Médico Roca / Centro Médico del Sur", distancia: "15–25 min en auto" },
        { tipo: "Salita", nombre: "Sin salita propia en el barrio — atención en centro", distancia: "—" },
      ],
    },
    cloacas: { estado: "En expansión — obra provincial 2025", nivel: 3 },
    seguridad: { nivel: 5, detalle: "Seguridad privada 24h, acceso controlado" },
    calles: { estado: "Pavimento en accesos, ripio interno", nivel: 3 },
    petFriendly: true,
    autoObligatorio: true,
    ventajas: [
      "Seguridad privada 24h",
      "Vistas panorámicas únicas",
      "Mayor valorización histórica",
      "Entorno exclusivo con espacios verdes",
    ],
    desventajas: [
      "Auto indispensable para todo",
      "Acceso comprometido en invierno con nieve",
      "Expensas de barrio privado",
      "Cobertura de fibra óptica variable",
    ],
    tags: ["Premium", "Barrio privado", "Inversión"],
  },
  {
    slug: "la-cascada",
    nombre: "Barrio La Cascada",
    emoji: "🌊",
    descripcion: "Zona residencial tranquila sobre la ruta a la Cascada del Chachín. Muy buscada por familias y profesionales remotos que quieren naturaleza sin sacrificar la cercanía al centro. Accesos de ripio en sectores internos.",
    perfil: ["Familias", "Trabajadores remotos", "Quienes buscan tranquilidad"],
    precioM2: "USD 1.800 – 2.400",
    precioFuente: "Estimación propia — datos de mercado local 2025",
    tranquilidad: 5,
    servicios: 3,
    inversion: 4,
    acceso: 3,
    internet: { nivel: 3, detalle: "Fibra óptica en expansión — verificar disponibilidad por dirección" },
    transporte: { nivel: 2, detalle: "Sin línea directa — auto necesario" },
    hospital: {
      nivel: 3,
      items: [
        { tipo: "Hospital", nombre: "Hospital Zonal Dr. Ramón Carrillo", distancia: "10–20 min en auto" },
        { tipo: "Clínica", nombre: "Centro Médico Roca / Centro Médico del Sur", distancia: "10–20 min en auto" },
        { tipo: "Salita", nombre: "Sin salita propia — acceso por centro", distancia: "—" },
      ],
    },
    cloacas: { estado: "Parcial según sector", nivel: 3 },
    seguridad: { nivel: 4, detalle: "Zona tranquila con baja incidencia delictiva" },
    calles: { estado: "Pavimento en acceso principal, ripio en internos", nivel: 3 },
    petFriendly: true,
    autoObligatorio: true,
    ventajas: [
      "Naturaleza y silencio real",
      "Precio más accesible que el Centro",
      "Entorno de bosque nativo",
      "Comunidad familiar consolidada",
    ],
    desventajas: [
      "Auto obligatorio para todo",
      "Acceso complicado con nieve intensa",
      "Cobertura de fibra óptica variable",
    ],
    tags: ["Naturaleza", "Familias", "Tranquilidad"],
  },
  {
    slug: "vega-maipu",
    nombre: "Vega Maipú",
    emoji: "🌿",
    descripcion: "Barrio en plena expansión al norte del centro. Los precios más accesibles de zonas residenciales con el mayor potencial de valorización. Infraestructura en desarrollo — ideal para quienes pueden esperar que el barrio madure.",
    perfil: ["Primera vivienda", "Inversores a largo plazo", "Jóvenes profesionales"],
    precioM2: "USD 1.400 – 1.900",
    precioFuente: "Argenprop / datos propios 2025",
    tranquilidad: 4,
    servicios: 3,
    inversion: 5,
    acceso: 4,
    internet: { nivel: 4, detalle: "Fibra óptica COTESMA disponible en la mayor parte del barrio" },
    transporte: { nivel: 4, detalle: "Líneas urbanas pasan por la zona" },
    hospital: {
      nivel: 4,
      items: [
        { tipo: "Hospital", nombre: "Hospital Zonal Dr. Ramón Carrillo", distancia: "10–15 min en auto o colectivo" },
        { tipo: "Clínica", nombre: "Centro Médico Roca / Centro Médico del Sur", distancia: "10–15 min en auto" },
        { tipo: "Salita", nombre: "Centro de Rehabilitación Luz Sapag (inaugurado ene 2025)", distancia: "En zona hospital" },
      ],
    },
    cloacas: { estado: "En expansión — incluido en obra provincial $128M 2025", nivel: 3 },
    seguridad: { nivel: 4, detalle: "Zona residencial tranquila" },
    calles: { estado: "Mixto: asfalto en arterias principales, ripio en internos", nivel: 3 },
    petFriendly: true,
    autoObligatorio: false,
    ventajas: [
      "Precio del m² más bajo entre zonas residenciales",
      "Mayor potencial de valorización a futuro",
      "Colectivo disponible",
      "Lotes amplios",
    ],
    desventajas: [
      "Infraestructura de cloacas en desarrollo",
      "Algunas calles en ripio",
      "Menos servicios que el Centro",
    ],
    tags: ["Oportunidad", "Expansión", "Primera vivienda"],
  },
  {
    slug: "penon-de-lolog",
    nombre: "Peñón de Lolog",
    emoji: "🏔️",
    descripcion: "Zona exclusiva sobre el lago Lolog con vistas de primer nivel. Para quienes priorizan entorno natural de elite sobre la accesibilidad urbana. El más alejado del centro — 30 a 40 minutos al hospital.",
    perfil: ["Inversores de alto patrimonio", "Segunda residencia premium", "Amantes de la naturaleza extrema"],
    precioM2: "USD 2.200 – 3.000+",
    precioFuente: "Datos propios / operaciones cerradas en zona 2024–2025",
    tranquilidad: 5,
    servicios: 1,
    inversion: 4,
    acceso: 1,
    internet: { nivel: 2, detalle: "Conectividad limitada — principalmente satelital o 4G" },
    transporte: { nivel: 1, detalle: "Sin transporte público — auto 4x4 imprescindible" },
    hospital: {
      nivel: 1,
      items: [
        { tipo: "Hospital", nombre: "Hospital Zonal Dr. Ramón Carrillo", distancia: "30–40 min en auto" },
        { tipo: "Clínica", nombre: "Centro Médico Roca / Centro Médico del Sur", distancia: "30–40 min en auto" },
        { tipo: "Salita", nombre: "Sin salita en la zona — zona aislada", distancia: "—" },
      ],
    },
    cloacas: { estado: "Sin red cloacal — pozo ciego / sistema propio", nivel: 1 },
    seguridad: { nivel: 5, detalle: "Zona aislada con muy baja incidencia delictiva" },
    calles: { estado: "Ripio — sin asfaltar", nivel: 1 },
    petFriendly: true,
    autoObligatorio: true,
    ventajas: [
      "Vistas al lago Lolog incomparables",
      "Privacidad y exclusividad real",
      "Alta valorización histórica",
      "Naturaleza virgen",
    ],
    desventajas: [
      "30–40 min al hospital — riesgo en emergencias",
      "Sin internet de calidad",
      "Sin cloacas — sistema propio",
      "Solo accesible en 4x4 con mal tiempo",
      "Sin transporte público",
    ],
    tags: ["Exclusivo", "Vista al lago", "Aislado"],
  },
  {
    slug: "caleuche",
    nombre: "Caleuche",
    emoji: "🏡",
    descripcion: "Barrio popular consolidado con precios accesibles dentro de la ciudad. Comunidad local auténtica, buena conectividad al centro y servicios básicos completos. Muy elegido para residencia permanente.",
    perfil: ["Residencia permanente", "Primera vivienda", "Comunidad local"],
    precioM2: "USD 900 – 1.400",
    precioFuente: "Argenprop / Mercado Libre 2025",
    tranquilidad: 4,
    servicios: 3,
    inversion: 3,
    acceso: 4,
    internet: { nivel: 4, detalle: "Fibra óptica COTESMA disponible — red en expansión activa" },
    transporte: { nivel: 4, detalle: "Varias líneas urbanas con frecuencia razonable" },
    hospital: {
      nivel: 3,
      items: [
        { tipo: "Hospital", nombre: "Hospital Zonal Dr. Ramón Carrillo", distancia: "10–15 min en auto o colectivo" },
        { tipo: "Clínica", nombre: "Centro Médico Roca / Centro Médico del Sur", distancia: "10–15 min en auto" },
        { tipo: "Salita", nombre: "Centro de Salud Dr. Quirno Costa (zona centro)", distancia: "10–15 min" },
      ],
    },
    cloacas: { estado: "Parcial — Caleuche incluido en obra provincial 2025", nivel: 3 },
    seguridad: { nivel: 3, detalle: "Zona residencial con actividad normal" },
    calles: { estado: "Mixto: asfalto en arterias, ripio en sectores", nivel: 3 },
    petFriendly: true,
    autoObligatorio: false,
    ventajas: [
      "Precio más accesible de la ciudad",
      "Comunidad local consolidada",
      "Colectivo disponible",
      "Inversión provincial en mejoras 2025",
    ],
    desventajas: [
      "Menor potencial de valorización que zonas premium",
      "Algunas calles sin asfaltar",
      "Cloacas en expansión",
    ],
    tags: ["Accesible", "Residencial", "Local"],
  },
];

// Indexado por slug, que es como lo consumen las fichas.
export const PERFIL_POR_SLUG = Object.fromEntries(
  PERFILES_BARRIO.map((p) => [p.slug, p])
);

export function getPerfilBarrio(slug) {
  return PERFIL_POR_SLUG[slug] ?? null;
}

export default PERFILES_BARRIO;
