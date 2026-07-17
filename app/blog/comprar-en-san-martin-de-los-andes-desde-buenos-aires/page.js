import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import { SITE_URL, WA_URL, canonicalUrl } from "@/config";

export const metadata = {
  title: "Cómo comprar una propiedad en San Martín de los Andes desde Buenos Aires | Catalán Propiedades",
  description:
    "Guía paso a paso para comprar una casa, departamento o lote en San Martín de los Andes viviendo en Buenos Aires: cuántas veces viajar, gastos reales de la operación, cómo transferir el dinero en dólares y cómo evitar estafas.",
  keywords:
    "comprar propiedad san martin de los andes desde buenos aires, comprar casa san martin de los andes a distancia, invertir san martin de los andes, gastos escrituracion neuquen, comprar departamento patagonia desde caba",
  openGraph: {
    title: "Cómo comprar en San Martín de los Andes desde Buenos Aires (guía paso a paso)",
    description:
      "Cuántas veces viajar, gastos reales de la operación, cómo transferir el dinero y cómo evitar estafas al comprar a distancia en la Patagonia.",
    url: canonicalUrl("/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires"),
    type: "article",
    publishedTime: "2026-06-12T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [{ url: `${SITE_URL}/muelle.jpg`, width: 1200, height: 630, alt: "Comprar una propiedad en San Martín de los Andes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo comprar en San Martín de los Andes desde Buenos Aires",
    description:
      "Guía paso a paso: cuántas veces viajar, gastos reales, cómo transferir el dinero y cómo evitar estafas al comprar a distancia.",
    images: [`${SITE_URL}/muelle.jpg`],
  },
  alternates: {
    canonical: canonicalUrl("/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires"),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Cómo comprar una propiedad en San Martín de los Andes desde Buenos Aires",
  description:
    "Guía paso a paso para comprar una propiedad en San Martín de los Andes viviendo en otra provincia: cuántas veces viajar, gastos de la operación, cómo transferir el dinero y cómo evitar estafas.",
  image: `${SITE_URL}/muelle.jpg`,
  datePublished: "2026-06-12",
  dateModified: "2026-06-12",
  author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logoMC.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl("/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires") },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Se puede comprar una propiedad en San Martín de los Andes sin viajar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Casi todo el proceso —búsqueda, videollamadas, preselección, verificación legal y reserva— se hace de forma remota. La mayoría de los compradores de otra provincia viaja una sola vez para conocer en persona las dos o tres propiedades finalistas antes de reservar. La escritura puede hacerse presencial o mediante un poder, así que técnicamente se puede comprar sin viajar, aunque recomendamos al menos una visita.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuántas veces tengo que viajar a San Martín de los Andes para comprar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con una buena preselección remota, un solo viaje bien organizado suele alcanzar. En 2 o 3 días se pueden recorrer las propiedades finalistas, conocer los barrios en persona y dejar una reserva. La escritura, que ocurre semanas después, puede coordinarse en un segundo viaje o resolverse con un poder para no tener que volver.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué gastos tiene comprar una propiedad además del precio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Además del precio de la propiedad, el comprador suele afrontar la comisión inmobiliaria, el impuesto de sellos, los honorarios del escribano y los gastos administrativos (certificados, informe de dominio e inscripción registral). Como orientación, conviene presupuestar entre un 6% y un 10% adicional sobre el valor de la propiedad. Los porcentajes exactos varían según la operación y la provincia: confirmá siempre los valores vigentes en Neuquén con tu escribano antes de cerrar.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo se transfiere el dinero de la compra desde Buenos Aires?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Las operaciones inmobiliarias en Argentina se cierran en dólares y el dinero se entrega el día de la escritura, en la escribanía, que actúa como tercero de confianza. Nunca se debe entregar el dinero total antes de escriturar. La seña inicial se instrumenta siempre por escrito (reserva o boleto de compraventa) y, si hay dudas, puede canalizarse a través de la propia escribanía. Coordiná con el escribano la modalidad de pago con anticipación.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo sé que una propiedad no tiene deudas ni problemas legales?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Antes de escriturar, el escribano solicita el informe de dominio y el de inhibiciones en el Registro de la Propiedad de Neuquén, que revelan si la propiedad tiene hipotecas, embargos o restricciones, y verifica que los impuestos y servicios estén al día (libre deuda). También se controla que el título sea perfecto y que los planos estén aprobados. Este paso es innegociable y es la principal garantía del comprador.",
      },
    },
    {
      "@type": "Question",
      name: "¿Se puede escriturar con un poder sin estar presente?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Si no podés viajar para la firma, podés otorgar un poder especial para compra ante un escribano de tu ciudad, designando a alguien de confianza para que firme en tu nombre en San Martín de los Andes. Es una práctica habitual en compras a distancia. Lo importante es que el poder sea específico y que cuentes con asesoramiento profesional en ambas puntas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Conviene comprar en San Martín de los Andes con crédito hipotecario desde otra provincia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Desde 2024 volvieron los créditos hipotecarios UVA en varios bancos, lo que reabrió la posibilidad de comprar financiado incluso desde otra provincia. Hay que considerar que el banco tasa la propiedad y exige requisitos de ingresos y antigüedad. Para una propiedad de inversión o segunda residencia, muchos compradores siguen operando al contado en dólares. Analizá tu caso antes de decidir.",
      },
    },
  ],
};

