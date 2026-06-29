import { SITE_URL, canonicalUrl, TASADOR_URL, WA_URL } from "@/config";
import mercado, { RELEVADAS_TOTAL_FMT } from "@/lib/mercado";

export const metadata = {
  title:
    "Cuánto rinde un alquiler temporario en San Martín de los Andes (números reales 2026)",
  description:
    "Qué rentabilidad real deja un alquiler temporario en San Martín de los Andes: ocupación por temporada, precio por noche, costos de gestión y comparación con el alquiler permanente, con datos del mercado patagónico.",
  keywords:
    "alquiler temporario san martin de los andes, rentabilidad alquiler temporario patagonia, cuanto rinde alquiler temporario, invertir para alquilar san martin de los andes, ocupacion alquiler turistico neuquen",
  openGraph: {
    title: "Cuánto rinde un alquiler temporario en San Martín de los Andes",
    description:
      "Ocupación por temporada, precio por noche, costos y rentabilidad neta real de un alquiler temporario en San Martín de los Andes. Con datos del mercado.",
    url: canonicalUrl(
      "/blog/cuanto-rinde-alquiler-temporario-san-martin-de-los-andes"
    ),
    type: "article",
    publishedTime: "2026-06-28T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [
      {
        url: `${SITE_URL}/patagon.jpg`,
        width: 675,
        height: 1200,
        alt: "Alquiler temporario en San Martín de los Andes — rentabilidad real | Catalán Propiedades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuánto rinde un alquiler temporario en San Martín de los Andes",
    description:
      "Ocupación, precio por noche, costos y rentabilidad neta real de un alquiler temporario, con datos del mercado patagónico.",
    images: [`${SITE_URL}/patagon.jpg`],
  },
  alternates: {
    canonical: canonicalUrl(
      "/blog/cuanto-rinde-alquiler-temporario-san-martin-de-los-andes"
    ),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Cuánto rinde un alquiler temporario en San Martín de los Andes (números reales 2026)",
  description:
    "Rentabilidad real de un alquiler temporario en San Martín de los Andes: ocupación por temporada, precio por noche, costos de gestión y comparación con el alquiler permanente.",
  image: `${SITE_URL}/patagon.jpg`,
  datePublished: "2026-06-28",
  dateModified: "2026-06-28",
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
    "@id": canonicalUrl(
      "/blog/cuanto-rinde-alquiler-temporario-san-martin-de-los-andes"
    ),
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto rinde un alquiler temporario en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un departamento bien ubicado y bien gestionado puede dejar una rentabilidad neta de entre 6% y 9% anual en dólares sobre el valor de compra. El alquiler temporario factura más por noche que el permanente, pero también tiene más costos (limpieza, comisiones de plataforma, gestión) y depende de la ocupación de cada temporada. Son rendimientos de referencia, no garantizados.",
      },
    },
    {
      "@type": "Question",
      name: "¿Conviene más el alquiler temporario o el permanente?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depende del perfil. El temporario suele rendir algo más y te deja usar la propiedad, pero exige gestión activa y tiene ingresos estacionales. El permanente rinde un poco menos pero es ingreso estable y sin trabajo operativo. En San Martín de los Andes, por el peso del turismo, los departamentos chicos en zona céntrica suelen ser los que mejor funcionan en temporario.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué ocupación tiene un alquiler temporario en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La ocupación es estacional: muy alta en invierno (julio y vacaciones de ski) y verano (enero y febrero), media en primavera y otoño con fines de semana largos, y baja en temporada baja. Un promedio anual razonable para una buena unidad gestionada se ubica en torno al 50% al 65%, pero varía según ubicación, calidad y gestión.",
      },
    },
  ],
};

