import Image from "next/image";
import Link from "next/link";
import { SITE_URL, WA_URL, canonicalUrl } from "@/config";

const slug = "/blog/airbnb-facil-san-martin-de-los-andes-2026";
const coverImage = SITE_URL + "/chapelco-invierno-sma-2026.webp";

export const metadata = {
  title: "¿Se terminó el Airbnb fácil en San Martín de los Andes?",
  description:
    "Más alquileres temporarios, tarifas en baja y nuevos controles con datos: qué cambia en 2026 para propietarios e inversores en San Martín de los Andes.",
  keywords:
    "airbnb san martin de los andes, alquiler temporario san martin de los andes 2026, rentabilidad alquiler turistico, habilitacion alquiler temporario sma, AirDNA san martin de los andes",
  openGraph: {
    title: "¿Se terminó el Airbnb fácil en San Martín de los Andes?",
    description:
      "La oferta crece, las tarifas bajan y el Municipio suma controles basados en datos. El nuevo escenario del alquiler temporario en SMA.",
    url: canonicalUrl(slug),
    type: "article",
    publishedTime: "2026-07-14T00:00:00-03:00",
    modifiedTime: "2026-07-14T00:00:00-03:00",
    authors: ["Milton Catalán"],
    images: [
      {
        url: coverImage,
        width: 736,
        height: 494,
        alt: "Esquiadores en la pista del cerro Chapelco, San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Se terminó el Airbnb fácil en San Martín de los Andes?",
    description:
      "Más oferta, tarifas en baja y controles con datos: el nuevo escenario del alquiler temporario en SMA.",
    images: [coverImage],
  },
  alternates: { canonical: canonicalUrl(slug) },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "¿Se terminó el Airbnb fácil en San Martín de los Andes?",
  description:
    "Análisis del mercado de alquiler temporario de San Martín de los Andes en 2026: oferta, ocupación, tarifas, ingresos y nuevas herramientas de fiscalización.",
  image: coverImage,
  datePublished: "2026-07-14",
  dateModified: "2026-07-14",
  author: {
    "@type": "Person",
    name: "Milton Catalán",
    url: canonicalUrl("/nosotros"),
  },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: { "@type": "ImageObject", url: SITE_URL + "/logoMC.webp" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl(slug) },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Sigue siendo rentable un alquiler temporario en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Puede seguir siendo rentable, pero no alcanza con mirar la tarifa de una semana de temporada alta. El resultado depende del precio de compra, la ocupación anual, los costos de operación, la ubicación, la gestión y el cumplimiento de la normativa. Los promedios de mercado no garantizan el rendimiento de una propiedad puntual.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es obligatorio habilitar un alquiler turístico en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. La normativa municipal establece un registro para casas y departamentos destinados a alquiler turístico temporario, con documentación, seguro de responsabilidad civil, requisitos de seguridad y certificado de inscripción de vigencia anual.",
      },
    },
    {
      "@type": "Question",
      name: "¿El Municipio controla publicaciones de alquiler temporario?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En junio de 2026 el Concejo Deliberante aprobó un convenio que permite compartir información obtenida mediante AirDNA entre el Municipio, FEHGRA y la asociación hotelera local para identificar actividad de alojamiento fuera del marco regulatorio.",
      },
    },
  ],
};

const marketMetrics = [
  { metric: "Publicaciones activas", value: "2.006", change: "+5,0%", tone: "text-amber-700" },
  { metric: "Ocupación promedio", value: "46%", change: "+4,9%", tone: "text-green-700" },
  { metric: "Tarifa diaria promedio", value: "USD 115", change: "−9,7%", tone: "text-rose-700" },
  { metric: "Ingreso anual promedio", value: "USD 8.100", change: "−7,7%", tone: "text-rose-700" },
  { metric: "Ingreso por noche disponible", value: "USD 49", change: "−13,5%", tone: "text-rose-700" },
];