const PASOS = [
  {
    numero: "01",
    titulo: "Definí qué buscás y para qué",
    descripcion:
      "Antes de mirar propiedades, definí el objetivo: vivienda permanente, segunda residencia o inversión para renta. Cada uno apunta a barrios y tipos de propiedad distintos. Y armá un presupuesto realista que incluya los gastos de la operación, no solo el precio de venta.",
    puntos: [
      "Vivir todo el año → cercanía al centro, hospital y buen internet.",
      "Segunda residencia → entorno y vistas pesan más que los servicios.",
      "Inversión → priorizá rentabilidad y liquidez sobre gusto personal.",
    ],
  },
  {
    numero: "02",
    titulo: "Conocé las zonas sin viajar",
    descripcion:
      "San Martín tiene barrios muy distintos en precio, servicios y acceso en invierno. La mayor parte de esta investigación se hace desde tu casa, con datos reales del mercado local antes de subirte a un avión.",
    puntos: [
      "Estudiá el precio del m² por zona para calibrar tu presupuesto.",
      "Leé la guía de barrios para entender el estilo de vida de cada sector.",
      "Descartá zonas que no encajan antes de viajar — ahorrás días de visita.",
    ],
  },
  {
    numero: "03",
    titulo: "Preselección remota",
    descripcion:
      "Con las zonas claras, se arma una lista corta. Acá un asesor local marca la diferencia: filtra las publicaciones infladas o desactualizadas y te muestra lo que realmente está disponible y bien tasado.",
    puntos: [
      "Pedí videollamada en vivo recorriendo la propiedad, no solo fotos.",
      "Solicitá la documentación básica (título, planos, estado de deudas).",
      "Llegá al viaje con 4 o 5 propiedades finalistas, no con 20.",
    ],
  },
  {
    numero: "04",
    titulo: "El viaje de inspección",
    descripcion:
      "Un solo viaje bien aprovechado suele alcanzar. En 2 o 3 días se recorren las finalistas, se conocen los barrios en persona y se evalúa lo que ninguna foto muestra: el ruido, la luz, el acceso, los vecinos.",
    puntos: [
      "Visitá las propiedades en distintos horarios si podés.",
      "Recorré el barrio a pie: comercios, distancia real al centro y al hospital.",
      "Si es invierno, prestá atención al estado de las calles y el acceso.",
    ],
  },
  {
    numero: "05",
    titulo: "Reserva y seña",
    descripcion:
      "Cuando elegís, se deja una reserva con seña para sacar la propiedad del mercado mientras se avanza. Este paso siempre se instrumenta por escrito: nunca de palabra ni con una transferencia suelta sin respaldo.",
    puntos: [
      "La reserva o boleto fija precio, condiciones y plazos por escrito.",
      "La seña se entrega contra documento firmado, nunca antes.",
      "Ante cualquier duda, la seña puede canalizarse por la escribanía.",
    ],
  },
  {
    numero: "06",
    titulo: "Verificación legal (due diligence)",
    descripcion:
      "Antes de escriturar, el escribano controla que la propiedad esté libre de deudas y problemas legales. Es el paso que más tranquilidad le da al comprador que opera a distancia, y es innegociable.",
    puntos: [
      "Informe de dominio e inhibiciones en el Registro de la Propiedad de Neuquén.",
      "Libre deuda de impuestos y servicios.",
      "Título perfecto y planos aprobados.",
    ],
  },
  {
    numero: "07",
    titulo: "Escritura y entrega del dinero",
    descripcion:
      "La firma ocurre en la escribanía, que actúa como tercero de confianza: el dinero se entrega ahí, contra la firma de la escritura. Si no podés viajar, podés escriturar mediante un poder especial.",
    puntos: [
      "El dinero se entrega el día de la firma, nunca antes.",
      "Si no viajás, otorgás un poder especial para compra ante un escribano.",
      "Te llevás la escritura y la propiedad queda a tu nombre.",
    ],
  },
];

