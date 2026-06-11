import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import SuscripcionForm from "@/components/SuscripcionForm";
import dynamic from "next/dynamic";
const InvestmentMapClient = dynamic(() => import("@/components/InvestmentMapClient"));
import { getProperties } from "@/lib/properties";

import { canonicalUrl, DEFAULT_OG_IMAGE, TASADOR_URL } from "@/config";

// Refresca el contenido desde la base cada 5 minutos sin necesidad de redeploy.
export const revalidate = 300;

export const metadata = {
  title: "Catalán Propiedades | Inmobiliaria en San Martín de los Andes",
  description: "Venta de propiedades, alquileres permanentes y asesoría en inversiones inmobiliarias en San Martín de los Andes, Patagonia. +10 años de experiencia.",
  openGraph: {
    title: "Catalán Propiedades | Inmobiliaria en San Martín de los Andes",
    description: "Venta de propiedades, alquileres permanentes y asesoría en inversiones inmobiliarias en San Martín de los Andes, Patagonia. +10 años de experiencia.",
    url: canonicalUrl("/"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Catalán Propiedades — Inmobiliaria en San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalán Propiedades | Inmobiliaria en San Martín de los Andes",
    description: "Venta de propiedades, alquileres permanentes y asesoría en inversiones inmobiliarias en la Patagonia.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/"),
  },
};

