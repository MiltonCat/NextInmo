import { SITE_URL, canonicalUrl, TASADOR_PATH, WA_URL } from "@/config";
import mercado, { RELEVADAS_PUBLICO } from "@/lib/mercado";
import { barriosConMediana } from "@/lib/precioZonas";
import TrackedLink from "@/components/TrackedLink";
import PodcastPlayer from "@/components/PodcastPlayer";

const WA_SCORE_URL = `${WA_URL}?text=${encodeURIComponent(
  "Hola Milton, leí la guía sobre el Score de Inversión y quisiera analizar una propiedad o una oportunidad según mi presupuesto."
)}`;

export const metadata = {
  title:
    "Score de inversión inmobiliaria: cómo leer una propiedad como un activo en San Martín de los Andes",
  description:
    "Qué variables componen el score de inversión de una propiedad en San Martín de los Andes (ubicación, revalorización, rentabilidad, liquidez y riesgo) y cómo interpretarlo con datos reales del mercado patagónico.",
  keywords:
    "score de inversion inmobiliaria, invertir san martin de los andes, rentabilidad alquiler patagonia, valor m2 san martin de los andes, inversion inmobiliaria neuquen",
  openGraph: {
    title: "Score de inversión: cómo leer una propiedad como un activo",
    description:
      "El marco que usamos para evaluar una propiedad patagónica como inversión: ubicación, revalorización, rentabilidad, liquidez y riesgo, con datos reales.",
    url: canonicalUrl("/blog/score-de-inversion-san-martin-de-los-andes"),
    type: "article",
    publishedTime: "2026-06-23T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [
      {
        url: `${SITE_URL}/patagonia-activo.jpg`,
        width: 736,
        height: 1591,
        alt: "La Patagonia también es un activo — Real estate con mirada financiera | Catalán Propiedades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Score de inversión: cómo leer una propiedad como un activo",
    description:
      "El marco que usamos para evaluar una propiedad patagónica como inversión, con datos reales del mercado.",
    images: [`${SITE_URL}/patagonia-activo.jpg`],
  },
  alternates: {
    canonical: canonicalUrl("/blog/score-de-inversion-san-martin-de-los-andes"),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Score de inversión inmobiliaria: cómo leer una propiedad como un activo en San Martín de los Andes",
  description:
    "Qué variables componen el score de inversión de una propiedad en San Martín de los Andes y cómo interpretarlo con datos reales del mercado patagónico.",
  image: `${SITE_URL}/patagonia-activo.jpg`,
  datePublished: "2026-06-23",
  dateModified: "2026-06-23",
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
      url: `${SITE_URL}/logoMC.webp`,
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": canonicalUrl("/blog/score-de-inversion-san-martin-de-los-andes"),
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es el score de inversión de una propiedad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Es un marco de análisis que resume en un puntaje qué tan buena es una propiedad como inversión, ponderando cinco variables: ubicación y demanda, potencial de revalorización, rentabilidad por alquiler, liquidez y perfil de riesgo. No es una garantía de rentabilidad, sino una forma ordenada de comparar oportunidades con datos.",
      },
    },
    {
      "@type": "Question",
      name: "¿De dónde salen los datos del score?",
      acceptedAnswer: {
        "@type": "Answer",
        // La cifra sale de la constante: acá decía "más de 1.700" escrito a
        // mano, un número de un export viejo que no coincidía con ninguno de
        // los que publica el resto del sitio. Y este texto es el que Google
        // levanta como respuesta destacada, así que era el peor lugar para
        // tener una cifra suelta.
        text: `De un relevamiento de ${RELEVADAS_PUBLICO} propiedades de San Martín de los Andes: valor del m² por zona y tipo, evolución histórica de precios y rendimientos de alquiler de referencia por segmento. Sobre esa base se evalúa cada propiedad puntual.`,
      },
    },
    {
      "@type": "Question",
      name: "¿Un score alto garantiza ganancias?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. El score ordena la decisión y muestra el perfil de inversión, pero toda inversión inmobiliaria está sujeta a variables de mercado, regulatorias y de ejecución. Los valores son estimaciones y escenarios probables, no promesas de rentabilidad.",
      },
    },
  ],
};

