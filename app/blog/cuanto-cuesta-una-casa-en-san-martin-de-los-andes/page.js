import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import { SITE_URL, WA_URL, canonicalUrl, TASADOR_PATH } from "@/config";
import PodcastPlayer from "@/components/PodcastPlayer";

export const metadata = {
  title: "¿Cuánto cuesta una casa en San Martín de los Andes? Precios 2026",
  description:
    "Qué define el precio de una casa en San Martín de los Andes: zona, superficie, estado y vista. Cómo estimarlo con datos reales del m² por zona, por qué el precio publicado no es el valor real y cómo saber el precio justo de una propiedad puntual.",
  keywords:
    "cuanto cuesta una casa en san martin de los andes, precio casas san martin de los andes, valor m2 san martin de los andes, precio propiedades patagonia 2026, comprar casa san martin de los andes precio",
  openGraph: {
    title: "¿Cuánto cuesta una casa en San Martín de los Andes? (2026)",
    description:
      "De qué depende el precio, cómo estimarlo con el valor del m² por zona y cómo saber el precio justo de una casa puntual. Sin números inventados.",
    url: canonicalUrl("/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes"),
    type: "article",
    publishedTime: "2026-06-16T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [{ url: `${SITE_URL}/cartel-san-martin-de-los-andes.webp`, width: 1024, height: 683, alt: "Cartel de San Martín de los Andes en la costanera del lago Lácar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Cuánto cuesta una casa en San Martín de los Andes? (2026)",
    description:
      "De qué depende el precio, cómo estimarlo con datos reales del m² por zona y cómo saber el precio justo de una casa.",
    images: [`${SITE_URL}/cartel-san-martin-de-los-andes.webp`],
  },
  alternates: {
    canonical: canonicalUrl("/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes"),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "¿Cuánto cuesta una casa en San Martín de los Andes? (2026)",
  description:
    "Qué define el precio de una casa en San Martín de los Andes y cómo estimarlo con datos reales del valor del m² por zona, en vez de copiar el precio publicado.",
  image: `${SITE_URL}/cartel-san-martin-de-los-andes.webp`,
  datePublished: "2026-06-16",
  dateModified: "2026-06-16",
  author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logoMC.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl("/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes") },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta una casa promedio en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No existe un 'precio promedio' que sirva, porque el valor depende sobre todo de la zona y de los metros cuadrados. Una casa céntrica con vista al lago y una en un loteo más alejado pueden diferir varias veces en precio aunque tengan los mismos metros. La forma honesta de estimarlo es mirar el valor del m² por zona (en la sección Precio del m² de la web) y multiplicarlo por la superficie, o usar el tasador para un número afinado a una propiedad concreta.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué zona es la más cara y cuál la más accesible?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Como regla general, el centro, la costanera y las zonas cercanas al lago son lo más caro: concentran demanda, servicios y vista. Los loteos y barrios en expansión más alejados del centro suelen ser más accesibles por m², aunque hay que considerar el estado de los accesos en invierno. Los valores cambian seguido, así que conviene mirar el dato actualizado por zona antes que guiarse por una idea fija.",
      },
    },
    {
      "@type": "Question",
      name: "¿Los precios de las casas están en dólares o en pesos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Las operaciones de compraventa de inmuebles en San Martín de los Andes, como en casi toda Argentina, se publican y se cierran en dólares. El alquiler permanente, en cambio, se maneja en pesos. Por eso, cuando se habla del precio de una casa para comprar, se habla en USD.",
      },
    },
    {
      "@type": "Question",
      name: "¿El precio publicado es el precio real de la casa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No necesariamente. El precio de publicación es lo que el vendedor pretende, y suele estar por encima del valor real de mercado. El valor real es lo que un comprador efectivamente paga. Por eso muchas propiedades quedan meses sin moverse: arrancaron sobrevaluadas. Para saber el valor real conviene apoyarse en datos del mercado, no en un único aviso.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo sé el precio justo de una casa puntual?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Combiná dos cosas: el valor del m² de la zona (como referencia general) y una estimación afinada a esa propiedad con el tasador, que considera superficie, tipo, ubicación y estado. Y sumá el ojo de un asesor local, que ve lo que los datos no muestran: la vista real, el estado fino, el ruido, el acceso. Nunca te guíes solo por el precio del aviso del vecino.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto hay que presupuestar además del precio de la casa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Además del precio, el comprador afronta los gastos de la operación: comisión inmobiliaria, impuesto de sellos, honorarios del escribano y gastos administrativos. Como orientación general, conviene presupuestar entre un 6% y un 10% adicional sobre el valor de la propiedad. Los porcentajes exactos varían según la operación y se confirman con el escribano antes de cerrar.",
      },
    },
  ],
};