export default async function Home() {
  const properties = await getProperties();
  const featuredProperties = properties.slice(0, 3);

  return (
    <div>
      <Hero />

      {/* Bloque diferencial */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-rose-600 text-xs font-bold tracking-widest uppercase mb-2">Por qué elegirnos</p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
                No somos un portal. Somos asesores con datos reales del mercado local.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Analizamos más de 600 propiedades en San Martín de los Andes para ayudarte a comprar, alquilar o invertir con información concreta, no promedios nacionales.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 lg:gap-10 lg:flex-shrink-0">
              {[
                { valor: "600+", label: "Propiedades relevadas" },
                { valor: "10+", label: "Años de experiencia" },
                { valor: "+18%", label: "ROI promedio gestionado" },
              ].map((stat) => (
                <div key={stat.label} className="text-center min-w-[80px]">
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{stat.valor}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">{stat.label}</p>
                </div>
              ))}
              <Link
                href="/nosotros"
                className="text-rose-600 hover:text-rose-500 text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                Conocer más
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tasador predictivo */}
      <section className="max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <a
          href={TASADOR_URL}
          className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex-1">
            <p className="text-rose-400 text-[11px] font-bold tracking-widest uppercase mb-1.5">Nuevo · Resultado al instante</p>
            <p className="text-white text-lg font-bold leading-snug mb-1">
              ¿Cuánto vale tu propiedad? Descubrilo con el tasador predictivo
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Estimación inmediata con un modelo entrenado con datos reales de San Martín de los Andes, más un informe PDF gratis.
            </p>
          </div>
          <span className="inline-flex items-center justify-center gap-2 bg-rose-600 group-hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors whitespace-nowrap flex-shrink-0">
            Tasar al instante
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </a>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          Propiedades Destacadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/propiedades"
            className="inline-block bg-rose-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-rose-500 transition shadow-lg"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </section>

      {/* Suscripción — "sé el primero en enterarte" */}
      <section className="bg-rose-600">
        <div className="max-w-4xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center mb-7">
            <p className="text-rose-200 text-xs font-bold tracking-widest uppercase mb-2">Propiedades nuevas</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              Sé el primero en enterarte
            </h2>
            <p className="text-rose-100 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              En San Martín de los Andes las mejores oportunidades se venden rápido. Dejanos tu email
              y te avisamos apenas entra una propiedad nueva — antes de que llegue a los portales.
            </p>
          </div>
          <div className="max-w-xl mx-auto">
            <SuscripcionForm />
          </div>
        </div>
      </section>

      {/* Sección de Confianza y Autoridad */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">Trayectoria y Confianza</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Conocemos cada barrio, cada precio y cada oportunidad de San Martín de los Andes.
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Milton Catalán lleva más de 10 años operando en el mercado inmobiliario de San Martín de los Andes. Cada propiedad que publicamos fue revisada en persona. Cada precio fue validado con datos reales del mercado local.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Seguridad Jurídica</p>
                    <p className="text-sm text-gray-500">Operaciones transparentes.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Visión de Inversión</p>
                    <p className="text-sm text-gray-500">Maximizamos tu retorno.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/trayectoria.jpeg"
                  alt="San Martín de los Andes — Catalán Propiedades"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover" style={{ objectPosition: 'center 65%' }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl hidden md:block">
                <p className="text-rose-600 text-3xl font-bold mb-1">100%</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Atención Personalizada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operaciones cerradas — prueba social */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-rose-600 text-xs font-bold tracking-widest uppercase mb-2">Resultados reales</p>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
              Operaciones cerradas en San Martín de los Andes
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Algunas de las ventas gestionadas por Catalán Propiedades. Cada operación se cerró
              con tasación basada en datos y acompañamiento hasta la escritura.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                emoji: "🏔️",
                tipo: "Lote",
                zona: "Vega Maipú",
                precio: "USD 110.000",
                detalle: "Vendido · 2024",
              },
              {
                emoji: "🏔️",
                tipo: "Lote 600 m² · Caleuche",
                zona: "Paseo de los Músicos",
                precio: "USD 30.000",
                detalle: "Vendido · 2020",
              },
              {
                emoji: "🏪",
                tipo: "Local comercial a estrenar",
                zona: "Centro",
                precio: "USD 200.000",
                detalle: "Vendido · 2025",
              },
              {
                emoji: "🏢",
                tipo: "Monoambiente en pozo",
                zona: "Centro",
                precio: "USD 105.000",
                detalle: "Vendido · 2020",
              },
            ].map((op) => (
              <div key={`${op.tipo}-${op.precio}`} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col">
                <span className="text-2xl mb-3">{op.emoji}</span>
                <p className="text-sm font-bold text-gray-900 leading-snug">{op.tipo}</p>
                <p className="text-xs text-gray-400 mt-0.5 mb-4">{op.zona}</p>
                <p className="text-xl font-black text-gray-900 mt-auto">{op.precio}</p>
                <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-600 mt-1">{op.detalle}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/vender"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-500 text-sm font-semibold transition-colors"
            >
              ¿Querés que la próxima sea tu propiedad? Conocé cómo trabajamos
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Guía de Barrios — link a experiencia-barrio */}
      <section className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl bg-gray-50 border border-gray-200 px-8 py-7">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-rose-600 mb-1">Guía de Barrios</p>
              <h3 className="text-lg font-black text-gray-900 leading-snug">¿Vivís o viviste en San Martín de los Andes?</h3>
              <p className="text-gray-500 text-sm mt-1">Tu experiencia local ayuda a otros a elegir mejor dónde comprar o invertir.</p>
            </div>
            <Link
              href="/experiencia-barrio"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Compartir mi barrio
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA doble — compradores y vendedores */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3">Compradores e inversores</p>
              <h3 className="text-2xl font-black text-white mb-3 leading-tight">¿Querés comprar o invertir en San Martín de los Andes?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Explorá el catálogo de propiedades disponibles o analizá las mejores oportunidades de inversión con datos reales del mercado.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/propiedades" className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Ver propiedades
              </Link>
              <Link href="/inversiones" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors border border-white/20">
                Analizar inversión
              </Link>
            </div>
          </div>

          <div className="bg-rose-600 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-rose-200 text-xs font-bold tracking-widest uppercase mb-3">Propietarios</p>
              <h3 className="text-2xl font-black text-white mb-3 leading-tight">¿Tenés una propiedad para vender o alquilar?</h3>
              <p className="text-rose-100 text-sm leading-relaxed">Vendé al precio correcto con datos reales del mercado: tasación gratuita, difusión profesional y acompañamiento hasta la escritura.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/vender" className="inline-block bg-white hover:bg-rose-50 text-rose-600 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Quiero vender
              </Link>
              <Link href="/tasacion" className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors border border-white/20">
                Tasar mi propiedad gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      <InvestmentMapClient />
    </div>
  );
}