const sources = [
  {
    label: "AirDNA — mercado de alquiler temporario en San Martín de los Andes",
    href: "https://www.airdna.co/vacation-rental-data/app/ar/neuquen/san-martin-de-los-andes/overview",
  },
  {
    label: "Concejo Deliberante — convenio para combatir la informalidad hotelera",
    href: "https://prensacd.cdsma.gob.ar/2026/06/08/el-concejo-aprobo-por-unanimidad-compartir-informacion-estrategica-para-combatir-la-informalidad-hotelera/",
  },
  {
    label: "Municipalidad — registro de alquiler turístico temporario",
    href: "https://boletinoficial.sma.gob.ar/wp-content/uploads/2024/12/2576-24.pdf",
  },
  {
    label: "La Montaña — posición de la Asociación Hotelera Gastronómica",
    href: "https://www.lamontana.com.ar/noticias/2026/06/10/16176-hay-mas-ocupacion-fuera-del-sistema-que-dentro-del-sector-formal-advirtio-el-presidente-de-la-ahgsma",
  },
];

export default function AirbnbFacilPage() {
  const whatsappUrl =
    WA_URL +
    "?text=" +
    encodeURIComponent(
      "Hola, quiero analizar una propiedad para alquiler temporario en San Martín de los Andes."
    );

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
        <header className="mb-10 sm:mb-12">
          <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">
            Mercado e inversión
          </p>
          <h1 className="max-w-3xl text-[2rem] sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.08] mb-4">
            ¿Se terminó el Airbnb fácil en San Martín de los Andes?
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
            Hay más propiedades compitiendo, la ocupación mejora, pero las tarifas y
            los ingresos promedio retroceden. Al mismo tiempo, el Municipio empieza
            a controlar la oferta informal con información de mercado. ¿Qué significa
            este nuevo escenario para un propietario o inversor?
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <time dateTime="2026-07-14">14 de julio de 2026</time>
            <span>·</span>
            <span>9 min de lectura</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-8">
            <Image
              src="/Milton.webp"
              alt="Milton Catalán"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-rose-200"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">Escrito por Milton Catalán</p>
              <p className="text-xs text-gray-600">
                Asesor inmobiliario con +10 años de experiencia en San Martín de los Andes
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[16/8.43]">
            <Image
              src="/chapelco-invierno-sma-2026.webp"
              alt="Esquiadores en la pista del cerro Chapelco durante la temporada de invierno en San Martín de los Andes"
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            El rendimiento ya no depende sólo de una buena temporada: importan la
            competencia, la gestión y la formalización.
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <p className="text-lg leading-relaxed text-gray-700">
              Durante años, la conversación sobre alquiler temporario en San Martín
              de los Andes fue bastante simple: comprar una unidad bien ubicada,
              publicarla, aprovechar julio y enero y cobrar una tarifa turística.
              Esa fórmula todavía puede funcionar, pero los datos de 2026 muestran
              que el mercado se volvió más competitivo y exige mirar bastante más
              que el precio de una noche de vacaciones.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              Cuando hablamos de “Airbnb” en esta nota usamos el nombre como una forma
              cotidiana de referirnos al alquiler temporario publicado en plataformas.
              Los datos de AirDNA también incluyen oferta observada en Vrbo y Booking,
              y deben leerse como una estimación privada del mercado, no como una
              estadística oficial municipal.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              La paradoja de 2026: más ocupación, menos ingreso
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              La fotografía de AirDNA con datos cerrados a mayo de 2026 es clara:
              crecen las publicaciones y mejora la ocupación, pero cae el precio
              promedio que efectivamente se cobra. El resultado es que el ingreso
              medio por propiedad también retrocede.
            </p>

            <div className="overflow-x-auto my-8 not-prose">
              <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-sm font-bold">Indicador</th>
                    <th className="px-4 py-3 text-sm font-bold text-right">Nivel</th>
                    <th className="px-4 py-3 text-sm font-bold text-right">Variación anual</th>
                  </tr>
                </thead>
                <tbody>
                  {marketMetrics.map((item) => (
                    <tr key={item.metric} className="border-t border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-800">{item.metric}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        {item.value}
                      </td>
                      <td className={"px-4 py-3 text-sm font-bold text-right " + item.tone}>
                        {item.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Fuente: AirDNA, actualización del 9 de junio de 2026 con información
              completa hasta mayo. “Publicación activa” significa que estuvo disponible
              o reservada durante los últimos doce meses. Los USD 8.100 corresponden al
              ingreso bruto anual promedio estimado antes de gastos.
            </p>

            <div className="bg-rose-50 border-l-4 border-rose-600 p-6 my-8 not-prose">
              <p className="font-bold text-rose-900 mb-2">La lectura importante</p>
              <p className="text-rose-900 leading-relaxed">
                No falta demanda: la ocupación aumentó. Lo que aparece es una presión
                competitiva sobre las tarifas. Hay más unidades tratando de capturar
                al mismo huésped y el propietario debe ajustar precio, calidad o ambos.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Una semana llena no es una rentabilidad anual
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Ver el departamento completo durante las vacaciones de invierno puede
              dar una sensación equivocada. La inversión se evalúa sobre doce meses,
              incluyendo semanas vacías, descuentos, comisiones, limpieza, servicios,
              reposición, mantenimiento y gestión. Además, el ingreso bruto promedio
              de una plataforma no dice cuánto queda en el bolsillo ni cuánto capital
              hubo que invertir para comprar la propiedad.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              Por eso no hay una contradicción automática entre el promedio general
              y una unidad céntrica que rinde mejor: son universos distintos. El punto
              es no usar el caso de una propiedad sobresaliente como promesa para todo
              el mercado. En nuestro análisis anterior explicamos el cálculo completo
              de una buena unidad y sus costos en{" "}
              <Link
                href="/blog/cuanto-rinde-alquiler-temporario-san-martin-de-los-andes"
                className="text-rose-600 font-semibold hover:text-rose-700"
              >
                cuánto rinde realmente un alquiler temporario
              </Link>
              .
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              El segundo cambio: la informalidad queda bajo la lupa
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              El 4 de junio de 2026, el Concejo Deliberante aprobó por unanimidad el
              convenio que permite compartir información entre el Municipio, FEHGRA
              y la Asociación Hotelera Gastronómica local. El acuerdo, protocolizado
              mediante el Decreto 833/26, habilita el uso de datos obtenidos a través
              de AirDNA para identificar actividad de hospedaje fuera del marco
              regulatorio.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              Esto no crea desde cero la obligación de registrarse: San Martín de los
              Andes ya cuenta con un Registro de Alquiler Turístico Temporario. La
              reglamentación contempla documentación del inmueble y del titular,
              seguro de responsabilidad civil, requisitos de seguridad, inspección y
              un certificado de inscripción de vigencia anual.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              La novedad es la capacidad de contrastar la oferta digital con el
              registro. Para quien analiza comprar una propiedad con destino turístico,
              la habilitación deja de ser un trámite para revisar después: debe formar
              parte del estudio previo de costos y factibilidad.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              El debate local: competencia, vivienda y seguridad
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              La Asociación Hotelera sostiene que la ocupación por fuera del sistema
              formal sería aproximadamente 30% superior a la hotelería tradicional.
              Es una afirmación del sector empresario y no un dato oficial auditado,
              pero muestra el tamaño de la discusión: hoteles y alojamientos habilitados
              reclaman igualdad de condiciones, mientras muchos propietarios ven el
              temporario como una forma legítima de aprovechar su activo.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              También aparece el problema de la vivienda permanente. Sería demasiado
              fácil responsabilizar a una sola plataforma por la falta de alquileres:
              influyen el crecimiento de la ciudad, la escasez de suelo, los costos de
              construcción, la estacionalidad y la demanda turística. Pero tampoco se
              puede negar que el uso turístico compite, en algunos segmentos, con el
              alquiler para residentes.
            </p>
            <div className="bg-gray-900 text-white rounded-2xl p-8 my-8 not-prose">
              <p className="text-xs font-bold text-rose-300 uppercase tracking-widest mb-3">
                Nuestra posición
              </p>
              <p className="text-xl font-bold leading-relaxed mb-3">
                El debate no debería ser “turismo sí o no”, sino qué oferta puede
                funcionar bien, de manera segura, medible y dentro de las reglas.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Un mercado formalizado permite comparar mejor, cuidar al visitante y
                tomar decisiones de inversión con costos reales en lugar de supuestos.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Qué propiedades todavía tienen ventaja
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-5">
              En un mercado con más competencia, no gana automáticamente la unidad
              más linda ni la que cobra más caro. Tienden a defenderse mejor las que
              combinan:
            </p>
            <ul className="text-lg leading-relaxed text-gray-700 space-y-3">
              <li><strong>Precio de compra razonable:</strong> la rentabilidad empieza al comprar, no al publicar.</li>
              <li><strong>Ubicación práctica todo el año:</strong> acceso, estacionamiento, cercanía y funcionamiento en invierno.</li>
              <li><strong>Costos fijos controlados:</strong> expensas, calefacción y mantenimiento pueden borrar una buena tarifa.</li>
              <li><strong>Diferencial verificable:</strong> vista, cochera, equipamiento, distribución o servicio; no sólo decoración.</li>
              <li><strong>Gestión profesional:</strong> respuesta, reputación, fotografía, limpieza y precio dinámico.</li>
              <li><strong>Factibilidad de habilitación:</strong> documentación y condiciones del inmueble revisadas antes de comprar.</li>
              <li><strong>Plan alternativo:</strong> posibilidad real de alquiler permanente o reventa si cambia el mercado.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Entonces, ¿se terminó el Airbnb fácil?
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Probablemente sí se terminó la etapa fácil: la de comprar cualquier
              departamento, mirar la tarifa de julio y proyectarla como si se repitiera
              todo el año. Pero eso no significa que se haya terminado el alquiler
              temporario como inversión.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              San Martín de los Andes conserva una demanda turística fuerte y una doble
              temporada atractiva. Lo que cambió es el nivel de exigencia. En 2026, una
              buena decisión necesita precio de entrada, escenario conservador de
              ocupación, costos completos, habilitación y una unidad capaz de competir
              sin depender de descuentos permanentes.
            </p>
          </section>

          <section className="mb-12">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl p-8 my-12 text-center not-prose">
              <h2 className="text-2xl font-bold mb-4">
                ¿Estás evaluando una propiedad para alquiler temporario?
              </h2>
              <p className="text-rose-100 mb-6 max-w-xl mx-auto">
                Analizamos el precio de compra, el segmento, los costos y un escenario
                conservador de ingresos antes de que tomes la decisión.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-rose-600 font-bold px-8 py-4 rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
              >
                Analizar una propiedad →
              </a>
            </div>
          </section>

          <section className="mb-12 bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Fuentes consultadas</h2>
            <ul className="space-y-3 text-base">
              {sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    {source.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div className="bg-gray-100 rounded-xl p-6 text-sm text-gray-600 mt-12">
            <p className="font-semibold text-gray-800 mb-2">Aviso</p>
            <p>
              Este artículo tiene fines informativos y no constituye asesoramiento
              financiero, legal ni una promesa de rentabilidad. AirDNA es una fuente
              privada y sus cifras son estimaciones agregadas del mercado. El resultado
              de cada propiedad depende de sus características, costos, gestión y
              situación normativa. Antes de comprar o destinar un inmueble a alquiler
              turístico, verificá la información con el Municipio y profesionales
              competentes.
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
          