const FACTORES = [
  {
    t: "Ubicación y barrio",
    d: "Es lo que más mueve el precio, lejos. La cercanía al centro, al lago y a los servicios pesa más que casi cualquier característica de la casa. La misma casa cambia de valor según en qué cuadra esté.",
  },
  {
    t: "Superficie (casa y terreno)",
    d: "No solo los m² cubiertos de la casa, también los del lote. Un buen terreno suma muchísimo, sobre todo en zonas donde la tierra escasea.",
  },
  {
    t: "Estado y antigüedad",
    d: "Una casa lista para entrar a vivir vale más que una para refaccionar. La antigüedad, el mantenimiento y la calidad de la construcción ajustan el número para arriba o para abajo.",
  },
  {
    t: "Vista, orientación y extras",
    d: "Vista al lago o a la montaña, buena orientación al sol, parque, cochera y calefacción eficiente suman valor real. En la Patagonia, el sol y el reparo del viento importan.",
  },
];

const WA_CASA_URL = `${WA_URL}?text=${encodeURIComponent(
  "Hola Milton, quiero saber cuánto puede valer una casa en San Martín de los Andes. ¿Me ayudás?"
)}`;

export default function CuantoCuestaUnaCasaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 [hyphens:none] [overflow-wrap:normal]">

        {/* Header */}
        <header className="mb-10 md:mb-12">
          <p className="text-rose-600 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">Precios · 2026</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            ¿Cuánto cuesta una casa en San Martín de los Andes?
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
            Es la primera pregunta de todos. Y la respuesta honesta es: depende. No por evasiva, sino porque el precio de una casa acá lo definen unos pocos factores muy concretos. Te muestro cuáles son y cómo estimar el valor con datos reales, sin tirarte un número al azar.
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

        {/* Versión escuchada — no se muestra si el post no tiene audio registrado */}
        <PodcastPlayer slug="cuanto-cuesta-una-casa-en-san-martin-de-los-andes" />

        {/* Intro */}
        <section className="mb-12">
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Cualquiera que te tire un número redondo —“una casa acá sale tanto”— te está vendiendo humo. <strong className="text-gray-900">No hay un precio único</strong> de “casa en San Martín de los Andes”: una casa céntrica con vista al lago y una en un loteo más alejado pueden valer varias veces distinto, aunque tengan los mismos metros.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Lo que sí se puede hacer —y es lo serio— es entender <strong className="text-gray-900">de qué depende</strong> el precio y estimarlo con el valor real del m² de cada zona. Eso es lo que vas a poder hacer vos mismo al terminar de leer.
          </p>
        </section>

        {/* Factores */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-6">De qué depende el precio de una casa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FACTORES.map((item) => (
              <div key={item.t} className="border border-gray-200 rounded-2xl p-5">
                <p className="font-bold text-gray-900 text-sm mb-1.5">{item.t}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo estimarlo */}
        <section className="mb-14 bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Cómo estimar el precio (la cuenta simple)</h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            El precio de una casa arranca de una cuenta básica que cualquiera puede hacer:
          </p>
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-5 mb-5 text-center">
            <p className="text-gray-900 font-bold text-base sm:text-lg leading-snug">
              Precio estimado ≈ m² de la casa × valor del m² de la zona
            </p>
            <p className="text-gray-400 text-xs mt-2">(y después se ajusta por estado, terreno, vista y extras)</p>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            La pieza que falta es <strong className="text-gray-900">el valor del m² de cada zona</strong>, que cambia seguido y es distinto en cada barrio. Por eso no te lo escribo acá congelado en un número que mañana queda viejo: lo tenés <strong className="text-gray-900">actualizado y por zona</strong> en la sección de precio del m².
          </p>
          <Link
            href="/precio-m2"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Ver el precio del m² por zona
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </section>

        {/* Zonas */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Cómo cambia el precio según la zona</h2>
          <p className="text-gray-500 mb-6">A grandes rasgos, sin casarse con un número (los valores exactos por zona están en la sección de precio del m²):</p>
          <ul className="space-y-3">
            {[
              { z: "Centro, costanera y cercanía al lago", d: "Lo más caro. Concentran demanda, servicios a mano y vista. Es donde el m² vale más." },
              { z: "Barrios residenciales consolidados", d: "Valor medio-alto. Tranquilidad y buenos servicios, sin el premium total del centro." },
              { z: "Loteos y zonas en expansión", d: "Lo más accesible por m². Buena puerta de entrada, pero mirá bien los accesos y servicios, sobre todo en invierno." },
            ].map((item) => (
              <li key={item.z} className="flex gap-3 items-start border border-gray-200 rounded-2xl p-5">
                <span className="text-rose-500 flex-shrink-0 mt-0.5 font-black">•</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{item.z}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-gray-600 text-sm leading-relaxed mt-5">
            Si todavía estás definiendo en qué barrio te conviene, la <Link href="/blog/donde-vivir-san-martin-de-los-andes" className="text-rose-600 font-semibold hover:underline">guía por barrios</Link> te ayuda a cruzar precio con estilo de vida.
          </p>
        </section>

        {/* Callout tasador */}
        <div className="mb-14 flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">🎯</span>
          <div>
            <p className="font-bold text-blue-900 text-sm">¿Querés el número de una casa concreta, no de “la zona”?</p>
            <p className="text-blue-700 text-sm mt-1">
              El{" "}
              <TrackedLink
                event="tasador_click"
                eventParams={{ location: "blog_cuanto_cuesta_casa" }}
                href={TASADOR_PATH}
                className="font-semibold underline underline-offset-2 hover:text-blue-900"
              >
                tasador
              </TrackedLink>{" "}
              estima el valor de una propiedad puntual con sus datos (superficie, tipo, ubicación, estado) y te da un valor más un rango, al instante y gratis.
            </p>
          </div>
        </div>

        {/* Precio publicado vs real */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Ojo: el precio publicado no es el valor real</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Es el error más común. El precio de un aviso es lo que el vendedor <em>pretende</em>, no lo que la casa <em>vale</em>. Entre esos dos números suele haber una diferencia grande, y los portales están llenos de propiedades que llevan meses dando vueltas justamente porque arrancaron por encima de mercado.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Por eso, tanto si vas a comprar como a vender, conviene apoyarse en datos del mercado y no en un único aviso. Lo cuento en detalle en{" "}
            <Link href="/blog/como-tasamos-tu-propiedad-con-datos" className="text-rose-600 font-semibold hover:underline">cómo tasamos una propiedad con datos</Link>.
          </p>
        </section>

        {/* Gastos extra */}
        <section className="mb-14 border border-gray-100 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">No te olvides de los gastos de la operación</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            El precio de la casa no es el costo total. A eso hay que sumarle la comisión, el impuesto de sellos, el escribano y los gastos administrativos. Como orientación, presupuestá entre un <strong className="text-gray-900">6% y un 10% adicional</strong> sobre el valor de la propiedad. El detalle está en la{" "}
            <Link href="/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires" className="text-rose-600 font-semibold hover:underline">guía de compra paso a paso</Link>.
          </p>
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nota sobre los precios</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Los rangos y referencias de esta guía son orientativos y se basan en el comportamiento general del mercado de San Martín de los Andes. Los valores del m² cambian con el tiempo y según cada zona; consultá siempre el dato actualizado y, para una operación concreta, una estimación afinada a la propiedad. Esta guía no reemplaza una tasación profesional certificada.
          </p>
        </section>

        {/* CTA principal */}
        <section className="mb-12">
          <div className="bg-gray-900 rounded-3xl p-8 sm:p-10 text-center">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3">Del rango al número exacto</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
              ¿Querés saber cuánto vale una casa en concreto?
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto mb-7">
              Probá el tasador para una estimación al instante, o escribime y lo vemos juntos con datos reales del mercado. Las dos cosas son gratis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <TrackedLink
                event="tasador_click"
                eventParams={{ location: "blog_cuanto_cuesta_casa_cta" }}
                href={TASADOR_PATH}
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                Tasar una propiedad al instante
              </TrackedLink>
              <TrackedLink
                event="whatsapp_click"
                eventParams={{ location: "blog_cuanto_cuesta_casa_cta" }}
                href={WA_CASA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                Consultarle a Milton
              </TrackedLink>
            </div>
          </div>
        </section>

        {/* Enlaces útiles internos */}
        <section className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/precio-m2" className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Datos</p>
            <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">Precio del m² por zona</p>
          </Link>
          <Link href="/propiedades/casas" className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Propiedades</p>
            <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">Casas en venta en SMA</p>
          </Link>
          <Link href="/tasacion" className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Tasación</p>
            <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">Pedí tu tasación gratuita</p>
          </Link>
        </section>

        {/* Posts relacionados */}
        <section className="border-t border-gray-100 pt-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">También te puede interesar</p>
          <div className="space-y-3">
            <Link href="/blog/como-tasamos-tu-propiedad-con-datos" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/portada.jpg" alt="Cómo tasamos con datos" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Tasación con Datos</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  Cómo tasamos tu propiedad con datos (y por qué te damos un rango)
                </p>
              </div>
            </Link>
            <Link href="/blog/donde-vivir-san-martin-de-los-andes" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/sanmartin.jpeg" alt="Dónde vivir en San Martín de los Andes" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Guía de Barrios</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  ¿Dónde vivir en San Martín de los Andes? Guía por barrios 2026
                </p>
              </div>
            </Link>
          </div>
        </section>

      </article>
    </>
  );
}
