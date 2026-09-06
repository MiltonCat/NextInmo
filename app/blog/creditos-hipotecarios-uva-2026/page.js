import { SITE_URL, canonicalUrl } from "@/config";
import Link from "next/link";
import PodcastPlayer from "@/components/PodcastPlayer";

export const metadata = {
  title: "Créditos hipotecarios UVA 2026: tasas y bancos",
  description: "Compará bancos, tasas referenciales, requisitos y financiación de créditos hipotecarios UVA 2026 para comprar una propiedad en San Martín de los Andes.",
  keywords: "credito hipotecario uva 2026, hipoteca uva argentina, comprar casa san martin andes, credito para propiedad patagonia, banco nacion hipoteca, primera vivienda argentina",
  openGraph: {
    title: "Créditos hipotecarios UVA 2026: tasas, bancos y requisitos",
    description: "Comparativa y guía para financiar una propiedad en San Martín de los Andes con un crédito hipotecario UVA.",
    url: canonicalUrl("/blog/creditos-hipotecarios-uva-2026"),
    type: "article",
    publishedTime: "2026-05-26T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [
      {
        url: `${SITE_URL}/hipotecario.jpeg`,
        width: 1200,
        height: 630,
        alt: "Créditos Hipotecarios UVA 2026 — Catalán Propiedades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Créditos hipotecarios UVA 2026: tasas y bancos",
    description: "Compará bancos, requisitos y financiación para comprar con un crédito hipotecario UVA.",
    images: [`${SITE_URL}/hipotecario.jpeg`],
  },
  alternates: {
    canonical: canonicalUrl("/blog/creditos-hipotecarios-uva-2026"),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Créditos Hipotecarios UVA: La Llave para tu Casa Propia en la Patagonia",
  description: "Descubrí cómo los créditos hipotecarios UVA te abren la puerta a comprar una propiedad en San Martín de los Andes. Requisitos, bancos, simulaciones y guía paso a paso.",
  image: `${SITE_URL}/hipotecario.jpeg`,
  datePublished: "2026-05-26",
  dateModified: "2026-05-26",
  author: {
    "@type": "Person",
    name: "Milton Catalán",
    url: canonicalUrl("/nosotros"),
  },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo-catalan.png`,
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": canonicalUrl("/blog/creditos-hipotecarios-uva-2026"),
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Puedo usar el crédito UVA para una segunda vivienda o inversión?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depende del banco. El Banco Nación y el Hipotecario priorizan la vivienda única y permanente. La banca privada (Santander, Galicia, BBVA) suele ser más flexible con segunda vivienda o propiedad de inversión, aunque a tasas algo más altas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué pasa si el sueldo no acompaña la suba de la cuota?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El BCRA tiene regulaciones que limitan el impacto: si la cuota supera el 35% de los ingresos del deudor durante un período sostenido, los bancos deben ofrecer opciones de extensión de plazo para amortiguar el salto.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto tiempo tarda el proceso desde que aplico hasta que escrituro?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En promedio, entre 60 y 90 días. La preaprobación puede salir en 1-2 semanas. La tasación y aprobación definitiva toman 3-4 semanas. La coordinación de escritura suma otras 2-4 semanas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo pagar el crédito antes del plazo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, la cancelación anticipada es un derecho del deudor. Algunos bancos cobran una comisión menor en los primeros años, pero en general podés hacer pagos extra a capital cuando recibís ingresos extraordinarios.",
      },
    },
    {
      "@type": "Question",
      name: "¿Las propiedades de San Martín de los Andes son elegibles para crédito UVA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, siempre que la propiedad tenga título limpio y escritura en regla. El banco tasa la propiedad antes de aprobar el crédito. Se recomienda trabajar con un asesor local que conozca el estado registral de cada unidad antes de firmar el boleto.",
      },
    },
  ],
};

export default function CreditosHipotecariosUVAPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 [hyphens:none] [overflow-wrap:normal]">

      {/* Header */}
      <header className="mb-10 md:mb-12">
        <p className="text-rose-600 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
          Guía de Compra
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
          Créditos Hipotecarios UVA: La Llave para tu Casa Propia en la Patagonia
        </h1>
        <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
          El crédito hipotecario volvió a Argentina con fuerza. Si siempre soñaste con una propiedad
          en San Martín de los Andes pero creías que estaba fuera de tu alcance, esta guía es para vos.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
          <time dateTime="2026-05-26">Mayo 2026</time>
          <span>·</span>
          <span>9 min de lectura</span>
        </div>

        {/* Autor */}
        <div className="flex items-center gap-3 sm:gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <img
            src="/Milton.webp"
            alt="Milton Catalán"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-rose-200 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-bold text-gray-900">Escrito por Milton Catalán</p>
            <p className="text-xs text-gray-600">Asesor inmobiliario con +10 años de experiencia en San Martín de los Andes</p>
          </div>
        </div>
      </header>

      {/* Versión escuchada — no se muestra si el post no tiene audio registrado */}
      <PodcastPlayer slug="creditos-hipotecarios-uva-2026" />

      {/* Contenido */}
      <div className="prose prose-base sm:prose-lg max-w-none [hyphens:none] [overflow-wrap:normal]">

        {/* Introducción */}
        <section className="mb-12">
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Durante años, la ausencia de crédito hipotecario en Argentina obligó a muchas familias a
            postergar indefinidamente el sueño de la casa propia. Hoy ese escenario cambió.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            Los créditos UVA están activos, los bancos están prestando, y el mercado inmobiliario
            de San Martín de los Andes ofrece propiedades accesibles para quienes dan ese primer paso
            con financiamiento. Esta guía te explica todo lo que necesitás saber para aprovecharlo.
          </p>
        </section>

        {/* Qué es UVA */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            ¿Qué es un Crédito Hipotecario UVA?
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            UVA significa <strong>Unidad de Valor Adquisitivo</strong>. Es una unidad de medida creada
            por el Banco Central de la República Argentina (BCRA) que se actualiza diariamente según
            el índice de precios (CER), reflejando la evolución del costo de construcción.
          </p>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            En términos simples: tomás un préstamo en UVAs, no en pesos fijos. Tus cuotas arrancan
            más bajas que en un crédito tradicional y se ajustan con la inflación, igual que
            (en teoría) lo hacen tus ingresos con el tiempo.
          </p>

          <div className="bg-rose-50 border-l-4 border-rose-600 p-6 my-8">
            <p className="text-rose-900 font-semibold mb-2">Concepto Clave</p>
            <p className="text-rose-800">
              La lógica del UVA es que tu <strong>esfuerzo de pago se mantiene estable</strong> en
              relación a tus ingresos: si la economía sube, tus sueldos suben y también la cuota,
              pero la proporción no debería cambiar drásticamente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">Crédito Tradicional (Tasa Fija)</p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✓ Cuota fija en pesos</li>
                <li>✓ Certeza del valor nominal</li>
                <li className="text-gray-500">— Tasa más alta (30-50% anual)</li>
                <li className="text-gray-500">— Cuota inicial muy elevada</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-600 uppercase tracking-wide mb-3">Crédito UVA</p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✓ Tasa baja (3.5% – 8% anual + UVA)</li>
                <li>✓ Cuota inicial más accesible</li>
                <li>✓ Plazos de hasta 30 años</li>
                <li>✓ Cuota ajusta con inflación (como el sueldo)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Bancos */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            ¿Qué Bancos Ofrecen Créditos UVA en 2026?
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            Hoy prácticamente toda la banca pública y privada tiene líneas activas. Estos son los
            principales actores con productos vigentes:
          </p>

          <div className="bg-gray-900 text-white rounded-2xl p-6 sm:p-8 my-8">
            <h3 className="text-lg sm:text-xl font-bold mb-6">Comparativa de Líneas UVA Activas</h3>
            <div className="space-y-4">
              <div className="flex flex-col items-start gap-2 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Banco Nación</p>
                  <p className="text-gray-400 text-sm">Casa Propia / ProCreAr</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-green-400 font-bold">3.5% + UVA</p>
                  <p className="text-gray-400 text-sm">Hasta 30 años</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Banco Hipotecario</p>
                  <p className="text-gray-400 text-sm">Primera Vivienda</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-blue-400 font-bold">4.5% + UVA</p>
                  <p className="text-gray-400 text-sm">Hasta 30 años</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Santander / Galicia / BBVA</p>
                  <p className="text-gray-400 text-sm">Banca privada</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-purple-400 font-bold">5% – 7% + UVA</p>
                  <p className="text-gray-400 text-sm">Hasta 20-25 años</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Bancos Provinciales</p>
                  <p className="text-gray-400 text-sm">Banco Neuquén, Banco Provincia, etc.</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-rose-400 font-bold">4% – 6% + UVA</p>
                  <p className="text-gray-400 text-sm">Hasta 20 años</p>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-6">
              * Tasas referenciales a mayo 2026. Cada banco actualiza condiciones periódicamente.
            </p>
          </div>
        </section>

        {/* Requisitos */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            ¿Quién Puede Acceder? Requisitos Generales
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            Los bancos analizan tres variables principales antes de aprobar un crédito hipotecario UVA:
          </p>

          <div className="grid md:grid-cols-3 gap-6 my-8">
            <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200">
              <p className="text-4xl mb-3">💼</p>
              <p className="font-bold text-gray-900 mb-2">Ingresos Demostrables</p>
              <p className="text-sm text-gray-600">La cuota no debe superar el 25-30% de tus ingresos netos. Relación en dependencia o monotributo activo.</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <p className="text-4xl mb-3">🏦</p>
              <p className="font-bold text-gray-900 mb-2">Historial Crediticio</p>
              <p className="text-sm text-gray-600">Sin deudas impagas en el Veraz/BCRA. Situación 1 en el sistema financiero.</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <p className="text-4xl mb-3">💰</p>
              <p className="font-bold text-gray-900 mb-2">Aporte Propio</p>
              <p className="text-sm text-gray-600">Los bancos financian hasta el 75-80% del valor de la propiedad. El 20-25% restante lo ponés vos.</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 my-8 border border-blue-200">
            <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-4">Documentación típica requerida</h3>
            <div className="grid md:grid-cols-2 gap-3 text-blue-900 text-sm">
              <div className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0">✓</span> DNI del solicitante (y cónyuge si aplica)</div>
              <div className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0">✓</span> Últimos 3 recibos de sueldo o declaraciones AFIP</div>
              <div className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0">✓</span> Extractos bancarios de los últimos 6 meses</div>
              <div className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0">✓</span> Constancia de CUIL/CUIT activo</div>
              <div className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0">✓</span> Tasación de la propiedad (la hace el banco)</div>
              <div className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0">✓</span> Título de propiedad del vendedor</div>
            </div>
          </div>
        </section>

        {/* Ejemplo práctico */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Ejemplo Real: Comprando en San Martín de los Andes con UVA
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            Para que los números dejen de ser abstractos, veamos un caso concreto con una propiedad
            real del mercado local de San Martín de los Andes:
          </p>

          <div className="bg-gray-900 text-white rounded-2xl p-6 sm:p-8 my-8">
            <p className="text-gray-400 text-sm uppercase tracking-wide mb-4">Ejemplo orientativo — Mayo 2026</p>
            <h3 className="text-lg sm:text-xl font-bold mb-6 leading-snug">Departamento 2 ambientes — San Martín de los Andes</h3>
            <div className="space-y-3 text-base">
              <div className="flex flex-col items-start gap-1 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-300">Valor de la propiedad</span>
                <span className="font-bold text-white">USD 95.000</span>
              </div>
              <div className="flex flex-col items-start gap-1 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-300">Aporte propio (25%)</span>
                <span className="font-bold text-yellow-400">USD 23.750</span>
              </div>
              <div className="flex flex-col items-start gap-1 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-300">Monto del crédito (75%)</span>
                <span className="font-bold text-green-400">USD 71.250</span>
              </div>
              <div className="flex flex-col items-start gap-1 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-300">Plazo</span>
                <span className="font-bold text-white">20 años</span>
              </div>
              <div className="flex flex-col items-start gap-1 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-300">Tasa (referencial)</span>
                <span className="font-bold text-white">4.5% + UVA</span>
              </div>
              <div className="flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-300 font-semibold">Cuota inicial estimada</span>
                <span className="text-xl sm:text-2xl font-bold text-rose-400">~$850.000 ARS / mes</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-6">
              * Valores orientativos. El monto exacto depende del tipo de cambio vigente, banco y condiciones actualizadas. Consultá con tu banco o con nosotros.
            </p>
          </div>

          <div className="bg-rose-50 border-l-4 border-rose-600 p-6 my-8">
            <p className="text-rose-900 font-semibold mb-2">¿Por qué tiene sentido hoy?</p>
            <p className="text-rose-800">
              Una propiedad en SMA en alquiler temporario puede generar <strong>USD 1.200–1.800 por mes</strong>
              en temporada. Eso puede cubrir la cuota del crédito y generar rentabilidad neta desde el
              primer año, convirtiendo el crédito en una herramienta de acceso que el activo mismo financia.
            </p>
          </div>
        </section>

        {/* Paso a paso */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Guía Paso a Paso para Obtener tu Crédito UVA
          </h2>

          <div className="space-y-6 my-8">
            <div className="flex gap-5 items-start">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 mt-1">1</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Ordená tu situación financiera</h3>
                <p className="text-gray-700">Verificá tu historial en el Veraz y en el BCRA. Cancelá deudas pendientes si las tenés. Confirmá que tu CUIL/CUIT esté activo y sin irregularidades.</p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 mt-1">2</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Simulá en varios bancos</h3>
                <p className="text-gray-700">Usá las simuladoras online del Banco Nación, Hipotecario y tu banco privado. Compará cuota inicial, plazo y comisiones. No te quedés con la primera opción.</p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 mt-1">3</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Pedí la preaprobación</h3>
                <p className="text-gray-700">Antes de buscar propiedad, solicitá una preaprobación de crédito. Te dará un límite real de cuánto podés pedir y te posicionará mejor frente a los vendedores.</p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 mt-1">4</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Buscá la propiedad con un asesor</h3>
                <p className="text-gray-700">Trabajar con un asesor inmobiliario local es clave. En SMA hay particularidades regulatorias (zonas, restricciones de construcción) que conviene conocer antes de comprometerse.</p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 mt-1">5</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Boleto, tasación y escritura</h3>
                <p className="text-gray-700">Una vez elegida la propiedad, firmás el boleto de compraventa con seña. El banco hace la tasación oficial. Si aprueba, se coordina la escritura con el escribano donde se liquida el crédito.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            4 Claves para Calificar con Éxito
          </h2>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-8">
            <p className="text-yellow-900 font-semibold mb-4">Consejos prácticos antes de presentarte al banco</p>
            <ul className="space-y-3 text-yellow-800">
              <li><strong>Blanqueá tus ingresos:</strong> Si cobrás en negro parcialmente, hablá con tu contador. Los bancos solo consideran ingresos demostrables.</li>
              <li><strong>Sumate como cotitular:</strong> Dos ingresos suman para la capacidad de endeudamiento. Cónyuge, hijo o familiar puede sumarse al crédito.</li>
              <li><strong>No saques más créditos antes:</strong> Cualquier financiamiento nuevo (tarjeta, préstamo personal) reduce tu capacidad hipotecaria.</li>
              <li><strong>Elegí propiedades con título saneado:</strong> El banco no otorga el crédito si la propiedad tiene problemas registrales. En SMA es fundamental verificarlo antes.</li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl p-6 sm:p-8 my-12 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 leading-tight">
            ¿Querés saber si calificás para comprar en San Martín de los Andes?
          </h3>
          <p className="text-rose-100 mb-6">
            Te ayudamos a entender qué propiedades entran dentro de tu presupuesto con crédito UVA,
            qué banco conviene según tu perfil y cómo avanzar sin perder tiempo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contacto"
              className="inline-block bg-white text-rose-600 font-bold px-5 py-4 sm:px-8 rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
            >
              Consultar sin compromiso →
            </a>
            <Link
              href="/propiedades"
              className="inline-block bg-rose-700 text-white font-bold px-5 py-4 sm:px-8 rounded-xl hover:bg-rose-800 transition-colors shadow-lg border border-rose-500"
            >
              Ver propiedades disponibles
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <section className="mb-12 bg-gray-50 rounded-2xl p-5 sm:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                ¿Puedo usar el crédito UVA para una segunda vivienda o inversión?
              </h3>
              <p className="text-gray-700">
                Depende del banco. El Banco Nación y el Hipotecario priorizan la vivienda única y
                permanente. La banca privada (Santander, Galicia, BBVA) suele ser más flexible con
                segunda vivienda o propiedad de inversión, aunque a tasas algo más altas.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                ¿Qué pasa si el sueldo no acompaña la suba de la cuota?
              </h3>
              <p className="text-gray-700">
                El BCRA tiene regulaciones que limitan el impacto: si la cuota supera el 35% de los
                ingresos del deudor durante un período sostenido, los bancos deben ofrecer opciones de
                extensión de plazo para amortiguar el salto. Además, en propiedades de alquiler,
                la renta suele ajustarse por inflación en paralelo con la cuota.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                ¿Cuánto tiempo tarda el proceso desde que aplico hasta que escrituro?
              </h3>
              <p className="text-gray-700">
                En promedio, entre 60 y 90 días. La preaprobación puede salir en 1-2 semanas.
                La tasación y aprobación definitiva toman 3-4 semanas. La coordinación de escritura
                con vendedor, escribano y banco suma otras 2-4 semanas.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                ¿Puedo pagar el crédito antes del plazo?
              </h3>
              <p className="text-gray-700">
                Sí, la cancelación anticipada es un derecho del deudor. Algunos bancos cobran una
                comisión menor en los primeros años, pero en general podés hacer pagos extra a capital
                cuando recibís ingresos extraordinarios (aguinaldo, bonos, alquileres acumulados).
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                ¿Las propiedades de San Martín de los Andes son elegibles para crédito UVA?
              </h3>
              <p className="text-gray-700">
                Sí, siempre que la propiedad tenga título limpio y escritura en regla. El banco
                tasa la propiedad antes de aprobar el crédito. Te recomendamos trabajar con un
                asesor local que conozca el estado registral de cada unidad antes de firmar el boleto.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl p-6 text-sm text-gray-600 mt-12">
          <p className="font-semibold text-gray-800 mb-2">Nota Informativa</p>
          <p>
            Este artículo tiene fines exclusivamente informativos y educativos. Los valores de tasas,
            cuotas y condiciones son referenciales a mayo 2026 y pueden cambiar según cada entidad
            bancaria. Consultá directamente con tu banco o con un asesor financiero antes de tomar
            cualquier decisión de crédito. Las condiciones de elegibilidad varían según cada institución.
          </p>
        </div>

        {/* Posts relacionados */}
        <section className="not-prose border-t border-gray-100 pt-10 mt-12">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">También te puede interesar</p>
          <div className="space-y-3">
            <a href="/blog/credito-hipotecario-neuquen-2026" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/hipotecario.jpeg" alt="Crédito hipotecario de Neuquén 2026" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Guía de Crédito</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  Crédito hipotecario de Neuquén 2026: cómo construir o refaccionar tu casa
                </p>
              </div>
            </a>
            <a href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/cartel-san-martin-de-los-andes.webp" alt="Cuánto cuesta una casa en San Martín de los Andes" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Precios</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  ¿Cuánto cuesta una casa en San Martín de los Andes? (2026)
                </p>
              </div>
            </a>
            <a href="/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/muelle.jpg" alt="Comprar en San Martín de los Andes desde Buenos Aires" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Guía para Compradores</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  Cómo comprar en San Martín de los Andes desde Buenos Aires
                </p>
              </div>
            </a>
          </div>
        </section>

      </div>
    </article>
    </>
  );
}
