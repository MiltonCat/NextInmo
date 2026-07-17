import Link from "next/link";
import Image from "next/image";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { RELEVADAS_MODELO_FMT } from "@/lib/mercado";


export const metadata = {
  title: "Blog | Catalán Propiedades",
  description: "Artículos sobre inversión inmobiliaria, mercado en la Patagonia y guías para comprar o alquilar en San Martín de los Andes.",
  openGraph: {
    title: "Blog de inversión inmobiliaria — Catalán Propiedades",
    description: "Análisis, guías y tendencias del mercado inmobiliario en San Martín de los Andes y la Patagonia.",
    url: canonicalUrl("/blog"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Blog Catalán Propiedades — San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog de inversión inmobiliaria — Catalán Propiedades",
    description: "Análisis, guías y tendencias del mercado inmobiliario en San Martín de los Andes y la Patagonia.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/blog"),
  },
};

const blogPosts = [
  {
    id: "alquileres-san-martin-de-los-andes-2026",
    title: "Alquileres en San Martín de los Andes 2026: qué revisar antes de firmar",
    excerpt:
      "Una guía jurídica para revisar contratos de alquiler permanente y temporario: plazo, actualización, reparaciones, gastos, devolución de llaves y garantías, con artículos del Código Civil y Comercial y jurisprudencia real de Neuquén.",
    category: "Guía legal",
    date: "Julio 2026",
    dateTime: "2026-07",
    readTime: "10 min",
    image: "/volcan-lanin.png",
  },
  {
    id: "airbnb-facil-san-martin-de-los-andes-2026",
    title: "¿Se terminó el Airbnb fácil en San Martín de los Andes?",
    excerpt:
      "La oferta crece, la ocupación mejora, pero las tarifas y los ingresos promedio retroceden. Qué cambian los nuevos controles con datos para propietarios e inversores en 2026.",
    category: "Mercado",
    date: "Julio 2026",
    dateTime: "2026-07-14",
    readTime: "9 min",
    image: "/chapelco-invierno-sma-2026.webp",
  },
  {
    id: "cuanto-rinde-alquiler-temporario-san-martin-de-los-andes",
    title: "Cuánto rinde un alquiler temporario en San Martín de los Andes",
    excerpt:
      "Todos hablan de la rentabilidad del alquiler turístico, pero pocos ponen números. Cuánto factura y cuánto deja realmente un temporario en San Martín de los Andes: ocupación por temporada, precio por noche, costos de gestión y comparación con el alquiler permanente, con datos reales.",
    category: "Inversión",
    date: "Junio 2026",
    dateTime: "2026-06",
    readTime: "8 min",
    image: "/patagon.jpg",
  },
  {
    id: "score-de-inversion-san-martin-de-los-andes",
    title: "Score de inversión: cómo leer una propiedad como un activo",
    excerpt:
      "El marco que usamos para evaluar una propiedad de San Martín de los Andes como un activo financiero: ubicación, revalorización, rentabilidad, liquidez y riesgo, con datos reales del mercado patagónico.",
    category: "Inversión",
    date: "Junio 2026",
    dateTime: "2026-06",
    readTime: "9 min",
    image: "/patagonia-activo.jpg",
  },
  {
    id: "credito-hipotecario-neuquen-2026",
    title: "Crédito hipotecario de Neuquén 2026: cómo construir o refaccionar tu casa",
    excerpt: "La provincia lanzó créditos propios (plan Neuquén Habita) para construir, ampliar o refaccionar tu vivienda: tasa 2%, hasta el 100% de la obra y hasta $150 millones. Requisitos, montos y por qué alcanza a San Martín de los Andes y Villa la Angostura.",
    category: "Guía de Crédito",
    date: "Junio 2026",
    dateTime: "2026-06",
    readTime: "7 min",
    image: "/hipotecario.jpeg",
  },
  {
    id: "cuanto-cuesta-una-casa-en-san-martin-de-los-andes",
    title: "¿Cuánto cuesta una casa en San Martín de los Andes? (2026)",
    excerpt: "Qué define el precio de una casa: zona, superficie, estado y vista. Cómo estimarlo con datos reales del m² por zona, por qué el precio publicado no es el valor real y cómo saber el precio justo de una propiedad puntual.",
    category: "Precios",
    date: "Junio 2026",
    dateTime: "2026-06",
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
    readTime: "8 min",
    image: "/portada.jpg",
  },
  {
    id: "comprar-en-san-martin-de-los-andes-desde-buenos-aires",
    title: "Cómo comprar en San Martín de los Andes desde Buenos Aires",
    excerpt: "Guía paso a paso para comprar a distancia: cuántas veces viajar, los gastos reales de la operación, cómo se transfiere el dinero en dólares y cómo evitar estafas. Lo que le explico a cada comprador de otra provincia.",
    category: "Guía para Compradores",
    date: "Junio 2026",
    dateTime: "2026-06",
    readTime: "9 min",
    image: "/muelle.jpg",
  },
  {
    id: "donde-vivir-san-martin-de-los-andes",
    title: "¿Dónde vivir en San Martín de los Andes? Guía por barrios 2026",
    excerpt: "Análisis real de cada barrio: precio del m², tranquilidad, servicios y potencial de inversión. Lo que le diría a un amigo que me pregunta dónde comprar o mudarse.",
    category: "Guía de Barrios",
    date: "Junio 2026",
    dateTime: "2026-06",
    readTime: "7 min",
    image: "/sanmartin.jpeg",
  },
  {
    id: "creditos-hipotecarios-uva-2026",
    title: "Créditos Hipotecarios UVA: La Llave para tu Casa Propia en la Patagonia",
    excerpt: "El crédito hipotecario volvió a Argentina. Descubrí cómo los créditos UVA te abren la puerta a comprar una propiedad en San Martín de los Andes: requisitos, bancos y guía paso a paso.",
    category: "Guía de Compra",
    date: "Mayo 2026",
    dateTime: "2026-05",
    readTime: "9 min",
    image: "/hipotecario.jpeg",
  },
  {
    id: "bitcoin-ladrillos-patagonicos",
    title: "El Bitcoin de los Ladrillos Patagónicos",
    excerpt: "¿Por qué invertir en propiedades en San Martín de los Andes es como comprar Bitcoin en 2013? Descubrí la tokenización del mercado inmobiliario patagónico.",
    category: "Inversión",
    date: "Mayo 2026",
    dateTime: "2026-05",
    readTime: "8 min",
    image: "/fintech.jpeg",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-8 pb-10 md:pt-24 md:pb-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">Blog</p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">Inversión y mercado inmobiliario</h1>
          <p className="text-gray-500 text-base max-w-xl">Análisis, guías y tendencias del mercado inmobiliario en San Martín de los Andes y la Patagonia.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <time dateTime={post.dateTime}>{post.date}</time>
                  <span>·</span>
                  <span>{post.readTime} de lectura</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-rose-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  Leer artículo
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Guía de Barrios CTA */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-10 bg-gray-900 rounded-3xl flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3">Guía de Barrios</p>
              <h2 className="text-2xl font-black text-white mb-3 leading-tight">
                ¿Cómo es vivir en tu barrio de San Martín?
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Compartí tu experiencia y ayudá a otros a elegir mejor dónde comprar, invertir o mudarse. Anónimo, menos de 5 minutos.
              </p>
            </div>
            <Link
              href="/experiencia-barrio"
              className="mt-8 inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors self-start"
            >
              Compartir mi barrio
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="p-10 bg-rose-600 rounded-3xl flex flex-col justify-between">
            <div>
              <p className="text-rose-200 text-xs font-bold tracking-widest uppercase mb-3">Más contenido en camino</p>
              <h2 className="text-2xl font-black text-white mb-3 leading-tight">
                Análisis, guías y tendencias del mercado patagónico
              </h2>
              <p className="text-rose-100 text-sm leading-relaxed">
                Evolución del precio del m², guías de compra, oportunidades de inversión y mucho más.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/inversiones" className="bg-white hover:bg-rose-50 text-rose-600 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Ver análisis de mercado
              </Link>
              <Link href="/precio-m2" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors border border-white/20">
                Precio del m²
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
