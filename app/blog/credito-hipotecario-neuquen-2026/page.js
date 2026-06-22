import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import { SITE_URL, WA_URL, canonicalUrl } from "@/config";

export const metadata = {
  title: "Crédito hipotecario de Neuquén 2026: cómo construir o refaccionar tu casa | Catalán Propiedades",
  description:
    "Guía completa del crédito hipotecario provincial de Neuquén (plan Neuquén Habita) para construir, ampliar o refaccionar tu vivienda. Requisitos, montos, tasa y cómo inscribirte. Cubre San Martín de los Andes y Villa la Angostura.",
  keywords:
    "credito hipotecario neuquen 2026, neuquen habita, credito vivienda san martin de los andes, ruprovi, credito construccion villa la angostura, credito refaccion neuquen, simulador credito vivienda neuquen",
  openGraph: {
    title: "Crédito hipotecario de Neuquén 2026: la oportunidad para construir tu casa",
    description:
      "Tasa 2%, hasta el 100% de la obra y hasta $150 millones para construir, ampliar o refaccionar. Cómo accede un vecino de San Martín de los Andes o Villa la Angostura.",
    url: canonicalUrl("/blog/credito-hipotecario-neuquen-2026"),
    type: "article",
    publishedTime: "2026-06-22T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [{ url: `${SITE_URL}/hipotecario.jpeg`, width: 1200, height: 630, alt: "Crédito hipotecario de Neuquén 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crédito hipotecario de Neuquén 2026: cómo construir o refaccionar tu casa",
    description:
      "Tasa 2%, hasta el 100% de la obra y hasta $150 millones. Cubre San Martín de los Andes y Villa la Angostura. Requisitos y cómo inscribirte.",
    images: [`${SITE_URL}/hipotecario.jpeg`],
  },
  alternates: {
    canonical: canonicalUrl("/blog/credito-hipotecario-neuquen-2026"),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Crédito hipotecario de Neuquén 2026: cómo construir o refaccionar tu casa",
  description:
    "Guía del crédito hipotecario provincial de Neuquén (plan Neuquén Habita) para construir, ampliar o refaccionar la vivienda única y permanente. Requisitos, montos, tasa y cómo inscribirse. Alcance a San Martín de los Andes y Villa la Angostura.",
  image: `${SITE_URL}/hipotecario.jpeg`,
  datePublished: "2026-06-22",
  dateModified: "2026-06-22",
  author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logoMC.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl("/blog/credito-hipotecario-neuquen-2026") },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿El crédito hipotecario de Neuquén sirve en San Martín de los Andes y Villa la Angostura?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Es un programa provincial (plan Neuquén Habita), así que alcanza a toda la provincia de Neuquén. Tanto San Martín de los Andes (departamento Lácar) como Villa la Angostura (departamento Los Lagos) están dentro de Neuquén, por lo que cualquier vecino que cumpla los requisitos puede inscribirse. Bariloche, en cambio, queda afuera porque pertenece a la provincia de Río Negro.",
      },
    },
    {
      "@type": "Question",
      name: "¿Se puede usar el crédito para comprar una casa ya terminada?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Esta línea está pensada para construir una vivienda nueva, o para ampliar y refaccionar una existente. No financia la compra de una propiedad terminada. Aplica para quien ya tiene un terreno con escritura a su nombre o una casa que quiere mejorar.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto dinero puedo pedir y a qué plazo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para construcción de vivienda nueva, hasta $150.000.000 a un plazo de hasta 240 meses (20 años). Para ampliación o refacción, hasta $75.000.000 a un plazo de hasta 120 meses (10 años). El financiamiento puede cubrir hasta el 100% de la obra y el monto se calcula según los ingresos del grupo familiar.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué tasa tiene y cuánto puede salir la cuota?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La tasa es del 2% TNA, con el capital ajustable por UVI. La cuota no puede superar el 30% de los ingresos del grupo familiar, y se pueden sumar los ingresos de la pareja acreditando el vínculo (matrimonio o unión convivencial).",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuáles son los requisitos principales?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tener entre 18 y 65 años, estar inscripto en el Registro Único Provincial de Vivienda (Ru.Pro.Vi), acreditar residencia mínima de 5 años en la provincia de Neuquén, contar con escritura del inmueble a nombre del solicitante, no estar inscripto en los registros de deudores alimentarios ni de violencia familiar y de género, y no registrar deudas en situación irregular. El ingreso neto familiar máximo es de $6.500.000 (18 Salarios Mínimos Vitales y Móviles).",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo y dónde me inscribo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La inscripción se hace online en el Registro Único Provincial de Vivienda (Ru.Pro.Vi), en ruprovi.viviendaneuquen.gov.ar. Además, podés estimar el monto y la cuota con el simulador oficial en oficinavirtual.viviendaneuquen.gov.ar. Los cupos son limitados (4.000 créditos para toda la provincia) y la inscripción temprana es clave.",
      },
    },
  ],
};

