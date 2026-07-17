import Link from "next/link";
import { SITE_URL, canonicalUrl } from "@/config";

export const metadata = {
  title: "¿Dónde vivir en San Martín de los Andes? Guía por barrios 2026 | Catalán Propiedades",
  description: "Análisis real de los barrios de San Martín de los Andes: precios del m², internet, transporte, hospital, cloacas, seguridad y pet friendly. Guía basada en datos reales del mercado local.",
  keywords: "donde vivir san martin de los andes, barrios san martin de los andes, centro san martin andes, chapelco golf, barrio la cascada, vega maipu san martin",
  openGraph: {
    title: "¿Dónde vivir en San Martín de los Andes? Guía completa por barrios 2026",
    description: "Precios del m², internet, transporte, hospital, seguridad y más. El análisis más completo de cada barrio basado en datos reales.",
    url: canonicalUrl("/blog/donde-vivir-san-martin-de-los-andes"),
    type: "article",
    publishedTime: "2026-06-02T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [{ url: `${SITE_URL}/sanmartin.jpeg`, width: 1200, height: 630, alt: "Barrios de San Martín de los Andes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Dónde vivir en San Martín de los Andes? Guía por barrios 2026",
    description: "Precios del m², internet, transporte, hospital y seguridad por barrio. Análisis basado en datos reales.",
    images: [`${SITE_URL}/sanmartin.jpeg`],
  },
  alternates: {
    canonical: canonicalUrl("/blog/donde-vivir-san-martin-de-los-andes"),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "¿Dónde vivir en San Martín de los Andes? Guía completa por barrios 2026",
  description: "Análisis real de los barrios de San Martín de los Andes con precios del m², internet, transporte, hospital, cloacas, seguridad y pet friendly.",
  image: `${SITE_URL}/sanmartin.jpeg`,
  datePublished: "2026-06-02",
  dateModified: "2026-06-02",
  author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logoMC.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl("/blog/donde-vivir-san-martin-de-los-andes") },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuál es el barrio más barato para vivir en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Caleuche ofrece precios accesibles, con propiedades desde USD 900/m². Vega Maipú es otra opción económica (USD 1.400–1.900/m²) y tiene alto potencial de valorización a futuro por ser zona de expansión.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál es el barrio más exclusivo de San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Chapelco Golf y Peñón de Lolog son las zonas más exclusivas, con precios entre USD 2.200 y 3.000+ por m². Chapelco Golf ofrece seguridad privada 24h, vistas panorámicas y es el barrio con mayor demanda de compradores internacionales.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo es el internet en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Excelente en zonas céntricas. COTESMA, la cooperativa local, ofrece fibra óptica con velocidades de hasta 2.000 Mbps desde enero 2026. La cobertura es completa en el Centro y Vega Maipú. En Chapelco Golf, La Cascada y Peñón de Lolog la cobertura es parcial según el sector exacto.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo son los accesos en invierno en los barrios alejados?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Barrios como Chapelco Golf, La Cascada y Peñón de Lolog tienen accesos principales pavimentados pero internos en ripio que pueden quedar bloqueados con nieve. Es fundamental contar con vehículo 4x4 o con tracción. El Centro y zonas aledañas no tienen este problema ya que el municipio mantiene las calles despejadas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es San Martín de los Andes una ciudad segura?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, es una de las ciudades más seguras de la Patagonia. Según Numbeo (2024), el índice de seguridad es de 60/100, con 80/100 para caminar solo de día y 79/100 de noche. Los delitos son principalmente menores (robos en vehículos). El Centro es el sector con más movimiento y donde se concentra la mayor parte de los incidentes reportados. Los barrios residenciales alejados tienen mucha menor incidencia.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué cobertura médica tiene San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "San Martín cuenta con tres niveles de atención: el Hospital Zonal Dr. Ramón Carrillo (pública, urgencias y especialidades), tres centros médicos privados — Centro Médico Roca (Roca 1358 y Mascardi 955, con cirugía, oncología e imágenes), Centro Médico del Sur y Centro Médico San Martín — y el Centro de Salud Dr. Quirno Costa (atención primaria pública, lunes a viernes 8 a 16h). El Centro y zonas aledañas tienen acceso a todo en menos de 10 minutos. Barrios alejados como Peñón de Lolog quedan a 30–40 minutos del hospital, lo que es un factor crítico a considerar.",
      },
    },
    {
      "@type": "Question",
      name: "¿San Martín de los Andes es pet friendly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Muy pet friendly para vivir. Los barrios residenciales tienen amplios espacios verdes. Los perros pueden acceder al lago Lolog (de Playa Bonita a Puerto Arturo) y a varios miradores de la Ruta de los Siete Lagos. La restricción importante es que el Parque Nacional Lanín no permite mascotas.",
      },
    },
  ],
};

