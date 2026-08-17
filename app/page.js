import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import SuscripcionForm from "@/components/SuscripcionForm";
import TrackedLink from "@/components/TrackedLink";
import { RELEVADAS_PUBLICO } from "@/lib/mercado";
import dynamic from "next/dynamic";
const InvestmentMapClient = dynamic(() => import("@/components/InvestmentMapClient"));
import { getProperties } from "@/lib/properties";

import { canonicalUrl, DEFAULT_OG_IMAGE, TASADOR_PATH } from "@/config";

// Refresca el contenido desde la base cada 5 minutos sin necesidad de redeploy.
export const revalidate = 300;

// El title arranca con la frase exacta de la búsqueda principal
// ("inmobiliaria san martin de los andes", 282 impresiones en 28 días,
// posición ~10). Google le da más peso a lo que está al principio, y ahí es
// donde se juega subir de la posición 10 al top 5.
//
// La description es lo que decide el clic una vez que ya aparecés: repite la
// frase, suma la prueba (años, matrícula, ROI) y recién después el catálogo.
export const metadata = {
  title: "Inmobiliaria en San Martín de los Andes | Catalán Propiedades",
  description: "Inmobiliaria en San Martín de los Andes con +10 años y martillera matriculada. +18% ROI gestionado. Casas, departamentos y lotes en venta y alquiler permanente, con datos reales del mercado.",
  openGraph: {
    title: "Inmobiliaria en San Martín de los Andes | Catalán Propiedades",
    description: "Propiedades en venta y alquiler permanente en San Martín de los Andes, con asesoría local y datos del mercado.",
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
    title: "Inmobiliaria en San Martín de los Andes | Catalán Propiedades",
    description: "Propiedades en venta y alquiler permanente en San Martín de los Andes, con asesoría local.",
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

      {/* Entrada guiada: orienta cada visita hacia el recorrido que necesita. */}
      <section className="border-b border-gray-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto mb-7 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-600">
              Empezá por acá
            </p>
            <h2 className="text-2xl font-black leading-tight text-gray-900 sm:text-3xl">
              ¿Qué querés hacer en San Martín de los Andes?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
              Elegí tu objetivo y te llevamos directo a la información y las herramientas que necesitás.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                event: "home_intent_buy",
                intent: "buy",
                href: "/propiedades",
                number: "01",
                title: "Quiero comprar",
                description: "Propiedades nuevas cada semana. Asesoramiento verificado en cada zona.",
                action: "Explorar propiedades",
              },
              {
                event: "home_intent_sell",
                intent: "sell",
                href: "/vender",
                number: "02",
                title: "Quiero vender o tasar",
                description: "Conocé el valor de tu propiedad y cómo te acompañamos para venderla.",
                action: "Empezar mi tasación",
              },
              {
                event: "home_intent_invest",
                intent: "invest",
                href: "/inversiones",
                number: "03",
                title: "Quiero invertir",
                description: "Rentabilidad verificada: +18% ROI. Análisis por zona con datos reales.",
                action: "Ver oportunidades",
              },
              {
                event: "home_intent_market",
                intent: "market",
                href: "/precio-m2",
                number: "04",
                title: "Quiero conocer el mercado",
                description: "Compará precios por metro cuadrado y entendé mejor cada zona.",
                action: "Ver precios y zonas",
              },
            ].map((option) => (
              <TrackedLink
                key={option.intent}
                event={option.event}
                eventParams={{
                  intent: option.intent,
                  placement: "home_guided_entry",
                  page_path: "/",
                }}
                href={option.href}
                className="group flex min-h-52 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-rose-600">{option.number}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors group-hover:bg-rose-600 group-hover:text-white"
                  >
                    →
                  </span>
                </div>
                <h3 className="text-lg font-black leading-snug text-gray-900">{option.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{option.description}</p>
                <span className="mt-5 text-sm font-bold text-rose-600 group-hover:text-rose-500">
                  {option.action} →
                </span>
              </TrackedLink>
            ))}
          </div>
        </div>
      </section>

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
                Analizamos {RELEVADAS_PUBLICO} propiedades en San Martín de los Andes para ayudarte a comprar, alquilar o invertir con información concreta, no promedios nacionales.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 lg:gap-10 lg:flex-shrink-0">
              {[
                { valor: RELEVADAS_PUBLICO, label: "Propiedades relevadas" },
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

      {/* Herramientas: tasador (vendedores) + simulador de crédito (compradores) */}
      <section className="max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <TrackedLink
            event="tasador_click"
            eventParams={{ source: "home" }}
            href={TASADOR_PATH}
            className="group flex flex-col justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-slate-900 transition-colors hover:bg-slate-800"
          >
            <div>
              <p className="text-rose-400 text-[11px] font-bold tracking-widest uppercase mb-1.5">¿Vendés? · Resultado al instante</p>
              <p className="text-white text-lg font-bold leading-snug mb-1">
                ¿Cuánto vale tu propiedad? Descubrilo con el tasador predictivo
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Estimación inmediata con un modelo entrenado con datos reales de San Martín de los Andes. Sin dejar datos la primera vez.
              </p>
            </div>
            <span className="inline-flex items-center justify-center gap-2 bg-rose-600 group-hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors whitespace-nowrap self-start">
              Tasar al instante
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </TrackedLink>

          <TrackedLink
            event="simulador_click"
            eventParams={{ source: "home" }}
            href="/simulador-credito"
            className="group flex flex-col justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-rose-300 transition-all"
          >
            <div>
              <p className="text-rose-600 text-[11px] font-bold tracking-widest uppercase mb-1.5">¿Comprás? · Crédito hipotecario UVA</p>
              <p className="text-gray-900 text-lg font-bold leading-snug mb-1">
                ¿Cuánto pagarías por mes? Simulá tu crédito en 30 segundos
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Calculá la cuota inicial, el ingreso mínimo que piden los bancos y cuánto necesitás de anticipo. Gratis, sin registrarte.
              </p>
            </div>
            <span className="inline-flex items-center justify-center gap-2 bg-gray-900 group-hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors whitespace-nowrap self-start">
              Simular mi cuota
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </TrackedLink>
        </div>
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
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image
                  src="/trayectoria.jpeg"
                  alt="San Martín de los Andes — Catalán Propiedades"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover" style={{ objectPosition: 'center 65%' }}
                />
              </div>
              {/* La placa se apoya sobre la foto con un borde, no con una
                  sombra grande: la sombra la hacía flotar y competía con la
                  imagen. */}
              <div className="absolute -bottom-6 -right-6 bg-white border border-gray-200 p-6 rounded-2xl hidden md:block">
                <p className="text-gray-900 text-3xl font-bold mb-1">100%</p>
                <p className="text-gray-500 text-xs font-medium">Atención personalizada</p>
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
            {/* Sin emoji decorativo arriba de cada operación: el tipo ya está
                escrito abajo, así que el 🏔️ no agregaba dato, solo ruido. */}
            {[
              {
                tipo: "Lote",
                zona: "Vega Maipú",
                precio: "USD 110.000",
                detalle: "Vendido · 2024",
              },
              {
                tipo: "Lote 600 m² · Caleuche",
                zona: "Paseo de los Músicos",
                precio: "USD 30.000",
                detalle: "Vendido · 2020",
              },
              {
                tipo: "Local comercial a estrenar",
                zona: "Centro",
                precio: "USD 200.000",
                detalle: "Vendido · 2025",
              },
              {
                tipo: "Monoambiente en pozo",
                zona: "Centro",
                precio: "USD 105.000",
                detalle: "Vendido · 2020",
              },
            ].map((op) => (
              <div key={`${op.tipo}-${op.precio}`} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{op.tipo}</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-6">{op.zona}</p>
                <p className="text-xl font-bold text-gray-900 mt-auto">{op.precio}</p>
                <p className="text-xs text-gray-500 mt-1">{op.detalle}</p>
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
