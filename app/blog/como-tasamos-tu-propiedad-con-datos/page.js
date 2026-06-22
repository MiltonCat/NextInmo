import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import { SITE_URL, WA_URL, canonicalUrl, TASADOR_URL } from "@/config";
import { RELEVADAS_TOTAL_FMT, RELEVADAS_MODELO_FMT } from "@/lib/mercado";

export const metadata = {
  title: "Cómo tasamos tu propiedad con datos en San Martín de los Andes | Catalán Propiedades",
  description:
    `Te explicamos cómo funciona nuestro tasador: un modelo predictivo entrenado con ${RELEVADAS_MODELO_FMT} casas y departamentos reales de San Martín de los Andes. Qué mira, por qué te da un rango y no un número mágico, y qué cosas un modelo nunca puede ver.`,
  keywords:
    "cuanto vale mi propiedad san martin de los andes, tasacion online san martin de los andes, como se calcula el valor del m2, tasador de propiedades patagonia, valor m2 san martin de los andes, tasacion con datos",
  openGraph: {
    title: "Cómo tasamos tu propiedad con datos (y por qué te damos un rango)",
    description:
      `El modelo predictivo detrás de nuestro tasador: ${RELEVADAS_MODELO_FMT} casas y departamentos reales de San Martín de los Andes, qué mira y por qué un rango es más honesto que un número exacto.`,
    url: canonicalUrl("/blog/como-tasamos-tu-propiedad-con-datos"),
    type: "article",
    publishedTime: "2026-06-16T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [{ url: `${SITE_URL}/portada.jpg`, width: 1200, height: 630, alt: "Cómo tasamos tu propiedad con datos en San Martín de los Andes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo tasamos tu propiedad con datos en San Martín de los Andes",
    description:
      "El modelo predictivo detrás de nuestro tasador: qué mira, por qué te da un rango y no un número mágico, y qué cosas un modelo nunca puede ver.",
    images: [`${SITE_URL}/portada.jpg`],
  },
  alternates: {
    canonical: canonicalUrl("/blog/como-tasamos-tu-propiedad-con-datos"),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Cómo tasamos tu propiedad con datos en San Martín de los Andes",
  description:
    `Cómo funciona el tasador de Catalán Propiedades: un modelo predictivo entrenado con ${RELEVADAS_MODELO_FMT} casas y departamentos reales de San Martín de los Andes. Qué mira, por qué da un rango y no un número exacto, y qué cosas un modelo no puede ver.`,
  image: `${SITE_URL}/portada.jpg`,
  datePublished: "2026-06-16",
  dateModified: "2026-06-22",
  author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logoMC.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl("/blog/como-tasamos-tu-propiedad-con-datos") },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿En qué datos se basa la tasación?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `El tasador se apoya en un modelo entrenado con las ${RELEVADAS_MODELO_FMT} casas y departamentos relevados en San Martín de los Andes. En vez de copiar el precio de un aviso, aprende cómo distintas características —superficie, tipo, ubicación, estado— forman el valor del m² en la zona, y estima cuánto vale una propiedad a partir de ese patrón.`,
      },
    },
    {
      "@type": "Question",
      name: "¿Por qué el tasador me da un rango y no un valor exacto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Porque ninguna tasación seria es un número exacto: el valor real de una propiedad siempre se mueve dentro de una franja. Calibramos el modelo para que el valor real caiga dentro del rango estimado aproximadamente 9 de cada 10 veces. Dar un único número con tres decimales sería marketing, no honestidad. El rango te dice, además, qué tan cerrado o amplio es el mercado para tu tipo de propiedad.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es gratis usar el tasador?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. El tasador online es gratuito, da un resultado al instante e incluye un informe en PDF para que tengas la estimación por escrito. No pedimos pago ni compromiso.",
      },
    },
    {
      "@type": "Question",
      name: "¿La estimación automática reemplaza una tasación profesional?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. La estimación del modelo es un excelente punto de partida para entender el mercado y poner expectativas en su lugar, pero es orientativa. Hay cosas que un modelo no puede ver —la luz, el estado fino, la vista, el contexto de la operación— y que solo se ajustan con una visita. Para operaciones formales de compra, venta o garantías bancarias se requiere además una tasación profesional certificada.",
      },
    },
    {
      "@type": "Question",
      name: "¿Sirve tanto para casas como para departamentos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. El modelo trata las casas y los departamentos por separado, porque no valen lo mismo ni se mueven igual en el mercado aunque tengan los mismos metros. Esa distinción es parte de lo que hace que la estimación sea más afinada.",
      },
    },
    {
      "@type": "Question",
      name: "¿Me sirve si quiero vender o si quiero comprar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para los dos. Si vas a vender, te ayuda a poner un precio realista y evitar que tu propiedad quede meses sin moverse por estar sobrevaluada. Si vas a comprar, te da una referencia objetiva para saber si lo que te piden está dentro de mercado o por encima.",
      },
    },
  ],
};