const COSTOS = [
  {
    concepto: "Comisión inmobiliaria",
    detalle: "Honorarios de la inmobiliaria por la gestión de la compra.",
    rango: "Orientativo · confirmar",
  },
  {
    concepto: "Impuesto de sellos",
    detalle: "Tributo provincial sobre la compraventa. Suele repartirse entre las partes.",
    rango: "Varía en Neuquén · confirmar",
  },
  {
    concepto: "Honorarios del escribano",
    detalle: "Por la escritura traslativa de dominio y la gestión registral.",
    rango: "Orientativo · confirmar",
  },
  {
    concepto: "Gastos administrativos",
    detalle: "Certificados, informe de dominio, inscripción registral y aportes.",
    rango: "Menor · variable",
  },
];

function PasoCard({ paso }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <span className="text-rose-600 text-2xl font-black flex-shrink-0 leading-none">{paso.numero}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-gray-900 mb-2 leading-snug">{paso.titulo}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{paso.descripcion}</p>
          <ul className="space-y-1.5">
            {paso.puntos.map((p) => (
              <li key={p} className="text-sm text-gray-600 flex gap-2">
                <span className="text-rose-500 flex-shrink-0">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const WA_COMPRA_URL = `${WA_URL}?text=${encodeURIComponent(
  "Hola Milton, vivo fuera de San Martín de los Andes y me gustaría comprar una propiedad en la zona. ¿Me podés asesorar?"
)}`;

export default function ComprarDesdeBuenosAiresPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 [hyphens:none] [overflow-wrap:normal]">

        {/* Header */}
        <header className="mb-10 md:mb-12">
          <p className="text-rose-600 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">Guía para compradores · 2026</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Cómo comprar en San Martín de los Andes desde Buenos Aires
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
            Te enamoraste de San Martín en unas vacaciones, o querés invertir en la Patagonia, pero vivís a 1.600 km. La buena noticia: comprar a distancia es totalmente posible y seguro si seguís el proceso correcto. Esta es la guía paso a paso.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 border-t border-b border-gray-100 py-4">
            <img src="/Milton.webp" alt="Milton Catalán" className="w-9 h-9 rounded-full object-cover flex-shrink-0" loading="lazy" decoding="async" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Milton Catalán</p>
              <p className="text-xs text-gray-400">Asesor inmobiliario · +10 años en San Martín de los Andes</p>
            </div>
            <span className="ml-auto text-xs text-gray-400 flex-shrink-0">Junio 2026 · 9 min</span>
          </div>
        </header>

        {/* Intro */}
        <section className="mb-12">
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            La mayoría de las personas que compran en San Martín de los Andes <strong className="text-gray-900">no vive acá</strong>. Llegan desde Buenos Aires, Neuquén capital, Córdoba o el exterior, atraídas por el entorno, la calidad de vida o el potencial de inversión de la Patagonia.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Y casi todos arrancan con el mismo miedo: <em>“¿cómo compro algo que está tan lejos sin que me pase nada?”</em>. La respuesta es que se puede, con un proceso ordenado y un asesor local de confianza. Acá te muestro exactamente cómo, sin vueltas.
          </p>
        </section>

        {/* Nota: se puede sin viajar */}
        <div className="mb-12 flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">✈️</span>
          <div>
            <p className="font-bold text-blue-900 text-sm">¿Cuántas veces hay que viajar? Normalmente, una.</p>
            <p className="text-blue-700 text-sm mt-1">
              Con una buena preselección remota, un solo viaje bien organizado suele alcanzar para recorrer las finalistas y reservar. La escritura, semanas después, puede resolverse con un poder para no tener que volver.
            </p>
          </div>
        </div>

        {/* Pasos */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">El proceso, paso a paso</h2>
          <p className="text-gray-500 mb-8">De la idea a la escritura, sin sorpresas. Lo mismo que le explico a cada comprador que me escribe desde otra provincia.</p>
          <div className="grid grid-cols-1 gap-4">
            {PASOS.map((paso) => (
              <PasoCard key={paso.numero} paso={paso} />
            ))}
          </div>
        </section>

        {/* Costos */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Cuánto cuesta comprar (más allá del precio)</h2>
          <p className="text-gray-500 mb-6">
            El precio de la propiedad no es el costo total. Como orientación general, conviene presupuestar entre un <strong className="text-gray-900">6% y un 10% adicional</strong> sobre el valor de la propiedad para cubrir los gastos de la operación.
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-bold text-gray-700">Concepto</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-700 hidden sm:table-cell">Qué es</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-700 whitespace-nowrap">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {COSTOS.map((c, i) => (
                  <tr key={c.concepto} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900 align-top">{c.concepto}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell align-top">{c.detalle}</td>
                    <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap align-top">{c.rango}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 items-start bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Importante:</strong> los porcentajes exactos varían según la operación y la jurisdicción. El impuesto de sellos y los honorarios se confirman con el escribano antes de cerrar. Tomá estos valores como una referencia para presupuestar, no como cifras finales.
            </p>
          </div>
        </section>

        {/* Cómo se mueve el dinero */}
        <section className="mb-14 bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Cómo se transfiere el dinero</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Es la parte que más preocupa cuando comprás a distancia, y la que mejor resuelta está. En Argentina las operaciones inmobiliarias se cierran en dólares y el dinero se entrega <strong className="text-gray-900">el día de la escritura, en la escribanía</strong>, que funciona como tercero de confianza entre comprador y vendedor.
          </p>
          <ul className="space-y-3">
            {[
              "Nunca se entrega el dinero total antes de firmar la escritura.",
              "La seña inicial siempre va contra un documento firmado (reserva o boleto).",
              "Si tenés dudas sobre la seña, puede canalizarse a través de la propia escribanía.",
              "Coordiná con el escribano la modalidad de pago con anticipación.",
            ].map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Evitar estafas */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Cómo evitar estafas al comprar a distancia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { t: "Desconfiá de los precios demasiado bajos", d: "Si una propiedad está muy por debajo del precio del m² de la zona, suele haber un problema: deuda, juicio sucesorio o título imperfecto." },
              { t: "Nunca transfieras sin documento", d: "Toda entrega de dinero, incluida la seña, va contra un papel firmado. Una transferencia suelta sin respaldo es la señal de alarma más clara." },
              { t: "Verificá quién te está vendiendo", d: "Operá con un asesor identificable, con trayectoria y presencia local comprobable. Pedí referencias y operaciones anteriores." },
              { t: "Exigí la verificación legal", d: "El informe de dominio y el libre deuda no son opcionales. Un vendedor serio nunca se opone a que el escribano los pida." },
            ].map((item) => (
              <div key={item.t} className="border border-gray-200 rounded-2xl p-5">
                <p className="font-bold text-gray-900 text-sm mb-1.5">{item.t}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Por qué un asesor local */}
        <section className="mb-14 border border-gray-100 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">Por qué importa un asesor local cuando comprás de lejos</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            Cuando no conocés la ciudad, todo parece igual en una foto. Pero un barrio puede quedar a 40 minutos del hospital, una calle puede ser intransitable en invierno, o una publicación puede llevar dos años dando vueltas con un precio inflado. Eso no se ve desde Buenos Aires.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Mi trabajo es ser tus ojos acá: filtrar lo que no sirve, mostrarte por videollamada lo que sí, y acompañarte en cada paso hasta que la escritura esté a tu nombre. Con datos reales del mercado, no con marketing.
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

        {/* Fuentes / nota */}
        <section className="mb-14 border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nota sobre esta guía</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Esta guía describe el proceso general de compra de inmuebles en San Martín de los Andes, Neuquén, con fines informativos. Los gastos, impuestos y plazos son orientativos y pueden variar según cada operación y la normativa vigente. No reemplaza el asesoramiento de un escribano ni de un profesional matriculado. Antes de cerrar cualquier operación, verificá los valores y requisitos actuales con tu escribano de confianza.
          </p>
        </section>

        {/* CTA principal */}
        <section className="mb-12">
          <div className="bg-gray-900 rounded-3xl p-8 sm:p-10 text-center">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3">¿Comprás desde otra provincia?</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
              Te acompaño en todo el proceso, desde donde estés
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto mb-7">
              Contame qué buscás y armamos juntos una preselección con datos reales del mercado. Sin compromiso, te respondo personalmente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <TrackedLink
                event="whatsapp_click"
                eventParams={{ location: "blog_comprar_desde_bsas" }}
                href={WA_COMPRA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                Escribime por WhatsApp
              </TrackedLink>
              <Link
                href="/propiedades"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                Ver propiedades disponibles
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
          <Link href="/blog/donde-vivir-san-martin-de-los-andes" className="flex flex-col gap-1.5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Guía</p>
            <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-rose-600 transition-colors">¿En qué barrio conviene comprar?</p>
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
              <img src="/hipotecario.jpeg" alt="Créditos UVA" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Guía de Compra</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  Créditos Hipotecarios UVA 2026: La Llave para tu Casa Propia en la Patagonia
                </p>
              </div>
            </Link>
            <Link href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/cartel-san-martin-de-los-andes.webp" alt="Cuánto cuesta una casa en San Martín de los Andes" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
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
