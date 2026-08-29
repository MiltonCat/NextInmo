import Image from "next/image";
import Link from "next/link";
import { SITE_URL, canonicalUrl } from "@/config";
import PodcastPlayer from "@/components/PodcastPlayer";
import mercado, {
  VALOR_M2_CASA,
  VALOR_M2_DEPTO,
  RANGO_M2,
  EVOLUCION_SERIE,
  EVOLUCION_VARIACION_TOTAL,
  MERCADO_GENERADO,
} from "@/lib/mercado";

const slug = "/blog/nuevo-credito-hipotecario-2026-san-martin-de-los-andes";
const url = canonicalUrl(slug);
const coverImage = `${SITE_URL}/hipotecario.jpeg`;

// ─── Condiciones del anuncio del 26/08/2026 ────────────────────────────────
// Fuente primaria: argentina.gob.ar (gacetilla oficial del Ministerio de
// Economía). Todo lo que se publica acá sale de ahí, no de interpretaciones.
const TASA_MAX = 0.075; // UVA + 7,5% — tope que el FGS le impone al banco
const PLAZO_EJEMPLO = 25; // años del ejemplo oficial
const LTV = 0.75; // los bancos financian el 75% en el ejemplo oficial
const PRECIO_EJEMPLO = 106667; // USD, valor de la propiedad del ejemplo oficial
const CUOTA_EJEMPLO_ARS = 865098;
const INGRESO_EJEMPLO_ARS = 3460391;

// Cuota mensual de un sistema francés sobre 1 unidad de capital, a tasa real
// anual `tasa`. En un UVA la tasa es real: el capital ya se ajusta por CER, así
// que la cuota calculada así se lee en moneda constante (hoy, dólares).
function cuotaPorUnidad(tasa, anios) {
  const i = Math.pow(1 + tasa, 1 / 12) - 1;
  const n = anios * 12;
  return i / (1 - Math.pow(1 + i, -n));
}

// Lo que la cuota representa, en un año, como porcentaje del valor TOTAL de la
// propiedad (no del crédito). Es el número que se puede comparar de frente
// contra el rendimiento del alquiler.
const COSTO_ANUAL_SOBRE_VALOR =
  cuotaPorUnidad(TASA_MAX, PLAZO_EJEMPLO) * 12 * LTV;