const LINEAS = [
  {
    numero: "01",
    titulo: "Construcción de vivienda nueva",
    descripcion:
      "Para levantar tu casa desde cero sobre un terreno propio. Es la línea más fuerte del programa, tanto en monto como en plazo.",
    puntos: [
      "Monto máximo: hasta $150.000.000.",
      "Plazo: hasta 240 meses (20 años).",
      "Financiamiento de hasta el 100% de la obra.",
    ],
  },
  {
    numero: "02",
    titulo: "Ampliación o refacción",
    descripcion:
      "Para agrandar, terminar o poner en valor una vivienda que ya tenés. Pensada para mejoras concretas sobre tu hogar actual.",
    puntos: [
      "Monto máximo: hasta $75.000.000.",
      "Plazo: hasta 120 meses (10 años).",
      "Financiamiento de hasta el 100% de la obra.",
    ],
  },
];

const REQUISITOS = [
  "Tener entre 18 y 65 años.",
  "Estar inscripto en el Registro Único Provincial de Vivienda (Ru.Pro.Vi).",
  "Acreditar residencia mínima de 5 años en la provincia de Neuquén.",
  "Contar con escritura del inmueble a nombre del solicitante.",
  "No estar inscripto en el Registro Provincial de Deudores Alimentarios Morosos.",
  "No estar inscripto en el Registro Provincial de violencia familiar y de género.",
  "No registrar deudas en situación irregular con entidades financieras.",
  "Destinar el crédito a vivienda única y de ocupación permanente.",
];

const PASOS = [
  "Inscribite en Ru.Pro.Vi en ruprovi.viviendaneuquen.gov.ar.",
  "Simulá tu crédito en el sitio oficial para estimar monto y cuota según tus ingresos.",
  "Reuní la documentación: DNI, escritura del terreno o vivienda, comprobantes de ingresos y constancia de residencia.",
  "Verificá que no figurás en los registros de deudores alimentarios ni de violencia.",
  "Presentá la solicitud por los canales de la ADUS / Vivienda Neuquén.",
];

const WA_CREDITO_URL = `${WA_URL}?text=${encodeURIComponent(
  "Hola Milton, quiero construir mi casa y me interesa ver lotes en San Martín de los Andes o Villa la Angostura. ¿Me ayudás a encontrar el terreno?"
)}`;

export default function CreditoHipotecarioNeuquenPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 [hyphens:none] [overflow-wrap:normal]">

        {/* Header */}
        <header className="mb-10 md:mb-12">
          <p className="text-rose-600 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">Guía de Crédito · 2026</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Crédito hipotecario de Neuquén 2026: cómo construir o refaccionar tu casa
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
            La provincia de Neuquén lanzó una línea de créditos hipotecarios propios para construir, ampliar o refaccionar tu vivienda. Te explico, sin vueltas, cuánto podés pedir, qué requisitos piden y —lo más importante para nosotros— por qué alcanza a San Martín de los Andes y Villa la Angostura.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 border-t border-b border-gray-100 py-4">
            <img src="/Milton.webp" alt="Milton Catalán" className="w-9 h-9 rounded-full object-cover flex-shrink-0" loading="lazy" decoding="async" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Milton Catalán</p>
              <p className="text-xs text-gray-400">Asesor inmobiliario · +10 años en San Martín de los Andes</p>
            </div>
            <span className="ml-auto text-xs text-gray-400 flex-shrink-0">Junio 2026 · 7 min</span>
          </div>
        </header>

        {/* Intro */}
        <section className="mb-12">
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            El Gobierno de la Provincia de Neuquén puso en marcha, dentro del plan <strong className="text-gray-900">Neuquén Habita</strong>, una línea de <strong className="text-gray-900">4.000 créditos hipotecarios</strong> financiados con recursos provinciales —no bancarios— para que las familias neuquinas puedan construir, ampliar o refaccionar su vivienda única y permanente. La gestiona el Ministerio de Infraestructura junto a la Agencia de Desarrollo Urbano Sustentable (ADUS).
          </p>
          <p className="text-gray-600 leading-relaxed">
            Tiene una tasa subsidiada y financiamiento de hasta el 100% de la obra, y está dirigida a quienes tienen un terreno propio o quieren mejorar su casa en la cordillera. Acá va todo lo que necesitás saber para evaluarlo por tu cuenta.
          </p>
        </section>

        {/* Callout: importante */}
        <div className="mb-12 flex gap-3 items-start bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-amber-900 text-sm">Es para construir o refaccionar, no para comprar</p>
            <p className="text-amber-800 text-sm mt-1">
              Esta línea financia obra: construir una vivienda nueva, o ampliar y refaccionar una existente. <strong>No</strong> sirve para comprar una propiedad ya terminada. Está pensada para quien ya tiene un terreno con escritura a su nombre o una casa que quiere mejorar.
            </p>
          </div>
        </div>

        {/* Las dos líneas */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Las dos líneas del programa</h2>
          <p className="text-gray-500 mb-8">El crédito se divide en dos destinos, con montos y plazos distintos.</p>
          <div className="grid grid-cols-1 gap-4">
            {LINEAS.map((linea) => (
              <div key={linea.numero} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <span className="text-rose-600 text-2xl font-black flex-shrink-0 leading-none">{linea.numero}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-gray-900 mb-2 leading-snug">{linea.titulo}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{linea.descripcion}</p>
                    <ul className="space-y-1.5">
                      {linea.puntos.map((p) => (
                        <li key={p} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-rose-500 flex-shrink-0">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Condiciones financieras */}
        <section className="mb-14 bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Condiciones financieras</h2>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <span className="text-rose-500 flex-shrink-0 mt-0.5">•</span>
              <span className="text-gray-600 text-sm leading-relaxed"><strong className="text-gray-900">Tasa:</strong> 2% TNA, con capital ajustable por UVI.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-rose-500 flex-shrink-0 mt-0.5">•</span>
              <span className="text-gray-600 text-sm leading-relaxed"><strong className="text-gray-900">Cuota:</strong> no puede superar el 30% de los ingresos del grupo familiar.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-rose-500 flex-shrink-0 mt-0.5">•</span>
              <span className="text-gray-600 text-sm leading-relaxed"><strong className="text-gray-900">Ingresos:</strong> se pueden sumar los de la pareja acreditando el vínculo (matrimonio o unión convivencial).</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-rose-500 flex-shrink-0 mt-0.5">•</span>
              <span className="text-gray-600 text-sm leading-relaxed"><strong className="text-gray-900">Tope de ingreso:</strong> ingreso neto familiar máximo de $6.500.000 (18 Salarios Mínimos Vitales y Móviles).</span>
            </li>
          </ul>
        </section>

        {/* ¿Cubre SMA y VLA? */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-4">¿Cubre San Martín de los Andes y Villa la Angostura?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong className="text-gray-900">Sí.</strong> Al ser un programa provincial, alcanza a toda la provincia de Neuquén. Y tanto <strong className="text-gray-900">San Martín de los Andes</strong> (departamento Lácar) como <strong className="text-gray-900">Villa la Angostura</strong> (departamento Los Lagos) están dentro de Neuquén. Cualquier vecino de estas localidades que cumpla los requisitos —residencia de 5 años, terreno o vivienda con escritura propia e ingresos dentro del tope— puede inscribirse.
          </p>
          <div className="flex gap-3 items-start bg-white border border-gray-200 rounded-xl px-5 py-4">
            <span className="text-xl flex-shrink-0">📍</span>
            <p className="text-gray-600 text-sm leading-relaxed">
              <strong className="text-gray-900">Ojo con Bariloche:</strong> no entra en este programa, porque pertenece a la provincia de Río Negro. Para esa zona hay que mirar líneas provinciales de Río Negro o créditos nacionales/bancarios.
            </p>
          </div>
        </section>

        {/* Requisitos */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Requisitos para acceder</h2>
          <p className="text-gray-500 mb-6">Estas son las condiciones que pide la provincia para solicitar el crédito.</p>
          <ul className="space-y-3">
            {REQUISITOS.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-rose-500 flex-shrink-0 mt-0.5">•</span>
                <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cómo inscribirse */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Cómo inscribirse, paso a paso</h2>
          <p className="text-gray-500 mb-8">El primer paso es online y es gratis. Cuanto antes te inscribas, mejor: los cupos son limitados.</p>
          <ol className="space-y-4">
            {PASOS.map((paso, i) => (
              <li key={paso} className="flex gap-4 items-start">
                <span className="text-rose-600 text-lg font-black flex-shrink-0 leading-none w-7">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-gray-600 text-sm leading-relaxed pt-0.5">{paso}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://ruprovi.viviendaneuquen.gov.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group"
            >
              <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Inscripción oficial</p>
              <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">ruprovi.viviendaneuquen.gov.ar</p>
            </a>
            <a
              href="https://oficinavirtual.viviendaneuquen.gov.ar/web/site/simulador-credito"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group"
            >
              <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Simulador oficial</p>
              <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">Calculá tu cuota y monto</p>
            </a>
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

        {/* Nota */}
        <section className="mb-14 border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nota sobre esta información</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Los datos de este artículo son orientativos y se basan en información pública del programa Neuquén Habita disponible a junio de 2026. Las condiciones, montos, plazos y requisitos pueden cambiar: verificá siempre la información oficial en los sitios de Vivienda Neuquén (Ru.Pro.Vi y simulador) antes de tomar una decisión. Este contenido no constituye asesoramiento financiero ni legal.
          </p>
        </section>

        {/* CTA principal */}
        <section className="mb-12">
          <div className="bg-gray-900 rounded-3xl p-8 sm:p-10 text-center">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3">¿Querés construir tu casa?</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
              Busquemos el lote ideal para tu proyecto
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto mb-7">
              El crédito financia la obra, pero el primer paso es el terreno. Tengo lotes en San Martín de los Andes y la zona. Escribime y buscamos juntos el que mejor se adapte a lo que querés construir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <TrackedLink
                event="whatsapp_click"
                eventParams={{ location: "blog_credito_neuquen_cta" }}
                href={WA_CREDITO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                Consultarle a Milton
              </TrackedLink>
              <Link
                href="/propiedades/lotes"
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                Ver lotes disponibles
              </Link>
            </div>
          </div>
        </section>

        {/* Enlaces útiles internos */}
        <section className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/precio-m2" className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Datos</p>
            <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">Precio del m² por zona</p>
          </Link>
          <Link href="/tasacion" className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Tasación</p>
            <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">Pedí tu tasación gratuita</p>
          </Link>
          <Link href="/inversiones" className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Inversión</p>
            <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">Rentabilidad por tipo de propiedad</p>
          </Link>
        </section>

        {/* Posts relacionados */}
        <section className="border-t border-gray-100 pt-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">También te puede interesar</p>
          <div className="space-y-3">
            <Link href="/blog/creditos-hipotecarios-uva-2026" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/hipotecario.jpeg" alt="Créditos hipotecarios UVA" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Guía de Compra</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  Créditos Hipotecarios UVA: la llave para tu casa propia en la Patagonia
                </p>
              </div>
            </Link>
            <Link href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/hero-montana.jpg" alt="Cuánto cuesta una casa en San Martín de los Andes" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Precios</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  ¿Cuánto cuesta una casa en San Martín de los Andes? (2026)
                </p>
              </div>
            </Link>
          </div>
        </section>

      </article>
    </>
  );
}
