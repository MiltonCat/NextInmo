import Image from "next/image";
import Link from "next/link";
import { SITE_URL, canonicalUrl } from "@/config";
import PodcastPlayer from "@/components/PodcastPlayer";

const ARTICLE_PATH = "/blog/cuando-el-plano-no-coincide-con-la-casa";
const ARTICLE_URL = canonicalUrl(ARTICLE_PATH);
const ARTICLE_IMAGE = `${SITE_URL}/eme1.jpg`;
const LEY_26209_URL =
  "https://www.argentina.gob.ar/normativa/nacional/ley-26209-142573/texto";
const LEY_2217_URL =
  "http://www.saij.gob.ar/2217-local-neuquen-crea-catastro-territorial-provincia-lns0006094-2007-11-19/123456789-0abc-490-6000-2107soterced";
const CAROLINA_IMAGE = "/carolina-godoy.jpeg";
const CAROLINA_PHONE_DISPLAY = "2944-630649";
const CAROLINA_PHONE_HREF = "tel:2944630649";
const CAROLINA_LINKEDIN_URL = "https://www.linkedin.com/in/cjgodoy/";

export const metadata = {
  title:
    "Cuando el plano no coincide con la casa: qué pasa al vender en Neuquén | Catalán Propiedades",
  description:
    "Guía legal de Carolina Godoy sobre construcciones no declaradas y su efecto en la venta: certificado catastral, Ley 26.209, Ley provincial 2217, tipos de discrepancia y cómo resolverla antes de firmar el boleto.",
  keywords:
    "certificado catastral neuquen, ley 26209, ley 2217 neuquen, construccion no declarada, mensura san martin de los andes, regularizar plano vivienda, escrituracion neuquen, carolina godoy",
  openGraph: {
    title: "Cuando el plano no coincide con la casa: el problema que aparece siempre al vender",
    description:
      "Certificado catastral, Ley 26.209, Ley provincial 2217 y los tres tipos de discrepancia entre lo construido y lo declarado, explicados antes de que frenen tu venta.",
    url: ARTICLE_URL,
    type: "article",
    publishedTime: "2026-07-24T00:00:00-03:00",
    modifiedTime: "2026-07-24T00:00:00-03:00",
    authors: ["Carolina Godoy"],
    images: [
      {
        url: ARTICLE_IMAGE,
        width: 1200,
        height: 630,
        alt: "San Martín de los Andes y guía legal de catastro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuando el plano no coincide con la casa (Neuquén, 2026)",
    description:
      "Por qué el certificado catastral frena la venta cuando lo construido no coincide con lo declarado, y cómo resolverlo a tiempo.",
    images: [ARTICLE_IMAGE],
  },
  alternates: { canonical: ARTICLE_URL },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Cuando el plano no coincide con la casa: el problema que aparece siempre al vender",
  description:
    "Guía jurídica sobre construcciones no declaradas, el certificado catastral y su efecto en la escrituración, con la Ley 26.209 y la Ley provincial 2217 de Neuquén.",
  image: ARTICLE_IMAGE,
  datePublished: "2026-07-24",
  dateModified: "2026-07-24",
  author: {
    "@type": "Person",
    name: "Carolina Godoy",
    image: `${SITE_URL}${CAROLINA_IMAGE}`,
    telephone: CAROLINA_PHONE_DISPLAY,
    sameAs: [CAROLINA_LINKEDIN_URL],
  },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logoMC.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": ARTICLE_URL },
  // Versión escuchada del artículo (ver components/PodcastPlayer).
  audio: {
    "@type": "AudioObject",
    name: "Cuando el plano no coincide con la casa — versión en audio",
    contentUrl: `${SITE_URL}/podcast/cuando-el-plano-no-coincide-con-la-casa.mp3`,
    encodingFormat: "audio/mpeg",
    duration: "PT17M49S",
    inLanguage: "es-AR",
  },
};

const faqItems = [
  {
    question: "¿Está prohibido escriturar si hay construcciones no declaradas?",
    answer:
      "No exactamente. La Ley 26.209 no prohíbe escriturar sin certificado catastral, pero exige que el escribano lo tenga a la vista y transcriba sus observaciones en la escritura (art. 12), y bloquea la inscripción registral definitiva si el certificado no se acompaña (art. 13). En la práctica, una escritura que no se inscribe no transmite el derecho real, así que el efecto es equivalente a un freno.",
  },
  {
    question: "¿Dónde queda expuesta la diferencia entre lo construido y lo declarado?",
    answer:
      "En las observaciones del certificado catastral, que refleja el estado parcelario registrado en la Dirección Provincial de Catastro e Información Territorial de Neuquén. Si lo construido no coincide con lo declarado, el escribano está obligado a transcribirlo, conforme al art. 62 de la Ley provincial 2217.",
  },
  {
    question: "¿Toda diferencia se resuelve de la misma manera?",
    answer:
      "No. Superficie construida no declarada se regulariza por vía administrativa (declaración de mejoras y regularización municipal). Diferencias de superficie de terreno o linderos requieren mensura de un agrimensor matriculado, y si hay invasión con un vecino, el problema pasa a ser de dominio, no solo catastral. Un estado parcelario vencido o inexistente impide directamente que se emita el certificado.",
  },
  {
    question: "¿Qué pasa si hay un crédito hipotecario de por medio?",
    answer:
      "El banco tasa la propiedad real, pero presta contra la propiedad documentada. Esa diferencia entre lo que existe y lo que figura en los papeles suele ser el punto exacto donde la operación se cae, porque el banco no puede constituir la garantía sobre metros que no están declarados.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

function LawLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 hover:text-rose-800"
    >
      {children}
    </a>
  );
}

const discrepancias = [
  {
    numero: "01",
    titulo: "Superficie construida no declarada",
    resumen: "La más común y la más manejable.",
    detalle:
      "Se regulariza por vía administrativa: declaración de mejoras ante Catastro provincial y regularización municipal. El costo principal es tributario, con reliquidación de Impuesto Inmobiliario y posibles multas.",
  },
  {
    numero: "02",
    titulo: "Diferencia en superficie de terreno o linderos",
    resumen: "Cambia de naturaleza: ya no alcanza con una declaración.",
    detalle:
      "Requiere mensura de un agrimensor matriculado, aprobada por Catastro. Si la diferencia es mínima y se explica por precisión de instrumentos, se rectifica administrativamente. Si hay invasión o superposición con un vecino, el problema pasó de ser catastral a ser de dominio, y puede necesitar escritura de rectificación con acuerdo de partes o acción judicial.",
  },
  {
    numero: "03",
    titulo: "Estado parcelario vencido o inexistente",
    resumen: "Sin esto, no hay certificado posible.",
    detalle:
      "El art. 11 de la Ley 26.209 exige que el estado parcelario esté determinado o verificado y con plazo de vigencia no expirado para poder emitir el certificado en una transmisión de derechos reales. Sin estado parcelario vigente, hay que hacer mensura antes de cualquier acto de disposición.",
  },
];

const costos = [
  "Honorarios de agrimensor.",
  "Aranceles de Catastro provincial.",
  "Tasas municipales de regularización.",
  "Diferencias de Impuesto Inmobiliario, con eventuales multas e intereses.",
  "El costo del tiempo: los trámites administrativos y la aprobación de mensura no se resuelven en días.",
];

export default function CuandoElPlanoNoCoincideConLaCasaPage() {
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

      <article className="min-h-screen bg-white">
        <header className="border-b border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20">
            <Link
              href="/blog"
              className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-rose-600"
            >
              <span aria-hidden="true">←</span> Volver al blog
            </Link>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-rose-600">
              Guía legal · Catastro
            </p>
            <h1 className="mb-6 text-4xl font-black leading-tight text-gray-900 md:text-6xl">
              Cuando el plano no coincide con la casa: el problema que aparece siempre al vender
            </h1>
            <p className="max-w-3xl text-xl leading-relaxed text-gray-600">
              Es una de las situaciones más frecuentes en operaciones inmobiliarias en Neuquén, y casi
              siempre aparece tarde: con el boleto firmado, la seña cobrada y una fecha de escrituración
              pactada.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-7">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-rose-100">
                <Image
                  src={CAROLINA_IMAGE}
                  alt="Carolina Godoy"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-gray-900">Carolina Godoy</p>
                <p className="text-sm text-gray-500">
                  Autora · 24 de julio de 2026 · 8 min de lectura
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Versión escuchada — no se muestra si el post no tiene audio registrado */}
        <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
          <PodcastPlayer slug="cuando-el-plano-no-coincide-con-la-casa" />
        </div>

        <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
            <Image
              src="/eme1.jpg"
              alt="Vista aérea de San Martín de los Andes entre montañas y lago"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-gray-800">
              <p className="font-bold text-rose-800">Idea central</p>
              <p className="mt-2">
                La casa que hoy existe no siempre es la casa que figura en los registros oficiales. Mientras
                nadie mire, no pasa nada. El problema aparece cuando llega la venta.
              </p>
            </div>
          </div>

          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-black text-gray-900">Qué pasa realmente</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-700">
              <p>
                Una propiedad se construye siguiendo un plano aprobado. Con los años se cierra una galería,
                se agrega un quincho, se convierte el garaje en un dormitorio, se levanta una habitación en
                planta alta. Nada de eso se declara. La casa que hoy existe no es la casa que figura en los
                registros oficiales.
              </p>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-black text-gray-900">Por qué frena la operación</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-700">
              <p>
                El <LawLink href={LEY_26209_URL}>art. 12 de la Ley Nacional 26.209</LawLink> establece que en
                los actos por los que se constituyen, transmiten, declaran o modifican derechos reales sobre
                inmuebles debe tenerse a la vista la certificación catastral habilitante y relacionar su
                contenido en el cuerpo de la escritura. El{" "}
                <LawLink href={LEY_26209_URL}>art. 13</LawLink> agrega que, sin ese certificado acompañado a la
                documentación, no procede la inscripción definitiva en el Registro de la Propiedad Inmueble.
                En Neuquén, el <LawLink href={LEY_2217_URL}>art. 62 de la Ley provincial 2217</LawLink> replica
                la exigencia: escribanos, jueces y demás funcionarios deben requerir el Certificado Catastral
                habilitante antes de autorizar el acto.
              </p>
              <p>
                Conviene ser preciso acá, porque suele explicarse mal: la ley no prohíbe escriturar sin
                certificado. Lo que hace es exigir que el escribano lo tenga a la vista y transcriba sus
                observaciones, y bloquear la inscripción registral definitiva si falta. El resultado práctico
                es equivalente —una escritura que no se inscribe no transmite el derecho real— pero el
                mecanismo es ese.
              </p>
              <p>
                ¿Dónde queda expuesta la discrepancia? En las observaciones del certificado catastral. El
                certificado refleja el estado parcelario que consta en la Dirección Provincial de Catastro e
                Información Territorial. Si lo construido no coincide con lo declarado, eso figura, el
                escribano está obligado a transcribirlo, y ahí la operación se detiene.
              </p>
              <p>
                A esto se suma el <LawLink href={LEY_26209_URL}>art. 11</LawLink> de la misma ley: para
                expedir el certificado en ocasión de una transmisión de derechos reales, el estado parcelario
                debe estar determinado o verificado y su plazo de vigencia no puede haber expirado. Sin estado
                parcelario vigente, directamente no hay certificado que emitir.
              </p>
              <p>
                Al frente administrativo se agrega el municipal, que exige el final de obra correspondiente a
                lo efectivamente construido. Y si hay hipoteca de por medio, el banco tasa la propiedad real
                pero presta contra la propiedad documentada. Esa diferencia suele ser el punto donde la
                operación se cae.
              </p>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="mb-2 text-3xl font-black text-gray-900">
              Los tres tipos de discrepancia (no son lo mismo)
            </h2>
            <p className="mb-8 text-gray-500">Cada uno se resuelve distinto, con distinto costo y plazo.</p>
            <div className="space-y-5">
              {discrepancias.map((item) => (
                <div key={item.numero} className="rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 text-2xl font-black leading-none text-rose-600">
                      {item.numero}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{item.titulo}</h3>
                      <p className="mt-1 text-sm font-semibold text-rose-700">{item.resumen}</p>
                      <p className="mt-3 leading-relaxed text-gray-700">{item.detalle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-3xl bg-gray-900 p-8 text-white md:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">El costo real</p>
            <h2 className="mt-3 text-3xl font-black">Lo que hay que presupuestar</h2>
            <p className="mt-4 text-gray-300">
              Los números concretos dependen del caso y conviene consultarlos actualizados, pero el esquema de
              erogaciones es siempre el mismo:
            </p>
            <ul className="mt-6 space-y-3 text-base leading-relaxed text-gray-200">
              {costos.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="font-black text-rose-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-gray-300">
              Y hay un costo que casi nadie contabiliza: el comprador que se cansa de esperar y se va.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-black text-gray-900">La recomendación</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-700">
              <p>
                <strong>Si vas a vender:</strong> pedí el certificado catastral y comparalo con lo que hay
                construido antes de publicar la propiedad. Es incómodo descubrir el problema en ese momento,
                pero es infinitamente más barato que descubrirlo con un boleto firmado.
              </p>
              <p>
                <strong>Si vas a comprar:</strong> exigí ver plano aprobado, certificado catastral y final de
                obra. Recorré la propiedad con el plano en la mano. Lo que veas y no esté dibujado va a ser un
                problema, y la pregunta clave es quién lo va a pagar.
              </p>
              <p>
                <strong>Si el problema ya apareció:</strong> que la responsabilidad de regularizar y el plazo
                queden expresamente en el boleto. Un boleto que no dice quién regulariza es un conflicto
                esperando a ocurrir.
              </p>
            </div>
          </section>

          <section className="mt-14 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
            <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-rose-100 shadow-md">
              <Image
                src={CAROLINA_IMAGE}
                alt="Carolina Godoy"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <h2 className="mt-5 text-2xl font-black text-gray-900">Carolina Godoy</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-700">
              Consultas sobre regularización catastral y discrepancias entre plano y construcción.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={CAROLINA_PHONE_HREF}
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-6 py-3 font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
              >
                Llamar al {CAROLINA_PHONE_DISPLAY}
              </a>
              <a
                href={CAROLINA_LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-rose-300 bg-white px-6 py-3 font-bold text-rose-700 transition-colors hover:bg-rose-100"
              >
                Ver perfil en LinkedIn
              </a>
            </div>
          </section>

          <section className="mt-14 rounded-2xl bg-gray-50 p-8">
            <h2 className="text-2xl font-black text-gray-900">Fuentes normativas</h2>
            <ul className="mt-5 space-y-3 text-gray-700">
              <li>
                <LawLink href={LEY_26209_URL}>Ley Nacional 26.209 de Catastro, texto oficial</LawLink>,
                sitio oficial Argentina.gob.ar.
              </li>
              <li>
                <LawLink href={LEY_2217_URL}>Ley provincial 2217, Catastro Territorial de Neuquén</LawLink>,
                texto oficial.
              </li>
            </ul>
          </section>

          <section className="mt-14 bg-gray-50 rounded-2xl p-8">
            <h2 className="mb-7 text-3xl font-black text-gray-900">Preguntas frecuentes</h2>
            <div className="space-y-6">
              {faqItems.map(({ question, answer }) => (
                <div key={question}>
                  <h3 className="text-lg font-bold text-gray-900">{question}</h3>
                  <p className="mt-2 leading-relaxed text-gray-700">{answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-12 rounded-xl bg-amber-50 p-6 text-sm leading-relaxed text-amber-950">
            <p className="font-bold">Aviso legal</p>
            <p className="mt-2">
              Este contenido es informativo y no reemplaza el asesoramiento profesional. Cada situación
              requiere análisis particular por escribano, agrimensor o abogado según corresponda.
            </p>
          </div>

          <section className="mt-12 border-t border-gray-100 pt-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              También te puede interesar
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/blog/alquileres-san-martin-de-los-andes-2026"
                className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-rose-600">Guía legal</p>
                <p className="mt-2 font-bold text-gray-900">
                  Alquileres en San Martín de los Andes 2026: qué revisar antes de firmar
                </p>
              </Link>
              <Link
                href="/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires"
                className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
                  Guía para compradores
                </p>
                <p className="mt-2 font-bold text-gray-900">
                  Cómo comprar en San Martín de los Andes desde Buenos Aires
                </p>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