// "21 de agosto de 2026" a partir del ISO del export, igual que /precio-m2: se
// calcula, no se escribe, para que no quede una fecha vieja hardcodeada.
const DATOS_AL = new Date(`${MERCADO_GENERADO}T12:00:00Z`).toLocaleDateString("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const fmtPct = (n) => `${n.toFixed(1).replace(".", ",")}%`;
const fmtUsd = (n) => `USD ${Math.round(n).toLocaleString("es-AR")}`;
const fmtM2 = (n) => `${Math.round(n)} m²`;

const superficies = [
  { tipo: "Departamento", nota: "mediana del relevamiento", m2usd: VALOR_M2_DEPTO },
  { tipo: "Departamento", nota: "cuartil de abajo (25% más barato)", m2usd: RANGO_M2.Departamento?.p25 },
  { tipo: "Casa", nota: "mediana del relevamiento", m2usd: VALOR_M2_CASA },
  { tipo: "Casa", nota: "cuartil de abajo (25% más barato)", m2usd: RANGO_M2.Casa?.p25 },
].filter((f) => typeof f.m2usd === "number");

const rendimientos = (mercado.rentabilidad_alquiler?.tabla ?? []).map((r) => ({
  segmento: r.segmento,
  superficie: r.superficie_m2,
  rinde: r.rentabilidad_anual_pct,
  ratio: (COSTO_ANUAL_SOBRE_VALOR / (r.rentabilidad_anual_pct / 100)) * 100,
}));

const primerAnio = EVOLUCION_SERIE[0];
const ultimoAnio = EVOLUCION_SERIE[EVOLUCION_SERIE.length - 1];

const condiciones = [
  ["Monto del programa", "$2 billones, colocados por el FGS como plazos fijos en bancos"],
  ["Tasa que cobra el FGS al banco", "Mínimo UVA + 2,5% a 1 año y UVA + 4,5% a 5 años"],
  ["Tasa máxima al tomador", "UVA + 7,5%"],
  ["Tope por crédito", "150.000 UVA"],
  ["Plazo mínimo del crédito", "15 años"],
  ["Quién asume la mora", "El banco, no el FGS"],
  ["Alcance estimado", "17.000 a 18.000 familias en todo el país, según el propio anuncio"],
];

const faqs = [
  [
    "¿Para cuántas familias alcanza el programa?",
    "Según la estimación que dio el propio Ministerio de Economía al anunciarlo, los $2 billones dan para unas 17.000 o 18.000 soluciones habitacionales en todo el país. Es un número acotado frente a la cantidad de inquilinos que hay en la Argentina, así que quien llegue con la carpeta armada tiene ventaja concreta.",
  ],
  [
    "¿Es un crédito nuevo o son los mismos créditos UVA de siempre?",
    "Son los mismos créditos UVA. Lo que cambia es de dónde sale la plata que los financia: el FGS coloca plazos fijos UVA a 1 y 5 años en los bancos, y a cambio les pone un techo de UVA + 7,5% para prestar. El instrumento que firma el comprador sigue siendo un hipotecario UVA común.",
  ],
  [
    "¿Sirve para comprar en San Martín de los Andes?",
    "Sí, no hay restricción geográfica: la restricción es de monto. El ejemplo oficial está calibrado sobre una propiedad de USD 106.667 y el tope por crédito es de 150.000 UVA. En San Martín ese rango alcanza para un departamento chico o una casa modesta, no para el promedio del mercado local.",
  ],
  [
    "¿La cuota es más barata que un alquiler?",
    "Depende del segmento. Con 25% de anticipo, la cuota inicial de un UVA + 7,5% a 25 años equivale a alrededor del " +
      fmtPct(COSTO_ANUAL_SOBRE_VALOR * 100) +
      " anual del valor de la propiedad. Si esa misma propiedad alquilada rinde más que eso, la cuota arranca por debajo del alquiler; si rinde menos, arranca por encima.",
  ],
  [
    "¿Cuánto ingreso familiar piden?",
    "La regla habitual es que la cuota no supere el 25% de los ingresos netos, o sea ingresos de al menos cuatro veces la cuota. En el ejemplo oficial, una cuota de $865.098 requiere un ingreso neto de $3.460.391, que se puede sumar entre dos personas.",
  ],
  [
    "¿Cualquier propiedad se puede comprar con crédito?",
    "No. Tiene que ser apta crédito: título perfecto, planos aprobados y escritura inmediata. En San Martín de los Andes es frecuente que la construcción real no coincida con el plano aprobado, y eso frena la operación antes de llegar al banco.",
  ],
];

export const metadata = {
  title: "Nuevo crédito hipotecario 2026: alcanza para 17.000 familias",
  description:
    "El Gobierno anunció $2 billones para crédito hipotecario con tope de UVA + 7,5%. Qué superficie compra ese crédito en San Martín de los Andes, cómo se compara la cuota con el alquiler y qué falta para que se note en el mercado local.",
  keywords:
    "nuevo credito hipotecario 2026, credito UVA 7,5, programa plazos fijos FGS, credito hipotecario San Martin de los Andes, comprar con credito Neuquen",
  openGraph: {
    title: "Nuevo crédito hipotecario: alcanza para 17.000 familias en todo el país",
    description:
      "El anuncio de $2 billones está calibrado sobre una propiedad de USD 106.667. Qué significa ese número en el mercado de San Martín de los Andes, con datos del relevamiento propio.",
    url,
    type: "article",
    publishedTime: "2026-08-29T00:00:00-03:00",
    modifiedTime: "2026-08-29T00:00:00-03:00",
    authors: ["Milton Catalán"],
    images: [
      {
        url: coverImage,
        width: 1200,
        height: 630,
        alt: "Crédito hipotecario para comprar en San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nuevo crédito hipotecario: ¿te sirve a vos?",
    description:
      "Las condiciones del programa de $2 billones, traducidas al mercado patagónico con datos propios.",
    images: [coverImage],
  },
  alternates: { canonical: url },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Nuevo crédito hipotecario: alcanza para 17.000 familias en todo el país. ¿Te sirve a vos?",
  description:
    "Análisis del programa de licitación de plazos fijos con destino a crédito hipotecario anunciado el 26 de agosto de 2026, aplicado al mercado de San Martín de los Andes.",
  image: coverImage,
  datePublished: "2026-08-29",
  dateModified: "2026-08-29",
  author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logoMC.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": url },
  // Versión escuchada del artículo (ver components/PodcastPlayer).
  audio: {
    "@type": "AudioObject",
    name: "Nuevo crédito hipotecario: alcanza para 17.000 familias — versión en audio",
    contentUrl: `${SITE_URL}/podcast/nuevo-credito-hipotecario-2026-san-martin-de-los-andes.mp3`,
    encodingFormat: "audio/mpeg",
    duration: "PT35M52S",
    uploadDate: "2026-08-29",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

function Heading({ children }) {
  return (
    <h2 className="mb-5 mt-12 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">
      {children}
    </h2>
  );
}

export default function NuevoCreditoHipotecarioPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10 sm:mb-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-rose-600">Mercado · Crédito</p>
          <h1 className="max-w-3xl text-[2rem] font-black leading-[1.08] text-gray-900 sm:text-4xl md:text-5xl">
            Nuevo crédito hipotecario: alcanza para 17.000 familias en todo el país. ¿Te sirve a vos?
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-xl">
            El 26 de agosto el Gobierno anunció $2 billones para financiar hipotecarios con tope de
            UVA&nbsp;+&nbsp;7,5%, y por sus propias cuentas alcanza para 17.000 o 18.000 familias en
            todo el país. Acá va la parte que el anuncio no cuenta: qué compra ese crédito en San
            Martín de los Andes, y a quién le sirve de verdad.
          </p>

          <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Image
              src="/Milton.webp"
              alt="Milton Catalán"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full border-2 border-rose-200 object-cover"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">Escrito por Milton Catalán</p>
              <p className="text-xs text-gray-600">
                29 de agosto de 2026 · 9 min de lectura · Asesor inmobiliario en San Martín de los Andes
              </p>
            </div>
          </div>

          <div className="relative mt-8 aspect-[16/8.43] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src="/hipotecario.jpeg"
              alt="Crédito hipotecario para comprar vivienda en la Patagonia"
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </header>

        <PodcastPlayer slug="nuevo-credito-hipotecario-2026-san-martin-de-los-andes" />

        <div className="prose prose-lg max-w-none text-gray-700">
          <div className="not-prose rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">Idea central</p>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-gray-900">
              El programa está calibrado sobre una propiedad de USD&nbsp;106.667. Con los valores de
              nuestro relevamiento, eso compra {fmtM2(PRECIO_EJEMPLO / VALOR_M2_DEPTO)} de departamento
              a la mediana de San Martín de los Andes. Es un crédito real y sirve, pero acá no alcanza
              para lo mismo que en una ciudad donde los precios cayeron a la mitad.
            </p>
          </div>

          <Heading>Qué se anunció, sin adornos</Heading>
          <p>
            El problema del crédito hipotecario argentino no es la demanda: es el fondeo. Los bancos se
            financian con depósitos a un día o a treinta, y prestar a veinticinco años con esa base es
            un descalce que ningún banco quiere.
          </p>
          <p>
            Lo que hace el programa es meterse justo ahí. El Fondo de Garantía de Sustentabilidad de la
            ANSES coloca <strong>plazos fijos UVA a 1 y 5 años</strong> en los bancos mediante
            licitaciones, y a cambio les fija un techo de tasa para prestar. El banco consigue fondeo
            largo; el comprador consigue una tasa con tope.
          </p>

          <div className="not-prose my-8 overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <tbody>
                {condiciones.map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                    <th scope="row" className="w-1/2 border-b border-gray-100 px-5 py-4 font-bold text-gray-900">
                      {k}
                    </th>
                    <td className="border-b border-gray-100 px-5 py-4 text-gray-700">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Ese último renglón conviene mirarlo dos veces. En un país con millones de inquilinos,
            diecisiete mil créditos no dan vuelta el mercado: le cambian la vida a diecisiete mil
            familias. No es poco y no es una crítica —es la escala real del anuncio—, pero define la
            estrategia: acá no gana el que analiza mejor, gana el que llega con la carpeta armada.
          </p>
          <p>
            Un detalle que va a demorar todo: el anuncio habla de <strong>“primera vivienda”</strong>,
            no de “vivienda única de ocupación permanente”, que es la condición que tienen hoy casi
            todas las líneas de los bancos. No son lo mismo, y significa que los bancos tienen que
            rearmar los productos antes de poder colocar la plata.
          </p>

          <Heading>El ejemplo oficial, traducido</Heading>
          <p>
            El propio anuncio trae un caso: propiedad de <strong>USD&nbsp;106.667</strong>, el banco
            financia el 75% a 25 años con tasa UVA&nbsp;+&nbsp;7%. Da una cuota inicial de{" "}
            <strong>${CUOTA_EJEMPLO_ARS.toLocaleString("es-AR")}</strong> y un ingreso familiar neto
            requerido de <strong>${INGRESO_EJEMPLO_ARS.toLocaleString("es-AR")}</strong>, que es la
            cuota multiplicada por cuatro.
          </p>
          <p>
            Ese ingreso, entre dos personas con trabajo registrado, no es una cifra imposible. El
            problema no está en la cuota. Está en el otro lado de la cuenta: en qué compra ese crédito
            en el lugar donde vivís.
          </p>

          <Heading>Qué compra ese crédito en San Martín de los Andes</Heading>
          <p>
            Estos son los valores del m² de nuestro relevamiento del mercado local, con datos al{" "}
            {DATOS_AL}. La última columna es la superficie que compra el ejemplo oficial de
            USD&nbsp;106.667.
          </p>

          <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-5 py-3 font-bold">Tipo</th>
                  <th className="px-5 py-3 font-bold">Referencia</th>
                  <th className="px-5 py-3 font-bold">USD/m²</th>
                  <th className="px-5 py-3 font-bold">Superficie con USD 106.667</th>
                </tr>
              </thead>
              <tbody>
                {superficies.map((f, i) => (
                  <tr key={`${f.tipo}-${f.nota}`} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="border-b border-gray-100 px-5 py-4 font-bold text-gray-900">{f.tipo}</td>
                    <td className="border-b border-gray-100 px-5 py-4 text-gray-600">{f.nota}</td>
                    <td className="border-b border-gray-100 px-5 py-4 tabular-nums text-gray-700">
                      {fmtUsd(f.m2usd)}
                    </td>
                    <td className="border-b border-gray-100 px-5 py-4 font-bold tabular-nums text-rose-700">
                      {fmtM2(PRECIO_EJEMPLO / f.m2usd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Leído sin épica: el crédito del anuncio, en San Martín, es un crédito de{" "}
            <strong>monoambiente o dos ambientes chico</strong> si buscás departamento, o de{" "}
            <strong>casa modesta y probablemente alejada del centro</strong> si buscás casa. No es un
            crédito para la casa con vista al lago, y presentarlo así sería mentirte.
          </p>
          <p>
            Eso no lo vuelve inútil. Lo vuelve <em>específico</em>: es una herramienta para el primer
            paso —dejar de alquilar, entrar como propietario— y no para la compra soñada.
          </p>

          <Heading>Por qué acá el efecto no es el mismo que en Buenos Aires</Heading>
          <p>
            En el análisis porteño hay un argumento fuerte y verdadero: los departamentos de Buenos
            Aires valen bastante menos en dólares que en 2018, los salarios en dólares se recuperaron,
            y por lo tanto nunca hicieron falta menos sueldos para comprar. Con crédito encima, eso se
            enciende.
          </p>
          <p>
            En San Martín de los Andes ese derrumbe no existió. Nuestra serie de referencia del m²
            local va de {fmtUsd(primerAnio?.usd_m2)} en {primerAnio?.anio} a{" "}
            {fmtUsd(ultimoAnio?.usd_m2)} en {ultimoAnio?.anio}: una suba de{" "}
            {EVOLUCION_VARIACION_TOTAL != null
              ? fmtPct(EVOLUCION_VARIACION_TOTAL)
              : "más de la mitad"}{" "}
            en dólares, subiendo todos los años.
          </p>
          <div className="not-prose my-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-amber-800">La diferencia</p>
            <p className="mt-3 leading-relaxed text-gray-800">
              El crédito llega a Buenos Aires cuando los precios están lejos de su máximo. Llega a San
              Martín cuando los precios están <strong>en máximos de la serie</strong>. Es el mismo
              crédito frente a dos mercados en momentos opuestos: acá empuja contra un piso de precios
              que nunca cedió, no contra un mercado en recuperación.
            </p>
          </div>
          <p>
            La consecuencia práctica es doble. Para el que compra, el poder de compra del crédito es
            menor y el margen de negociación también. Para el que vende, un flujo de compradores con
            crédito en el tramo de hasta USD&nbsp;110.000 puede darle liquidez justo al segmento que
            hoy tarda más en venderse.
          </p>

          <Heading>Cuota contra alquiler: la cuenta que decide</Heading>
          <p>
            La comparación que sirve no es “cuota versus precio”, es “cuota versus lo que ya estás
            pagando de alquiler”. Y hay una manera limpia de hacerla sin depender del tipo de cambio
            del día.
          </p>
          <p>
            Con 25% de anticipo, a UVA&nbsp;+&nbsp;7,5% y 25 años, la cuota inicial de un año completo
            equivale a alrededor del{" "}
            <strong>{fmtPct(COSTO_ANUAL_SOBRE_VALOR * 100)} del valor de la propiedad</strong>. Ese
            número se compara de frente contra lo que rinde esa misma propiedad alquilada:
          </p>

          <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-5 py-3 font-bold">Segmento</th>
                  <th className="px-5 py-3 font-bold">Rinde alquilado</th>
                  <th className="px-5 py-3 font-bold">Cuota anual s/ valor</th>
                  <th className="px-5 py-3 font-bold">Cuota vs. alquiler</th>
                </tr>
              </thead>
              <tbody>
                {rendimientos.map((r, i) => (
                  <tr key={r.segmento} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="border-b border-gray-100 px-5 py-4 font-bold text-gray-900">
                      {r.segmento} <span className="font-normal text-gray-500">({r.superficie} m²)</span>
                    </td>
                    <td className="border-b border-gray-100 px-5 py-4 tabular-nums text-gray-700">
                      {fmtPct(r.rinde)}
                    </td>
                    <td className="border-b border-gray-100 px-5 py-4 tabular-nums text-gray-700">
                      {fmtPct(COSTO_ANUAL_SOBRE_VALOR * 100)}
                    </td>
                    <td
                      className={`border-b border-gray-100 px-5 py-4 font-bold tabular-nums ${
                        r.ratio <= 100 ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {Math.round(r.ratio)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="bg-gray-50 px-5 py-4 text-xs leading-relaxed text-gray-500">
              Los rendimientos por segmento son referencias de mercado cargadas a mano, no salen del
              relevamiento automático, y mezclan alquiler temporario y permanente según el segmento.
              Sirven para ordenar la decisión, no como promesa de renta.
            </p>
          </div>

          <p>
            Donde el número da por debajo de 100%, la cuota inicial arranca más barata que el alquiler
            de esa misma propiedad. Ojo con la palabra <em>inicial</em>: la cuota se ajusta por
            inflación, y el alquiler también. Ninguna de las dos queda quieta.
          </p>

          <Heading>Lo que el anuncio todavía no resuelve</Heading>
          <div className="not-prose space-y-4">
            {[
              [
                "No se sabe cada cuánto van a licitar",
                "La primera licitación es una fracción del programa. Si licitan seguido y los bancos colocan rápido, el mercado lo siente. Si entre licitación y licitación pasan meses, queda en anuncio.",
              ],
              [
                "Los bancos tienen que rearmar las líneas",
                "El cambio de “vivienda única de ocupación permanente” a “primera vivienda” obliga a rehacer productos, no es un ajuste de tasa en una planilla.",
              ],
              [
                "La demanda desborda a la oferta de crédito",
                "Cada vez que aparece una línea nueva, los bancos se saturan de carpetas en días y pasan a modo reactivo. Llegar temprano con la carpeta armada deja de ser un detalle.",
              ],
              [
                "La propiedad tiene que ser apta crédito",
                "Título perfecto, planos aprobados, escritura inmediata. Acá es donde se cae la mitad de las operaciones con crédito en San Martín.",
              ],
            ].map(([title, text], i) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-gray-50 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-black text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="mt-1 leading-relaxed text-gray-700">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <Heading>El criterio que importa más que la planilla</Heading>
          <p>
            Un crédito UVA a 25 años no se decide en un Excel. Se decide mirando qué tan reemplazable
            es tu ingreso. Alguien con un oficio o una profesión que consigue trabajo en tres meses
            puede sostener una cuota que se ajusta por inflación; alguien con un ingreso estacional
            —y en un pueblo turístico hay muchos— tiene que mirarlo distinto.
          </p>
          <p>
            La pregunta honesta no es “¿me da la cuota hoy?”. Es “¿me sigue dando si el año que viene
            se me cae la fuente de ingreso principal?”. Si la respuesta es no, el problema no es la
            tasa.
          </p>
          <p>
            Dicho eso, hay algo que no cambia con ninguna coyuntura: llegar a la jubilación pagando
            alquiler es la peor posición posible. Empezar por una propiedad chica y sin gastos
            comunes altos es mejor que esperar la propiedad ideal durante veinte años.
          </p>

          <Heading>Si estás pensando en comprar con crédito</Heading>
          <div className="not-prose space-y-4">
            {[
              ["Poné el número antes que la ilusión", "Calculá la cuota y el ingreso que te van a pedir, y recién después mirá propiedades. Al revés se sufre."],
              ["Sumá los gastos de escrituración", "En Neuquén se suman por encima del precio. No entran en el crédito y hay que tenerlos en efectivo."],
              ["Pedí el estado documental antes de enamorarte", "Plano aprobado y título limpio. Si la casa tiene metros no declarados, el banco no la toma."],
              ["Armá la carpeta antes de que abra la línea", "Recibos, antigüedad laboral, informe crediticio. Cuando la línea abre, la fila se hace en horas."],
            ].map(([title, text], i) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-gray-50 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-black text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="mt-1 leading-relaxed text-gray-700">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="not-prose mt-14 rounded-2xl bg-gray-900 p-8 sm:p-10">
            <h2 className="text-2xl font-black leading-tight text-white">
              Calculá tu cuota antes de salir a mirar
            </h2>
            <p className="mt-3 leading-relaxed text-gray-400">
              El simulador usa las condiciones reales de las líneas UVA: anticipo, plazo, tasa e
              ingreso mínimo requerido. Y si lo que querés saber es cuánto vale lo que ya tenés, el
              tasador te da un rango con datos del mercado local.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/simulador-credito"
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
              >
                Simular mi crédito
              </Link>
              <Link
                href="/tasacion"
                className="rounded-xl border border-gray-700 bg-gray-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-700"
              >
                Tasar mi propiedad
              </Link>
              <Link
                href="/precio-m2"
                className="rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-bold text-gray-200 hover:bg-gray-800"
              >
                Ver el precio del m² por barrio
              </Link>
            </div>
          </section>

          <section className="not-prose mt-14 rounded-2xl bg-gray-50 p-8">
            <h2 className="mb-7 text-3xl font-black text-gray-900">Preguntas frecuentes</h2>
            <div className="space-y-6">
              {faqs.map(([question, answer]) => (
                <div key={question}>
                  <h3 className="text-lg font-bold text-gray-900">{question}</h3>
                  <p className="mt-2 leading-relaxed text-gray-700">{answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="not-prose mt-14 rounded-2xl bg-gray-50 p-8">
            <h2 className="text-2xl font-black text-gray-900">Fuentes</h2>
            <ul className="mt-5 space-y-3 text-gray-700">
              <li>
                <a
                  href="https://www.argentina.gob.ar/noticias/luis-caputo-anuncio-el-programa-de-licitacion-de-plazos-fijos-con-destino-credito"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-rose-700 underline underline-offset-4"
                >
                  Programa de Licitación de Plazos Fijos con destino a Crédito Hipotecario
                </a>
                : anuncio oficial del Ministerio de Economía, 26 de agosto de 2026. De ahí salen las
                tasas, el tope de 150.000 UVA, el plazo mínimo y el ejemplo de cuota e ingreso.
              </li>
              <li>
                <a
                  href="https://www.youtube.com/watch?v=UBqji4vYMxw"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-rose-700 underline underline-offset-4"
                >
                  Análisis del anuncio por Santiago Magnin
                </a>
                : la conferencia completa y la lectura del impacto en el mercado porteño, que es el
                contrapunto que usamos para el mercado local.
              </li>
              <li>
                <strong>Relevamiento propio de San Martín de los Andes</strong>: valores del m² por
                tipo y rangos intercuartiles, con datos al {DATOS_AL}. Es el mismo dataset que
                alimenta nuestro <Link href="/tasacion" className="font-semibold text-rose-700 underline underline-offset-4">tasador</Link>.
              </li>
            </ul>
          </section>

          <div className="not-prose mt-12 rounded-xl bg-amber-50 p-6 text-sm leading-relaxed text-amber-950">
            <p className="font-bold">Aviso</p>
            <p className="mt-2">
              Este contenido es informativo y no es asesoramiento financiero. Las condiciones
              definitivas de cada línea las fija cada banco y pueden cambiar. Antes de tomar un
              crédito, verificá los términos con la entidad y con un profesional de confianza.
            </p>
          </div>

          <section className="not-prose mt-12 border-t border-gray-100 pt-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              También te puede interesar
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/blog/creditos-hipotecarios-uva-2026" className="rounded-2xl border border-gray-200 p-5 hover:shadow-md">
                <p className="text-xs font-bold uppercase text-rose-600">Guía de compra</p>
                <p className="mt-2 font-bold text-gray-900">Cómo funciona un crédito UVA, paso a paso</p>
              </Link>
              <Link href="/blog/credito-hipotecario-neuquen-2026" className="rounded-2xl border border-gray-200 p-5 hover:shadow-md">
                <p className="text-xs font-bold uppercase text-rose-600">Guía de crédito</p>
                <p className="mt-2 font-bold text-gray-900">El crédito propio de la Provincia del Neuquén</p>
              </Link>
              <Link href="/blog/cuando-el-plano-no-coincide-con-la-casa" className="rounded-2xl border border-gray-200 p-5 hover:shadow-md">
                <p className="text-xs font-bold uppercase text-rose-600">Guía legal</p>
                <p className="mt-2 font-bold text-gray-900">Por qué una casa no llega a ser apta crédito</p>
              </Link>
              <Link href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes" className="rounded-2xl border border-gray-200 p-5 hover:shadow-md">
                <p className="text-xs font-bold uppercase text-rose-600">Precios</p>
                <p className="mt-2 font-bold text-gray-900">¿Cuánto cuesta una casa en San Martín?</p>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