export default function ScoreInversionPage() {
  const valorM2Ref = mercado.valor_m2_usd.referencia_general_casa_depto;
  const m2Depto = mercado.valor_m2_usd.por_tipo.Departamento;
  const m2Casa = mercado.valor_m2_usd.por_tipo.Casa;
  const variacionTotal = mercado.evolucion_precios.variacion_total_pct;
  const serie = mercado.evolucion_precios.serie;
  const primerAnio = serie[0];
  const ultimoAnio = serie[serie.length - 1];
  const yields = mercado.rentabilidad_alquiler.tabla;
  // Vía barriosConMediana() y no leyendo por_barrio directo: el JSON crudo trae
  // "General" —las publicaciones sin barrio declarado— en el segundo puesto por
  // volumen, y esta tabla lo mostraba como si fuera un barrio de San Martín.
  const barriosTop = barriosConMediana().slice(0, 6);

  const fmtUsd = (n) => `USD ${Math.round(n).toLocaleString("es-AR")}`;

  const pilares = [
    {
      nombre: "Ubicación y demanda",
      peso: 25,
      mira: "Barrio, valor del m² de la zona, cercanía a centro, lago y Chapelco, y qué tan buscada es el área.",
    },
    {
      nombre: "Potencial de revalorización",
      peso: 20,
      mira: "Tendencia histórica del m², obras de infraestructura, escasez de suelo y proyección de la zona.",
    },
    {
      nombre: "Rentabilidad por alquiler",
      peso: 20,
      mira: "Rendimiento anual estimado según el segmento (temporario o permanente) sobre el valor de compra.",
    },
    {
      nombre: "Liquidez",
      peso: 15,
      mira: "Qué tan rápido se vende o alquila ese tipo de propiedad en ese rango de precio.",
    },
    {
      nombre: "Perfil de riesgo",
      peso: 20,
      mira: "Estado y calidad constructiva, riesgo de ejecución (si es pozo), aspectos legales y dependencia del turismo.",
    },
  ];

  const bandas = [
    {
      rango: "85 – 100",
      letra: "A+",
      label: "Activo premium",
      desc: "Ubicación consolidada, alta demanda y revalorización sostenida. Bajo riesgo relativo.",
      box: "bg-green-50 border-green-200",
      letraColor: "text-green-600",
    },
    {
      rango: "70 – 84",
      letra: "A",
      label: "Inversión sólida",
      desc: "Buen equilibrio entre renta y revalorización. Algún punto a optimizar (precio, estado o plazo).",
      box: "bg-blue-50 border-blue-200",
      letraColor: "text-blue-600",
    },
    {
      rango: "55 – 69",
      letra: "B",
      label: "A revisar",
      desc: "Tiene potencial, pero hay variables que conviene negociar o estudiar antes de avanzar.",
      box: "bg-amber-50 border-amber-200",
      letraColor: "text-amber-600",
    },
    {
      rango: "menos de 55",
      letra: "C",
      label: "Especulativo",
      desc: "Solo tiene sentido a un precio claramente por debajo de mercado o con un plan muy específico.",
      box: "bg-rose-50 border-rose-200",
      letraColor: "text-rose-600",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">
            Inversión
          </p>
          <h1 className="max-w-3xl text-[2rem] sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.08] mb-4">
            Score de inversión: cómo leer una propiedad como un activo
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
            En la Patagonia, una propiedad no se mira solo con intuición: se puede
            medir. Te muestro el marco que usamos para evaluar una propiedad de San
            Martín de los Andes como un activo financiero, con datos reales del
            mercado.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <time dateTime="2026-06">Junio 2026</time>
            <span>·</span>
            <span>9 min de lectura</span>
          </div>

          {/* Autor */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <img
              src="/Milton.webp"
              alt="Milton Catalán"
              className="w-16 h-16 rounded-full object-cover border-2 border-rose-200"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">
                Escrito por Milton Catalán
              </p>
              <p className="text-xs text-gray-600">
                Asesor inmobiliario con +10 años de experiencia en San Martín de los
                Andes
              </p>
            </div>
          </div>
        </header>

        {/* Versión escuchada — no se muestra si el post no tiene audio registrado */}
        <PodcastPlayer slug="score-de-inversion-san-martin-de-los-andes" />

        {/* Contenido */}
        <div className="prose prose-lg max-w-none">
          {/* Introducción */}
          <section className="mb-12">
            <p className="text-lg leading-relaxed text-gray-700">
              Cuando alguien compra acciones, mira números: precio, historial,
              riesgo, proyección. Cuando compra una propiedad, en cambio, suele
              decidir con la foto y la sensación. En un destino como{" "}
              <strong>San Martín de los Andes</strong>, donde el metro cuadrado
              está entre los más altos del país, esa diferencia puede costar miles
              de dólares.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              Por eso trabajamos cada propiedad como un{" "}
              <strong>activo medible</strong>. No se trata de quitarle la emoción a
              comprar en la Patagonia, sino de sumarle información. El{" "}
              <strong>score de inversión</strong> es la forma de ordenar esa
              información en un solo puntaje comparable.
            </p>
          </section>

          {/* Qué es el score */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Qué es el score de inversión
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              Es un marco de análisis que resume, en un puntaje de 0 a 100, qué tan
              buena es una propiedad como inversión. No reemplaza el criterio: lo
              ordena. Pondera cinco variables que, juntas, definen si un activo es
              sólido o si conviene negociar antes de avanzar.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              La base son datos reales: un relevamiento de{" "}
              <strong>{RELEVADAS_PUBLICO} propiedades</strong> de San Martín de
              los Andes, con valor del m² por zona y tipo, evolución histórica de
              precios y rendimientos de alquiler de referencia.
            </p>
          </section>

          {/* Los 5 pilares */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Los 5 pilares del score
            </h2>
            <div className="space-y-4 not-prose">
              {pilares.map((p) => (
                <div
                  key={p.nombre}
                  className="flex items-start gap-5 p-6 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  <div className="flex-shrink-0 text-center">
                    <p className="text-3xl font-black text-rose-600 leading-none">
                      {p.peso}
                      <span className="text-base align-top">%</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                      peso
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {p.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{p.mira}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pilar 1 con datos: ubicación */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              1. Ubicación: el m² no vale lo mismo en toda la ciudad
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              La referencia general para casas y departamentos hoy ronda los{" "}
              <strong>{fmtUsd(valorM2Ref)} por m²</strong>, pero el promedio
              esconde diferencias enormes entre barrios. Por eso la ubicación pesa
              un 25%: es la variable que más explica el valor y la demanda.
            </p>
            <div className="bg-gray-900 text-white rounded-2xl p-8 my-8 not-prose">
              <h3 className="text-xl font-bold mb-6">
                Valor del m² por barrio (mediana, USD)
              </h3>
              <div className="space-y-3">
                {barriosTop.map((b) => (
                  <div
                    key={b.nombre}
                    className="flex justify-between items-center border-b border-gray-700 pb-3"
                  >
                    <span className="text-gray-300">{b.nombre}</span>
                    <span className="text-xl font-bold text-rose-400">
                      {fmtUsd(b.medianaM2)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-6">
                Medianas calculadas sobre propiedades relevadas. Última
                actualización: {mercado.generado}.
              </p>
            </div>
            <p className="text-lg leading-relaxed text-gray-700">
              Un departamento bien ubicado puede acercarse a{" "}
              <strong>{fmtUsd(m2Depto)}/m²</strong>, mientras que una casa en zonas
              más alejadas puede ubicarse cerca de{" "}
              <strong>{fmtUsd(m2Casa)}/m²</strong>. El score no premia el barrio más
              caro, sino la mejor relación entre precio de entrada y demanda real.
            </p>
          </section>

          {/* Pilar 2: revalorización */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              2. Revalorización: hacia dónde va el precio
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              El valor del m² en San Martín de los Andes pasó de{" "}
              <strong>{fmtUsd(primerAnio.usd_m2)}</strong> en {primerAnio.anio} a{" "}
              <strong>{fmtUsd(ultimoAnio.usd_m2)}</strong> en {ultimoAnio.anio}: una
              variación acumulada del <strong>{variacionTotal}%</strong>. El
              crecimiento se moderó en los últimos años, señal de un mercado que
              madura más que de uno que se enfría.
            </p>
            <div className="bg-gray-50 rounded-2xl p-8 my-8 border border-gray-200 not-prose">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Evolución del m² (USD)
              </h3>
              <div className="space-y-3">
                {serie.map((s) => (
                  <div
                    key={s.anio}
                    className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-0"
                  >
                    <span className="text-gray-600">{s.anio}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-900">
                        {fmtUsd(s.usd_m2)}
                      </span>
                      {s.variacion_pct != null && (
                        <span className="text-sm font-semibold text-green-600 w-16 text-right">
                          +{s.variacion_pct}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-lg leading-relaxed text-gray-700">
              Una propiedad puntúa alto en este pilar cuando está en una zona con
              tendencia sostenida y respaldo de fondo: escasez de suelo con
              servicios y demanda turística creciente. Son escenarios probables, no
              garantías.
            </p>
          </section>

          {/* Pilar 3: rentabilidad */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              3. Rentabilidad: cuánto rinde por alquiler
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              La revalorización es la mitad de la ecuación; la otra mitad es el flujo
              que genera mientras la tenés. El rendimiento anual de referencia varía
              bastante según el segmento:
            </p>
            <div className="overflow-x-auto my-8 not-prose">
              <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-sm font-bold text-gray-700">
                      Segmento
                    </th>
                    <th className="px-5 py-3 text-sm font-bold text-gray-700">
                      Superficie
                    </th>
                    <th className="px-5 py-3 text-sm font-bold text-gray-700 text-right">
                      Rentabilidad anual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yields.map((y) => (
                    <tr key={y.segmento} className="border-t border-gray-200">
                      <td className="px-5 py-3 text-sm text-gray-800">
                        {y.segmento}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {y.superficie_m2} m²
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-green-700 text-right">
                        {y.rentabilidad_anual_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-lg leading-relaxed text-gray-700">
              Los departamentos chicos suelen liderar el rendimiento porque el
              alquiler temporario y permanente los absorbe rápido. Son yields de
              referencia: el número real depende de la gestión, la ocupación y la
              temporada.
            </p>
          </section>

          {/* Pilar 4 y 5: liquidez y riesgo */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              4 y 5. Liquidez y riesgo: lo que casi nadie mira
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              La <strong>liquidez</strong> es qué tan rápido podés convertir el
              activo en dinero. Un 2 ambientes en zona céntrica se vende y se alquila
              en semanas; un campo grande o una propiedad muy particular puede tardar
              meses. A igual rentabilidad, lo más líquido puntúa más alto.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              El <strong>riesgo</strong> agrupa el estado y la calidad
              constructiva, el riesgo de ejecución si comprás en pozo, los aspectos
              legales y la dependencia del turismo. No se trata de evitar el riesgo,
              sino de que esté <strong>pagado</strong>: un descuento por obra en
              construcción puede ser una buena entrada si el proyecto es serio.
            </p>
          </section>

          {/* Cómo se lee el score */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Cómo se lee el puntaje final
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 my-8 not-prose">
              {bandas.map((b) => (
                <div
                  key={b.letra}
                  className={`rounded-2xl p-6 border ${b.box}`}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <span className={`text-3xl font-black ${b.letraColor}`}>
                      {b.letra}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {b.rango}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 mb-1">{b.label}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-lg leading-relaxed text-gray-700">
              Un mismo barrio puede tener propiedades A+ y propiedades C. El score no
              juzga la zona: juzga la oportunidad concreta, al precio concreto que te
              piden hoy.
            </p>
          </section>

          {/* Ejemplo */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Un ejemplo concreto
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              Tomemos un departamento de 1 dormitorio en zona céntrica. Marca buena
              ubicación, buena liquidez y la rentabilidad por alquiler más alta de la
              tabla. Si el precio de entrada está alineado con el m² de la zona y el
              estado es bueno, fácilmente cae en banda <strong>A / A+</strong>.
            </p>
            <div className="bg-rose-50 border-l-4 border-rose-600 p-6 my-8 not-prose">
              <p className="text-rose-900 font-semibold mb-2">💡 La idea de fondo</p>
              <p className="text-rose-800">
                El mismo departamento, ofrecido un 20% por encima del m² de su zona,
                puede bajar de A+ a B sin que cambie ni un ladrillo. El precio de
                entrada es parte del activo.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl p-8 my-12 text-center not-prose">
              <h3 className="text-2xl font-bold mb-4">
                ¿Querés el score de una propiedad puntual?
              </h3>
              <p className="text-rose-100 mb-6 max-w-xl mx-auto">
                Analizamos la propiedad que estás mirando con datos del mercado y te
                damos una lectura clara antes de que decidas. Sin compromiso.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <TrackedLink
                  event="whatsapp_click"
                  eventParams={{ location: "blog_score_inversion_cta" }}
                  href={WA_SCORE_URL}
                  className="inline-block bg-white text-rose-600 font-bold px-8 py-4 rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar por WhatsApp →
                </TrackedLink>
                <a
                  href={TASADOR_PATH}
                  className="inline-block bg-white/10 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  Probar el tasador
                </a>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12 bg-gray-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Preguntas frecuentes
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿El score garantiza que voy a ganar plata?
                </h3>
                <p className="text-gray-700">
                  No. Es un marco para ordenar la decisión y ver el perfil de
                  inversión, pero toda inversión inmobiliaria depende de variables de
                  mercado, regulatorias y de ejecución. Los valores son estimaciones
                  y escenarios probables, no promesas de rentabilidad.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿De dónde salen los datos?
                </h3>
                <p className="text-gray-700">
                  De un relevamiento de {RELEVADAS_PUBLICO} propiedades de
                  San Martín de los Andes: valor del m² por zona y tipo, evolución
                  histórica de precios y rendimientos de alquiler de referencia por
                  segmento.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Sirve igual para vivienda propia que para inversión?
                </h3>
                <p className="text-gray-700">
                  El score está pensado para inversión. Si comprás para vivir, pesa
                  más tu estilo de vida que la rentabilidad, aunque mirar liquidez y
                  revalorización igual te protege el capital.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-gray-100 rounded-xl p-6 text-sm text-gray-600 mt-12">
            <p className="font-semibold text-gray-800 mb-2">Aviso</p>
            <p>
              Este artículo describe un marco de análisis con fines informativos y no
              constituye asesoramiento financiero ni recomendación de inversión. Los
              valores de mercado son estimaciones basadas en datos relevados de San
              Martín de los Andes y pueden variar. Consultá con un asesor inmobiliario
              profesional antes de tomar decisiones de inversión.
            </p>
          </div>

          {/* Posts relacionados */}
          <section className="not-prose border-t border-gray-100 pt-10 mt-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              También te puede interesar
            </p>
            <div className="space-y-3">
              <a
                href="/blog/como-tasamos-tu-propiedad-con-datos"
                className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group"
              >
                <img
                  src="/portada.jpg"
                  alt="Cómo tasamos tu propiedad con datos"
                  className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">
                    Tasación con Datos
                  </p>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                    Cómo tasamos tu propiedad con datos (y por qué te damos un rango)
                  </p>
                </div>
              </a>
              <a
                href="/blog/bitcoin-ladrillos-patagonicos"
                className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group"
              >
                <img
                  src="/fintech.jpeg"
                  alt="El Bitcoin de los Ladrillos Patagónicos"
                  className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">
                    Inversión
                  </p>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                    El Bitcoin de los Ladrillos Patagónicos
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