export default function AlquilerTemporarioPage() {
  const m2Depto = mercado.valor_m2_usd.por_tipo.Departamento;
  const barrioCentro = mercado.valor_m2_usd.por_barrio.find(
    (b) => b.barrio === "Centro"
  );
  const yields = mercado.rentabilidad_alquiler.tabla;
  const yieldDepto1 = yields.find((y) => y.segmento === "Depto 1 dorm");

  const fmtUsd = (n) => `USD ${Math.round(n).toLocaleString("es-AR")}`;

  // Caso ejemplo: depto de 1 dormitorio (40 m²) en zona céntrica.
  const supEjemplo = yieldDepto1.superficie_m2; // 40
  const m2Centro = barrioCentro.mediana_m2_usd; // 3210
  const valorEjemplo = supEjemplo * m2Centro; // ~128.400
  const rentPermAnual = valorEjemplo * (yieldDepto1.rentabilidad_anual_pct / 100);
  const rentPermMes = rentPermAnual / 12;

  // Temporadas de referencia (ocupación y tarifa por noche, estimaciones de mercado).
  const temporadas = [
    {
      temporada: "Invierno (ski) – jul a sep",
      noches: 92,
      ocupacion: 75,
      tarifa: 75,
    },
    {
      temporada: "Verano – ene y feb",
      noches: 59,
      ocupacion: 80,
      tarifa: 70,
    },
    {
      temporada: "Otoño / primavera (fines de semana largos)",
      noches: 122,
      ocupacion: 45,
      tarifa: 55,
    },
    {
      temporada: "Temporada baja – resto del año",
      noches: 92,
      ocupacion: 25,
      tarifa: 45,
    },
  ];

  const brutoTemp = temporadas.reduce(
    (acc, t) => acc + t.noches * (t.ocupacion / 100) * t.tarifa,
    0
  );
  const nochesVendidas = temporadas.reduce(
    (acc, t) => acc + t.noches * (t.ocupacion / 100),
    0
  );
  const ocupacionProm = Math.round((nochesVendidas / 365) * 100);
  // Costos del temporario: ~35% entre limpieza, plataformas, gestión y mantenimiento.
  const costosTempPct = 35;
  const netoTemp = brutoTemp * (1 - costosTempPct / 100);
  const yieldTempNeto = (netoTemp / valorEjemplo) * 100;

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
            Cuánto rinde un alquiler temporario en San Martín de los Andes
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
            Todos hablan de la rentabilidad del alquiler turístico, pero pocos
            ponen números. Te muestro cuánto factura y cuánto deja realmente un
            temporario en San Martín de los Andes, temporada por temporada y
            descontando los costos que casi nadie cuenta.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <time dateTime="2026-06">Junio 2026</time>
            <span>·</span>
            <span>8 min de lectura</span>
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

        {/* Contenido */}
        <div className="prose prose-lg max-w-none">
          {/* Introducción */}
          <section className="mb-12">
            <p className="text-lg leading-relaxed text-gray-700">
              San Martín de los Andes vive del turismo, y eso convierte al{" "}
              <strong>alquiler temporario</strong> en una de las inversiones más
              buscadas de la Patagonia. La promesa es tentadora: cobrar en dólares
              por noche, usar la propiedad cuando querés y revalorizar el capital.
              Pero entre lo que factura una unidad y lo que termina entrando a tu
              bolsillo hay una distancia que conviene conocer antes de comprar.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              En esta nota armo el cálculo completo con datos reales de mercado:
              cuánto se ocupa cada temporada, cuánto se cobra por noche, qué costos
              tiene la operación y qué <strong>rentabilidad neta</strong> queda al
              final. Y lo comparo con la alternativa más tranquila: el alquiler
              permanente.
            </p>
          </section>

          {/* Por qué SMA es distinta */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Por qué el temporario funciona acá
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              No todo destino sirve para alquiler turístico. San Martín de los Andes
              tiene tres cosas que lo hacen funcionar: una{" "}
              <strong>doble temporada alta</strong> (ski en invierno y montaña/lago
              en verano), demanda que paga en dólares y una oferta de suelo limitada
              por el Parque Nacional Lanín y la geografía. Eso sostiene tanto el
              precio del m² como las tarifas por noche.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              La contracara es la <strong>estacionalidad</strong>: no es lo mismo una
              semana de julio que un martes de mayo. Por eso el número que importa no
              es la mejor noche del año, sino el promedio de los 365 días.
            </p>
          </section>

          {/* El caso ejemplo */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              El caso: un 1 dormitorio en zona céntrica
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              Tomemos la unidad estrella del temporario: un departamento de{" "}
              <strong>{supEjemplo} m²</strong> de 1 dormitorio en zona céntrica. Con
              una mediana de <strong>{fmtUsd(m2Centro)}/m²</strong> en el Centro, el
              valor de compra ronda los <strong>{fmtUsd(valorEjemplo)}</strong>. Es
              el segmento más líquido y el que más rápido se ocupa.
            </p>
            <div className="bg-rose-50 border-l-4 border-rose-600 p-6 my-8 not-prose">
              <p className="text-rose-900 font-semibold mb-2">
                💡 Punto de partida
              </p>
              <p className="text-rose-800">
                Valor de compra de referencia: {fmtUsd(valorEjemplo)} (
                {supEjemplo} m² × {fmtUsd(m2Centro)}/m², mediana del Centro sobre{" "}
                {barrioCentro.n} propiedades relevadas). Todo lo que sigue se calcula
                sobre esta base.
              </p>
            </div>
          </section>

          {/* Ocupación y facturación por temporada */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              1. Cuánto factura: ocupación y tarifa por temporada
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              Acá está la clave que el promedio esconde. La facturación no es pareja:
              se concentra en invierno y verano. Estas son tarifas y ocupaciones de
              referencia para una buena unidad gestionada profesionalmente:
            </p>
            <div className="overflow-x-auto my-8 not-prose">
              <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-bold text-gray-700">
                      Temporada
                    </th>
                    <th className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                      Ocupación
                    </th>
                    <th className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                      USD/noche
                    </th>
                    <th className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                      Factura
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {temporadas.map((t) => (
                    <tr key={t.temporada} className="border-t border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {t.temporada}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {t.ocupacion}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {fmtUsd(t.tarifa)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        {fmtUsd(t.noches * (t.ocupacion / 100) * t.tarifa)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      Total anual
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                      {ocupacionProm}%
                    </td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-sm font-black text-rose-600 text-right">
                      {fmtUsd(brutoTemp)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-lg leading-relaxed text-gray-700">
              El resultado: una <strong>facturación bruta de {fmtUsd(brutoTemp)}</strong>{" "}
              al año, con una ocupación promedio del <strong>{ocupacionProm}%</strong>.
              Parece un yield bruto altísimo sobre el valor de compra, pero todavía no
              descontamos nada. Acá es donde la mayoría se equivoca.
            </p>
          </section>

          {/* Costos */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              2. Lo que se lleva la operación
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              El temporario factura más que el permanente, pero también{" "}
              <strong>cuesta más operarlo</strong>. Entre todo, es razonable que se
              vaya cerca de un <strong>{costosTempPct}%</strong> de lo que facturás:
            </p>
            <ul className="text-lg leading-relaxed text-gray-700 space-y-2 mb-6">
              <li>
                <strong>Comisión de plataformas</strong> (Airbnb, Booking): entre 3% y
                15% según el canal.
              </li>
              <li>
                <strong>Gestión / administración</strong>: si no vivís acá o no querés
                operar, una empresa de management cobra entre 15% y 25% de lo
                facturado.
              </li>
              <li>
                <strong>Limpieza y blanquería</strong> entre estadías, consumibles y
                amenities.
              </li>
              <li>
                <strong>Servicios, expensas y mantenimiento</strong>, que en una
                propiedad de uso intensivo pesan más.
              </li>
              <li>
                <strong>Desgaste y reposición</strong> de muebles y electrodomésticos.
              </li>
            </ul>
            <div className="bg-gray-900 text-white rounded-2xl p-8 my-8 not-prose">
              <h3 className="text-xl font-bold mb-6">Del bruto al neto</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-gray-300">Facturación bruta anual</span>
                  <span className="text-lg font-bold text-gray-100">
                    {fmtUsd(brutoTemp)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-gray-300">
                    Costos de operación (~{costosTempPct}%)
                  </span>
                  <span className="text-lg font-bold text-rose-400">
                    – {fmtUsd(brutoTemp - netoTemp)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-white font-bold">Neto anual</span>
                  <span className="text-2xl font-black text-green-400">
                    {fmtUsd(netoTemp)}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-6">
                Rentabilidad neta sobre el valor de compra:{" "}
                <strong className="text-white">
                  {yieldTempNeto.toFixed(1)}% anual en USD
                </strong>
                .
              </p>
            </div>
          </section>

          {/* Comparación temporario vs permanente */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              3. Temporario vs. permanente: el mano a mano
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              La alternativa tranquila es alquilar la misma unidad de forma
              permanente. Según nuestros datos de referencia, un depto de 1 dormitorio
              rinde alrededor del{" "}
              <strong>{yieldDepto1.rentabilidad_anual_pct}% anual</strong>, lo que
              sobre {fmtUsd(valorEjemplo)} son unos{" "}
              <strong>{fmtUsd(rentPermMes)} por mes</strong> sin trabajo operativo.
            </p>
            <div className="grid sm:grid-cols-2 gap-5 my-8 not-prose">
              <div className="rounded-2xl p-6 border bg-blue-50 border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  Temporario
                </p>
                <p className="text-3xl font-black text-gray-900 mb-1">
                  ~{yieldTempNeto.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Neto anual estimado. Más ingreso y podés usar la propiedad, pero
                  exige gestión activa e ingresos estacionales.
                </p>
              </div>
              <div className="rounded-2xl p-6 border bg-green-50 border-green-200">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                  Permanente
                </p>
                <p className="text-3xl font-black text-gray-900 mb-1">
                  ~{yieldDepto1.rentabilidad_anual_pct}%
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Anual sobre el valor de compra. Un poco menos, pero ingreso estable,
                  previsible y cero trabajo operativo.
                </p>
              </div>
            </div>
            <p className="text-lg leading-relaxed text-gray-700">
              La diferencia es más chica de lo que parece, y por eso la decisión no se
              toma solo con el yield: pesa cuánto querés involucrarte, si vas a usar la
              propiedad y qué tan estable necesitás el ingreso. A ambos números hay que
              sumarles la <strong>revalorización</strong> del m², que en San Martín de
              los Andes acumuló un{" "}
              <strong>{mercado.evolucion_precios.variacion_total_pct}%</strong> en USD
              en los últimos años.
            </p>
          </section>

          {/* Qué propiedad rinde mejor */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Qué unidad rinde mejor en temporario
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              No toda propiedad sirve igual. En temporario suele ganar la unidad
              chica, céntrica y lista para usar. Mirá la diferencia de rendimiento por
              segmento en alquiler de referencia:
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
              Los departamentos chicos lideran porque combinan menor ticket de
              entrada, alta rotación y demanda permanente. Las casas grandes facturan
              más por noche en temporada alta, pero pasan más días vacías y exigen más
              mantenimiento, así que el rendimiento sobre el capital baja.
            </p>
          </section>

          {/* CTA */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl p-8 my-12 text-center not-prose">
              <h3 className="text-2xl font-bold mb-4">
                ¿Querés saber cuánto rendiría una propiedad puntual?
              </h3>
              <p className="text-rose-100 mb-6 max-w-xl mx-auto">
                Analizamos la unidad que estás mirando con datos del mercado: valor de
                compra, rentabilidad estimada y potencial como temporario. Sin
                compromiso.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href={WA_URL}
                  className="inline-block bg-white text-rose-600 font-bold px-8 py-4 rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
                >
                  Consultar por WhatsApp →
                </a>
                <a
                  href={TASADOR_URL}
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
                  ¿Cuánto rinde un alquiler temporario en San Martín de los Andes?
                </h3>
                <p className="text-gray-700">
                  Una buena unidad, bien ubicada y bien gestionada, puede dejar una
                  rentabilidad neta de entre 6% y 9% anual en dólares sobre el valor de
                  compra. Factura más por noche que el permanente, pero tiene más costos
                  y depende de la ocupación de cada temporada. Son rendimientos de
                  referencia, no garantizados.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Conviene más el temporario o el permanente?
                </h3>
                <p className="text-gray-700">
                  El temporario suele rendir algo más y te deja usar la propiedad, pero
                  exige gestión activa e ingresos estacionales. El permanente rinde un
                  poco menos pero es estable y sin trabajo operativo. Los departamentos
                  chicos en zona céntrica son los que mejor funcionan en temporario.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Qué ocupación real puedo esperar?
                </h3>
                <p className="text-gray-700">
                  Es estacional: muy alta en invierno y verano, media en primavera y
                  otoño, baja el resto del año. Un promedio anual razonable para una
                  buena unidad gestionada se ubica en torno al 50% al 65%, según
                  ubicación, calidad y gestión.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-gray-100 rounded-xl p-6 text-sm text-gray-600 mt-12">
            <p className="font-semibold text-gray-800 mb-2">Aviso</p>
            <p>
              Este artículo tiene fines informativos y no constituye asesoramiento
              financiero ni recomendación de inversión. Las tarifas, ocupaciones y
              costos son estimaciones de referencia para San Martín de los Andes y
              varían según ubicación, calidad, gestión y temporada; el valor del m²
              surge de {RELEVADAS_TOTAL_FMT} propiedades relevadas y también puede
              variar. Los rendimientos son escenarios probables, no promesas.
              Consultá con un asesor inmobiliario profesional antes de tomar decisiones
              de inversión.
            </p>
          </div>

          {/* Posts relacionados */}
          <section className="not-prose border-t border-gray-100 pt-10 mt-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              También te puede interesar
            </p>
            <div className="space-y-3">
              <a
                href="/blog/score-de-inversion-san-martin-de-los-andes"
                className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group"
              >
                <img
                  src="/inversion.jpg"
                  alt="Score de inversión inmobiliaria"
                  className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">
                    Inversión
                  </p>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                    Score de inversión: cómo leer una propiedad como un activo
                  </p>
                </div>
              </a>
              <a
                href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes"
                className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group"
              >
                <img
                  src="/hero-montana.jpg"
                  alt="Cuánto cuesta una casa en San Martín de los Andes"
                  className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">
                    Precios
                  </p>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                    ¿Cuánto cuesta una casa en San Martín de los Andes? (2026)
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