const PASOS = [
  {
    numero: "01",
    titulo: "Relevamos el mercado real",
    descripcion:
      `Todo arranca con datos. Reunimos y depuramos ${RELEVADAS_TOTAL_FMT} propiedades publicadas y operadas en San Martín de los Andes, descartando avisos duplicados, publicaciones desactualizadas y datos cargados con errores. Sin datos limpios, cualquier estimación es humo.`,
    puntos: [
      `${RELEVADAS_TOTAL_FMT} propiedades relevadas en la ciudad.`,
      "Limpieza de duplicados y avisos repetidos o vencidos.",
      "Se actualiza para seguir el pulso del mercado.",
    ],
  },
  {
    numero: "02",
    titulo: "Miramos lo que define el precio",
    descripcion:
      "El modelo no se queda con el precio de un solo aviso: aprende qué características explican el valor del m² en cada caso. Son las mismas variables que mira un buen tasador, pero cruzadas a la vez sobre cientos de propiedades.",
    puntos: [
      "Superficie, cantidad de ambientes y tipo (casa o departamento).",
      "Ubicación y barrio: la distancia al centro pesa, y mucho.",
      "Estado general y amenidades (cochera, parque, vista).",
    ],
  },
  {
    numero: "03",
    titulo: "El modelo aprende los patrones",
    descripcion:
      "Con esos datos, un modelo predictivo encuentra cómo se combinan las características para formar el precio. No copia un aviso: promedia miles de señales del mercado para estimar cuánto vale una propiedad hoy, sin arrastrar el sesgo de una sola publicación inflada.",
    puntos: [
      "Aprende de todo el mercado, no de un caso aislado.",
      "Cruza variables que un ojo humano no alcanza a combinar a la vez.",
      "Reduce el efecto de los precios de publicación inflados.",
    ],
  },
  {
    numero: "04",
    titulo: "Ajustamos por barrio y tipo",
    descripcion:
      "Un mismo modelo no rinde igual en un departamento del centro que en una casa en las afueras. Por eso calibramos el resultado por tipo de propiedad y por zona, comparándolo con propiedades similares reales antes de mostrarlo.",
    puntos: [
      "Calibración con propiedades comparables de la misma zona.",
      "Tratamiento distinto para casas y departamentos.",
      "Cada ajuste se valida con datos, no a ojo.",
    ],
  },
  {
    numero: "05",
    titulo: "Te damos un valor y un rango",
    descripcion:
      "El resultado final no es un número suelto: es un valor estimado acompañado de un rango. Y eso es a propósito —es la parte más honesta de todo el proceso— porque ninguna propiedad vale un número exacto al peso.",
    puntos: [
      "Un valor central de referencia.",
      "Un rango donde es muy probable que caiga el valor real.",
      "Un informe en PDF gratis para que lo tengas por escrito.",
    ],
  },
];

const FACTORES = [
  {
    t: "Ubicación y barrio",
    d: "Es el factor que más mueve el m². La distancia al centro, los servicios y el entorno cambian el valor más que casi cualquier detalle de la propiedad.",
  },
  {
    t: "Superficie y ambientes",
    d: "No solo cuántos m², sino cómo están distribuidos. El valor por m² no es lineal: las unidades muy chicas y las muy grandes se comportan distinto.",
  },
  {
    t: "Tipo de propiedad",
    d: "Una casa y un departamento de los mismos metros no valen lo mismo ni se mueven igual en el mercado. El modelo los trata por separado.",
  },
  {
    t: "Estado y amenidades",
    d: "Estado general, antigüedad, cochera, parque o una buena vista suman. Son los detalles que terminan de ajustar el número final.",
  },
];