const BARRIOS = [
  {
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

function Puntos({ valor, max = 5, color = "bg-gray-900" }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < valor ? color : "bg-gray-200"}`} />
      ))}
    </div>
  );
}

function Badge({ children, variant = "gray" }) {
  const styles = {
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    green: "bg-green-50 text-green-700 border-green-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

function BarrioCard({ barrio }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{barrio.emoji}</span>
              <h3 className="text-xl font-black text-gray-900 leading-snug">{barrio.nombre}</h3>
              {barrio.autoObligatorio && (
                <span title="Auto obligatorio" className="text-sm">🚗</span>
              )}
              {barrio.petFriendly && (
                <span title="Pet friendly" className="text-sm">🐾</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {barrio.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="text-left flex-shrink-0 sm:text-right">
            <p className="text-xs text-gray-400 font-medium mb-0.5">Precio del m²</p>
            <p className="text-sm font-black text-gray-900">{barrio.precioM2}</p>
            <p className="text-xs text-gray-400 mt-0.5">{barrio.precioFuente}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <p className="text-gray-600 text-sm leading-relaxed mb-5">{barrio.descripcion}</p>

        {/* Métricas generales */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { label: "Tranquilidad", valor: barrio.tranquilidad },
            { label: "Servicios", valor: barrio.servicios },
            { label: "Potencial inversión", valor: barrio.inversion },
            { label: "Accesibilidad", valor: barrio.acceso },
          ].map((m) => (
            <div key={m.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
              <span className="text-xs text-gray-500 font-medium">{m.label}</span>
              <Puntos valor={m.valor} />
            </div>
          ))}
        </div>

        {/* Datos de infraestructura */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-5">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Infraestructura y servicios</p>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-base flex-shrink-0">🌐</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Internet</p>
                <p className="text-xs text-gray-400 leading-snug">{barrio.internet.detalle}</p>
              </div>
              <Puntos valor={barrio.internet.nivel} color="bg-blue-500" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-base flex-shrink-0">🚌</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Transporte público</p>
                <p className="text-xs text-gray-400 leading-snug">{barrio.transporte.detalle}</p>
              </div>
              <Puntos valor={barrio.transporte.nivel} color="bg-green-500" />
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏥</span>
                  <p className="text-xs font-semibold text-gray-700">Cobertura sanitaria</p>
                </div>
                <Puntos valor={barrio.hospital.nivel} color="bg-red-400" />
              </div>
              <div className="space-y-1.5 pl-1">
                {barrio.hospital.items.map((item) => {
                  const estilos = {
                    Hospital: { dot: "bg-red-500", label: "text-red-700 bg-red-50 border-red-100" },
                    Clínica:  { dot: "bg-orange-400", label: "text-orange-700 bg-orange-50 border-orange-100" },
                    Salita:   { dot: "bg-yellow-400", label: "text-yellow-700 bg-yellow-50 border-yellow-100" },
                  }[item.tipo] || { dot: "bg-gray-400", label: "text-gray-600 bg-gray-50 border-gray-100" };
                  return (
                    <div key={item.nombre} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${estilos.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${estilos.label}`}>{item.tipo}</span>
                          <span className="text-xs text-gray-600 leading-snug">{item.nombre}</span>
                        </div>
                        {item.distancia !== "—" && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.distancia}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-base flex-shrink-0">💧</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Cloacas</p>
                <p className="text-xs text-gray-400">{barrio.cloacas.estado}</p>
              </div>
              <Puntos valor={barrio.cloacas.nivel} color="bg-cyan-500" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-base flex-shrink-0">🔒</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Seguridad</p>
                <p className="text-xs text-gray-400 leading-snug">{barrio.seguridad.detalle}</p>
              </div>
              <Puntos valor={barrio.seguridad.nivel} color="bg-purple-500" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-base flex-shrink-0">🛣️</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">Calles</p>
                <p className="text-xs text-gray-400">{barrio.calles.estado}</p>
              </div>
              <Puntos valor={barrio.calles.nivel} color="bg-amber-500" />
            </div>
          </div>
        </div>

        {/* Perfil ideal */}
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ideal para</p>
          <div className="flex flex-wrap gap-1.5">
            {barrio.perfil.map((p) => (
              <Badge key={p} variant="rose">{p}</Badge>
            ))}
          </div>
        </div>

        {/* Pros y contras */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ventajas</p>
            <ul className="space-y-1.5">
              {barrio.ventajas.map((v) => (
                <li key={v} className="text-xs text-gray-600 flex gap-1.5">
                  <span className="text-green-500 flex-shrink-0">•</span>{v}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">A tener en cuenta</p>
            <ul className="space-y-1.5">
              {barrio.desventajas.map((d) => (
                <li key={d} className="text-xs text-gray-600 flex gap-1.5">
                  <span className="text-gray-400 flex-shrink-0">•</span>{d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DondeVivirPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 [hyphens:none] [overflow-wrap:normal]">

        {/* Header */}
        <header className="mb-10 md:mb-12">
          <p className="text-rose-600 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">Guía de Barrios · 2026</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            ¿Dónde vivir en San Martín de los Andes?
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
            La guía más completa de cada barrio: precio del m², internet, transporte, distancia al hospital, cloacas, seguridad y pet friendly. Sin filtros, con fuentes.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 border-t border-b border-gray-100 py-4">
            <img src="/Milton.webp" alt="Milton Catalán" className="w-9 h-9 rounded-full object-cover flex-shrink-0" loading="lazy" decoding="async" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Milton Catalán</p>
              <p className="text-xs text-gray-400">Asesor inmobiliario · +10 años en San Martín de los Andes</p>
            </div>
            <span className="ml-auto text-xs text-gray-400 flex-shrink-0">Junio 2026 · 8 min</span>
          </div>
        </header>

        {/* Intro */}
        <section className="mb-12">
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            La pregunta más frecuente que recibo es: <strong className="text-gray-900">“¿En qué barrio conviene vivir?”</strong>. La respuesta honesta es que depende de para qué. San Martín tiene zonas muy distintas entre sí — en precio, calidad de servicios, acceso en invierno y estilo de vida.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Esta guía cruza datos reales de portales inmobiliarios, COTESMA, el municipio y fuentes abiertas. No es marketing: es lo que le diría a un amigo antes de comprar.
          </p>
        </section>

        {/* Nota internet */}
        <div className="mb-10 flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">🌐</span>
          <div>
            <p className="font-bold text-blue-900 text-sm">Internet en San Martín: uno de los mejores de la Patagonia</p>
            <p className="text-blue-700 text-sm mt-1">COTESMA, la cooperativa local, ofrece fibra óptica con hasta <strong>2.000 Mbps</strong> desde enero 2026 sin costo adicional. La cobertura es excelente en zonas céntricas y va disminuyendo hacia los barrios más alejados y de mayor altitud.</p>
          </div>
        </div>

        {/* Nota seguridad */}
        <div className="mb-10 flex gap-3 items-start bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">🔒</span>
          <div>
            <p className="font-bold text-purple-900 text-sm">Seguridad general: índice 60/100 — una de las más seguras de la Patagonia</p>
            <p className="text-purple-700 text-sm mt-1">Según Numbeo (2024), caminar solo de día tiene un score de <strong>80/100</strong> y de noche <strong>79/100</strong>. Los delitos son principalmente menores. El 40% de los comerciantes del Centro reportó preocupación por robos en 2024 — los barrios residenciales alejados tienen mucha menos incidencia.</p>
          </div>
        </div>

        {/* Tabla comparativa */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Comparativa rápida</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-bold text-gray-700 whitespace-nowrap">Barrio</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700 whitespace-nowrap">Precio m²</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-700">🌐</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-700">🚌</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-700">🏥</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-700">💧</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-700">🔒</th>
                  <th className="text-center px-3 py-3 font-bold text-gray-700">🚗</th>
                </tr>
              </thead>
              <tbody>
                {BARRIOS.map((b, i) => (
                  <tr key={b.nombre} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{b.emoji} {b.nombre}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{b.precioM2}</td>
                    <td className="px-3 py-3 text-center"><Puntos valor={b.internet.nivel} color="bg-blue-400" /></td>
                    <td className="px-3 py-3 text-center"><Puntos valor={b.transporte.nivel} color="bg-green-400" /></td>
                    <td className="px-3 py-3 text-center"><Puntos valor={b.hospital.nivel} color="bg-red-400" /></td>
                    <td className="px-3 py-3 text-center"><Puntos valor={b.cloacas.nivel} color="bg-cyan-400" /></td>
                    <td className="px-3 py-3 text-center"><Puntos valor={b.seguridad.nivel} color="bg-purple-400" /></td>
                    <td className="px-3 py-3 text-center text-sm">{b.autoObligatorio ? "🚗" : "🚶"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
            <span>🌐 Internet · 🚌 Transporte · 🏥 Hospital · 💧 Cloacas · 🔒 Seguridad · 🚗 Auto / 🚶 Sin auto</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Precios basados en Properati, Argenprop y operaciones de mercado local. Junio 2026.</p>
        </section>

        {/* Cards */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Análisis completo por barrio</h2>
          <p className="text-gray-500 mb-8">Cada zona analizada con datos reales de infraestructura — lo que ningún portal inmobiliario te dice.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BARRIOS.map((barrio) => (
              <BarrioCard key={barrio.nombre} barrio={barrio} />
            ))}
          </div>
        </section>

        {/* Cuál elegir */}
        <section className="mb-14 bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-6">¿Cuál te conviene según tu situación?</h2>
          <div className="space-y-4">
            {[
              { perfil: "Querés vivir cerca de todo sin auto", recomendacion: "Centro", razon: "Acceso a pie a lago, comercios, hospital. Mayor demanda y liquidez." },
              { perfil: "Trabajás de forma remota y necesitás buena conexión", recomendacion: "Centro o Vega Maipú", razon: "Fibra óptica COTESMA hasta 2.000 Mbps — el mejor internet de la región." },
              { perfil: "Buscás tranquilidad y naturaleza con familia", recomendacion: "La Cascada", razon: "Bosque nativo, silencio y entorno patagónico a minutos del centro." },
              { perfil: "Primera vivienda con presupuesto limitado", recomendacion: "Vega Maipú o Caleuche", razon: "Precios del m² más accesibles y buena conexión con el centro." },
              { perfil: "Invertir para alquiler turístico", recomendacion: "Centro", razon: "Mayor demanda turística y mejor rentabilidad por noche durante todo el año." },
              { perfil: "Inversión premium a largo plazo", recomendacion: "Chapelco Golf", razon: "Mayor valorización histórica, seguridad privada y perfil de comprador internacional." },
              { perfil: "Exclusividad total y no te importa el aislamiento", recomendacion: "Peñón de Lolog", razon: "Vistas al lago Lolog únicas, pero distante 30–40 min del hospital y sin cloacas." },
            ].map((item) => (
              <div key={item.perfil} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-2" />
                <div>
                  <span className="font-bold text-gray-900 text-sm">{item.perfil} → </span>
                  <span className="font-bold text-rose-600 text-sm">{item.recomendacion}. </span>
                  <span className="text-gray-500 text-sm">{item.razon}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pet friendly */}
        <section className="mb-14 bg-green-50 border border-green-100 rounded-2xl p-6">
          <div className="flex gap-3 items-start">
            <span className="text-2xl flex-shrink-0">🐾</span>
            <div>
              <h3 className="font-black text-gray-900 text-lg mb-2">San Martín de los Andes es muy pet friendly</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Todos los barrios residenciales tienen amplio espacio para mascotas. Los perros pueden acceder al lago Lolog (de Playa Bonita a Puerto Arturo) y a varios miradores de la Ruta de los Siete Lagos.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                <strong>Restricción importante:</strong> el Parque Nacional Lanín prohíbe el ingreso de mascotas. Si vivís en zonas como Chapelco o La Cascada y hacés trekking frecuentemente en el parque, tenés que considerarlo.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {faqJsonLd.mainEntity.map((item) => (
              <details key={item.name} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                  {item.name}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                  {item.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Fuentes */}
        <section className="mb-14 border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Fuentes consultadas</p>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>• <a href="https://www.properati.com.ar/s/san-martin-de-los-andes/departamento/venta" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Properati — Precios de departamentos en venta, San Martín de los Andes 2025</a></li>
            <li>• <a href="https://www.reporteinmobiliario.com/article5612-precio-del-m2-real-de-cierre-en-febrero-2025" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Reporte Inmobiliario — Precio del m² real de cierre, febrero 2025</a></li>
            <li>• <a href="https://www.lacardigital.com.ar/cotesma-anuncio-un-upgrade-de-velocidad-en-sus-servicios-de-internet-por-fibra-optica/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Lacar Digital — COTESMA upgrade velocidad fibra óptica hasta 2.000 Mbps</a></li>
            <li>• <a href="https://www.centromedicoroca.com.ar/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Centro Médico Roca — Especialidades y sedes San Martín de los Andes</a></li>
            <li>• <a href="https://www.centromedicosur.com.ar/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Centro Médico del Sur — San Martín de los Andes</a></li>
            <li>• <a href="https://realidadsm.com/2025/01/27/inauguran-nuevos-centros-de-salud-en-san-martin-de-los-andes-para-mejorar-la-atencion-medica/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Realidad SM — Inauguración Centro de Salud Dr. Quirno Costa y Centro Rehabilitación Luz Sapag, enero 2025</a></li>
            <li>• <a href="https://www.numbeo.com/crime/in/San-Martin-de-Los-Andes-Argentina" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Numbeo — Índice de criminalidad y seguridad San Martín de los Andes 2024</a></li>
            <li>• <a href="https://www.mejorinformado.com/regionales/2025-7-29-8-23-32-importante-inversion-para-mejorar-agua-potable-y-cloacas-en-san-martin-de-los-andes" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">MejorInformado — Inversión $128M en agua potable y cloacas 2025</a></li>
            <li>• <a href="https://es.wikipedia.org/wiki/Anexo:L%C3%ADneas_de_colectivos_de_la_ciudad_de_San_Mart%C3%ADn_de_los_Andes" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Wikipedia — Líneas de colectivos de San Martín de los Andes</a></li>
            <li>• <a href="https://www.rionegro.com.ar/sociedad/mascotas-en-los-parques-nacionales-y-cordillera-donde-si-pueden-acompanarte-en-bariloche-san-martin-de-los-andes-y-otros-destinos-3914290/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Río Negro — Mascotas en Parques Nacionales de la Patagonia</a></li>
            <li className="text-gray-400 pt-1">+ Datos propios de operaciones cerradas en el mercado local 2024–2025 · Catalán Propiedades</li>
          </ul>
        </section>

        {/* CTAs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link href="/propiedades" className="flex flex-col gap-2 p-6 bg-gray-900 hover:bg-gray-800 rounded-2xl transition-colors group">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Ver propiedades</p>
            <p className="text-white font-black text-lg leading-tight">Encontrá tu propiedad en el barrio ideal</p>
            <span className="text-gray-400 text-sm group-hover:text-white transition-colors">Ver catálogo →</span>
          </Link>
          <Link href="/experiencia-barrio" className="flex flex-col gap-2 p-6 bg-rose-600 hover:bg-rose-500 rounded-2xl transition-colors group">
            <p className="text-rose-200 text-xs font-bold uppercase tracking-widest">Guía de barrios</p>
            <p className="text-white font-black text-lg leading-tight">¿Vivís en uno de estos barrios?</p>
            <span className="text-rose-200 text-sm group-hover:text-white transition-colors">Compartí tu experiencia →</span>
          </Link>
        </section>

        {/* Posts relacionados */}
        <section className="border-t border-gray-100 pt-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">También te puede interesar</p>
          <div className="space-y-3">
            <Link href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/cartel-san-martin-de-los-andes.webp" alt="Cuánto cuesta una casa en San Martín de los Andes" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Precios</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  ¿Cuánto cuesta una casa en San Martín de los Andes? (2026)
                </p>
              </div>
            </Link>
            <Link href="/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/muelle.jpg" alt="Comprar en San Martín de los Andes desde Buenos Aires" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Guía para Compradores</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  Cómo comprar en San Martín de los Andes desde Buenos Aires
                </p>
              </div>
            </Link>
          </div>
        </section>

      </article>
    </>
  );
}