const LIMITES = [
  "La luz de la mañana, la vista real desde el living o lo silenciosa que es la calle.",
  "Una cocina recién renovada o terminaciones de categoría que no figuran en los datos.",
  "El estado fino de mantenimiento, que muchas veces solo se nota al entrar.",
  "El contexto de la operación: urgencia de venta, formas de pago, margen de negociación.",
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

const WA_TASACION_URL = `${WA_URL}?text=${encodeURIComponent(
  "Hola Milton, me gustaría saber cuánto vale mi propiedad en San Martín de los Andes. ¿Me podés ayudar con una tasación?"
)}`;

export default function ComoTasamosConDatosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 [hyphens:none] [overflow-wrap:normal]">

        {/* Header */}
        <header className="mb-10 md:mb-12">
          <p className="text-rose-600 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">Tasación con datos · 2026</p>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Cómo tasamos tu propiedad con datos (y por qué te damos un rango, no un número mágico)
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
            La pregunta que más me hacen es "¿cuánto vale mi propiedad?". Casi todos la responden a ojo o copiando el precio del vecino. Nosotros la respondemos con un modelo entrenado con datos reales de San Martín de los Andes. Acá te muestro cómo funciona, sin tecnicismos.
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
            Durante años, tasar una propiedad fue una mezcla de experiencia, intuición y mirar qué publican los vecinos. El problema es que <strong className="text-gray-900">el precio publicado no es el valor real</strong>: es lo que alguien <em>pretende</em>, y suele estar inflado. Cuando todos copian el precio del de al lado, el mercado entero se distorsiona.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Por eso construimos un tasador apoyado en datos. La idea es simple: en vez de mirar un solo aviso, dejar que un modelo aprenda de cientos de propiedades reales de San Martín de los Andes y estime, con honestidad, cuánto vale la tuya. Te explico cómo lo hace —y, sobre todo, qué <strong className="text-gray-900">no</strong> puede hacer.
          </p>
        </section>

        {/* Callout: probalo */}
        <div className="mb-12 flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">📊</span>
          <div>
            <p className="font-bold text-blue-900 text-sm">¿Querés probarlo antes de seguir leyendo?</p>
            <p className="text-blue-700 text-sm mt-1">
              El{" "}
              <TrackedLink
                event="tasador_click"
                eventParams={{ location: "blog_como_tasamos_intro" }}
                href={TASADOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2 hover:text-blue-900"
              >
                tasador online
              </TrackedLink>{" "}
              te da una estimación al instante, gratis y con un informe en PDF. Después volvé y entendé qué hay detrás de ese número.
            </p>
          </div>
        </div>

        {/* Por qué el publicado no es el real */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-4">El precio publicado no es el valor real</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Esta es la base de todo. El valor real de una propiedad no es lo que pide un aviso: es lo que un comprador está realmente dispuesto a pagar y lo que un vendedor realmente acepta. Entre esos dos números suele haber una diferencia grande, y los portales están llenos de publicaciones que llevan meses dando vueltas justamente porque arrancaron por encima de mercado.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Un modelo entrenado con muchas propiedades a la vez diluye ese ruido. No se enamora de un aviso ni se deja llevar por lo que pide un vecino entusiasmado: busca el patrón que se repite en todo el mercado. Por eso, bien usado, es una herramienta para poner expectativas en su lugar.
          </p>
        </section>

        {/* Pasos */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Cómo funciona, paso a paso</h2>
          <p className="text-gray-500 mb-8">De los datos crudos al valor que ves en pantalla. Sin magia: cada paso es trazable.</p>
          <div className="grid grid-cols-1 gap-4">
            {PASOS.map((paso) => (
              <PasoCard key={paso.numero} paso={paso} />
            ))}
          </div>
        </section>

        {/* Por qué un rango */}
        <section className="mb-14 bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Por qué te damos un rango y no un número exacto</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Esta es, para mí, la parte más importante. Sería fácil mostrarte un número redondo y vendértelo como "el valor" de tu propiedad. Pero eso sería marketing, no honestidad. <strong className="text-gray-900">Ninguna tasación seria es un número exacto:</strong> el valor real siempre se mueve dentro de una franja.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Por eso el tasador te muestra un valor de referencia <em>y</em> un rango. Y no es un rango puesto al azar: lo calibramos para que el valor real caiga dentro de él <strong className="text-gray-900">aproximadamente 9 de cada 10 veces</strong>. Ese rango también te dice algo: cuando es angosto, el mercado para tu tipo de propiedad es claro; cuando es ancho, hay más incertidumbre y conviene afinar con una mirada experta.
          </p>
          <div className="flex gap-3 items-start bg-white border border-gray-200 rounded-xl px-5 py-4">
            <span className="text-xl flex-shrink-0">🎯</span>
            <p className="text-gray-600 text-sm leading-relaxed">
              <strong className="text-gray-900">En criollo:</strong> preferimos decirte "tu propiedad vale entre X e Y, y lo más probable es que esté cerca de Z" antes que inventarte una precisión que no existe. La credibilidad vale más que un número lindo.
            </p>
          </div>
        </section>

        {/* Factores */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Qué es lo que más mueve el valor del m²</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FACTORES.map((item) => (
              <div key={item.t} className="border border-gray-200 rounded-2xl p-5">
                <p className="font-bold text-gray-900 text-sm mb-1.5">{item.t}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qué no puede ver un modelo */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Qué cosas un modelo nunca va a ver</h2>
          <p className="text-gray-500 mb-6">
            Ser honesto con la herramienta es reconocer sus límites. Hay valor que ningún dato captura, y ahí es donde sigue haciendo falta una persona que conozca la zona.
          </p>
          <ul className="space-y-3 mb-6">
            {LIMITES.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-rose-500 flex-shrink-0 mt-0.5">•</span>
                <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Por eso digo siempre lo mismo: la estimación del modelo es un <strong className="text-gray-900">punto de partida buenísimo</strong>, no la última palabra. Te ahorra el sesgo de los precios inflados y te ubica en el mapa. Después, una visita termina de ajustar lo que los datos no alcanzan a ver.
          </p>
        </section>

        {/* Dos formas de tasar */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Dos formas de saber cuánto vale tu propiedad</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col">
              <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-2">Tasador online</p>
              <p className="font-black text-gray-900 text-lg mb-2 leading-snug">Resultado al instante</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                Cargás los datos de tu propiedad y el modelo te devuelve un valor, un rango y un informe en PDF en el momento. Ideal para hacerte una primera idea, gratis y sin esperar.
              </p>
              <TrackedLink
                event="tasador_click"
                eventParams={{ location: "blog_como_tasamos_comparativa" }}
                href={TASADOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors self-start"
              >
                Tasar al instante
              </TrackedLink>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col">
              <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-2">Tasación personal</p>
              <p className="font-black text-gray-900 text-lg mb-2 leading-snug">La mirada de Milton</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                Reviso personalmente tu caso y ajusto lo que el modelo no ve: estado real, vista, contexto. Ideal antes de publicar para la venta o de cerrar una operación. También gratis y sin compromiso.
              </p>
              <Link
                href="/tasacion"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors self-start"
              >
                Pedir tasación
              </Link>
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

        {/* Nota */}
        <section className="mb-14 border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nota sobre esta herramienta</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            La estimación del tasador es orientativa y se basa en datos del mercado de San Martín de los Andes con fines informativos. No reemplaza una tasación profesional certificada, necesaria para operaciones formales de compra, venta o garantías bancarias. Los valores son referenciales y pueden variar según las condiciones del mercado y las características particulares de cada propiedad.
          </p>
        </section>

        {/* CTA principal */}
        <section className="mb-12">
          <div className="bg-gray-900 rounded-3xl p-8 sm:p-10 text-center">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3">¿Cuánto vale lo tuyo?</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
              Conocé el valor de tu propiedad hoy
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto mb-7">
              Probá el tasador para una estimación al instante, o escribime y lo vemos juntos con la mirada que los datos no alcanzan a dar. Las dos cosas son gratis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <TrackedLink
                event="tasador_click"
                eventParams={{ location: "blog_como_tasamos_cta" }}
                href={TASADOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                Tasar mi propiedad al instante
              </TrackedLink>
              <TrackedLink
                event="whatsapp_click"
                eventParams={{ location: "blog_como_tasamos_cta" }}
                href={WA_TASACION_URL}
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
            <Link href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/hero-montana.jpg" alt="Cuánto cuesta una casa en San Martín de los Andes" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Precios</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  ¿Cuánto cuesta una casa en San Martín de los Andes? (2026)
                </p>
              </div>
            </Link>
            <Link href="/blog/donde-vivir-san-martin-de-los-andes" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/sanmartin.jpeg" alt="Barrios de San Martín de los Andes" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
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
