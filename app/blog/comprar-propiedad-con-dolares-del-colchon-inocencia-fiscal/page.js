import Image from "next/image";
import Link from "next/link";
import PodcastPlayer from "@/components/PodcastPlayer";
import SeguirLeyendo from "@/components/SeguirLeyendo";
import { SITE_URL, canonicalUrl } from "@/config";
import { blogPosts, fechasDelPost } from "@/lib/blogPosts";

const SLUG = "comprar-propiedad-con-dolares-del-colchon-inocencia-fiscal";
const fechas = fechasDelPost(SLUG);
const post = blogPosts.find((entry) => entry.id === SLUG);
const url = canonicalUrl(`/blog/${SLUG}`);
const image = `${SITE_URL}${post.image}`;
const carolinaImage = "/carolina-godoy.jpeg";

// Fuentes consultadas el 19/10/2026. La norma es la Ley 27.826 (Boletín Oficial
// del 09/10/2026), que incorpora el art. 40 bis a la Ley 27.799. Las citas del
// articulado salen del texto transcripto por Tristán y Asociados; el resto, de
// notas periodísticas que lo resumen. No hay cifras propias del mercado local.
const sources = [
  {
    title: "Tristán y Asociados: principales cambios que introduce la Ley 27.826",
    href: "https://tristanyasociados.com/2026/10/inocencia-fiscal-ii-principales-cambios-que-introduce-la-ley-27826/",
    detail: "Transcribe el art. 7 de la Ley 27.826, que incorpora el art. 40 bis a la Ley 27.799 (escrituras, bancarización y Bienes Personales), y el art. 3 (quiénes pueden adherir).",
  },
  {
    title: "Infobae: el Gobierno reglamentó la ley de Inocencia Fiscal II (09/10/2026)",
    href: "https://www.infobae.com/economia/2026/10/09/el-gobierno-reglamento-la-ley-de-inocencia-fiscal-ii-como-se-aplicara-la-norma-que-busca-sacar-los-dolares-del-colchon/",
    detail: "Pagos en efectivo en escrituras, plazo al 31/12/2027 y plazo de 15 días hábiles para la UIF.",
  },
  {
    title: "iProfesional: qué cambia para los ahorristas y qué podrá revisar ARCA (14/10/2026)",
    href: "https://www.iprofesional.com/impuestos/466489-inocencia-fiscal-ii-que-cambia-para-los-ahorristas-y-que-podra-revisar-arca",
    detail: "Cuándo ARCA puede impugnar una declaración: la “discrepancia significativa”.",
  },
  {
    title: "La Nación: qué cambia para quienes quieren usar los dólares del colchón para comprar una propiedad",
    href: "https://www.lanacion.com.ar/propiedades/inmuebles-comerciales/inocencia-fiscal-ii-que-cambia-para-quienes-quieren-usar-los-dolares-del-colchon-para-comprar-una-nid23092026/",
    detail: "Quiénes pueden adherir al régimen simplificado y el rol del escribano como sujeto obligado.",
  },
  {
    title: "El Cronista: comprar una casa con los dólares del colchón sin problemas con ARCA (30/06/2026)",
    href: "https://www.cronista.com/economia-politica/comprar-una-casa-con-los-dolares-del-colchon-como-hacerlo-sin-tener-problemas-con-arca/",
    detail: "Cómo era antes de la reforma: la primera Ley de Inocencia Fiscal no cubría Bienes Personales.",
  },
];

const faqs = [
  [
    "¿Puedo pagar una propiedad en efectivo con dólares no declarados?",
    "Si adheriste al régimen simplificado de Ganancias, la ley considera cumplida la exigencia de bancarización para los pagos en efectivo hechos al otorgar una escritura pública sobre un inmueble. La protección rige para los fondos usados hasta el 31 de diciembre de 2027.",
  ],
  [
    "¿ARCA me puede reclamar Bienes Personales de años anteriores por esos dólares?",
    "La ley establece que, para Bienes Personales, esos fondos se consideran incorporados a tu patrimonio el día en que se hace la operación. Esa es la regla que busca evitar reclamos por períodos anteriores. Desde ese día, la propiedad integra tu patrimonio como cualquier otro bien.",
  ],
  [
    "¿Cualquier comprador puede usarlo?",
    "No. Es para personas humanas y sucesiones indivisas residentes en el país que optaron por el régimen simplificado de Ganancias y cumplen sus condiciones. Un monotributista que no está inscripto en Ganancias no puede usarlo sin pasar al régimen general. Los Grandes Contribuyentes y ciertos funcionarios pueden adherir con efectos limitados.",
  ],
  [
    "¿El escribano igual me va a pedir justificar el origen de los fondos?",
    "La ley dice que la adhesión al régimen es un antecedente favorable para quienes deben prevenir el lavado de activos, pero aclara que esos sujetos mantienen sus deberes de debida diligencia. La UIF tenía 15 días hábiles desde la publicación para dictar la norma que define cómo se aplica.",
  ],
  [
    "¿Hasta cuándo tengo tiempo?",
    "El tratamiento especial para Bienes Personales y para los pagos en escrituras rige hasta el 31 de diciembre de 2027. Los fondos que no se usen hasta esa fecha no quedan alcanzados por esta regla.",
  ],
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image,
    datePublished: fechas.publicado,
    dateModified: fechas.modificado,
    author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
    publisher: { "@type": "Organization", name: "Catalán Propiedades", url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  },
];

export const metadata = {
  title: { absolute: "Comprar una propiedad con dólares del colchón: qué cambia con Inocencia Fiscal II" },
  description:
    "La Ley 27.826 considera los dólares usados para comprar un inmueble incorporados al patrimonio el día de la operación y evita reclamos retroactivos de Bienes Personales. Requisitos, plazo y qué sigue controlando el escribano.",
  keywords:
    "dólares del colchón comprar propiedad, inocencia fiscal II, ley 27826, bienes personales retroactivo, pago en efectivo escritura, régimen simplificado ganancias inmueble",
  openGraph: {
    title: post.title,
    description: "Los dólares que usás para comprar un inmueble cuentan como incorporados a tu patrimonio el día de la escritura. Quién puede usarlo y hasta cuándo.",
    url,
    type: "article",
    publishedTime: fechas.publicado,
    modifiedTime: fechas.modificado,
    authors: ["Milton Catalán"],
    images: [{ url: image, width: 1200, height: 630, alt: "Billetes de cien dólares con un candado junto a una casa de metal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dólares del colchón y compra de propiedades: qué cambió",
    description: "Bienes Personales sin reclamos de años anteriores, efectivo en la escritura y plazo hasta 2027.",
    images: [image],
  },
  alternates: { canonical: url },
};

function Heading({ children }) {
  return <h2 className="mb-5 mt-12 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">{children}</h2>;
}

export default function DolaresColchonPropiedadPage() {
  return (
    <>
      {structuredData.map((data) => (
        <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
      ))}
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10">
          <Link href="/blog" className="text-sm font-semibold text-rose-700 hover:underline">Volver al blog</Link>
          <p className="mb-3 mt-8 text-sm font-bold uppercase tracking-widest text-rose-600">Guía legal · Impuestos</p>
          <h1 className="hyphens-none text-[2rem] font-black leading-[1.1] text-gray-900 sm:text-4xl md:text-5xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
            Mucha gente tiene ahorros en dólares fuera del banco y no los usa para comprar por miedo a que, después de la escritura, ARCA le pregunte de dónde salieron y le reclame impuestos de años anteriores. La Ley 27.826 cambió una parte importante de esa cuenta.
          </p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Image src="/Milton.webp" alt="Milton Catalán" width={64} height={64} className="h-16 w-16 shrink-0 rounded-full border-2 border-rose-200 object-cover" />
            <div>
              <p className="text-sm font-bold text-gray-900">Escrito por Milton Catalán</p>
              <p className="text-xs text-gray-600"><time dateTime={post.dateTime}>19 de octubre de 2026</time> · {post.readTime} de lectura · Asesor inmobiliario en San Martín de los Andes</p>
            </div>
          </div>
          <div className="relative mt-8 aspect-[16/8.43] overflow-hidden rounded-2xl bg-gray-100">
            <Image src={post.image} alt="Billetes de cien dólares con un candado junto a una casa de metal" fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
          </div>
          <p className="mt-2 text-right text-xs text-gray-400">Foto: Freepik</p>
        </header>

        <PodcastPlayer slug={SLUG} />

        <div className="text-base leading-relaxed text-gray-700 sm:text-lg [&_p]:mb-5">
          <aside className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">La idea central</p>
            <p className="!mb-0 font-semibold text-gray-900">
              Si adheriste al régimen simplificado de Ganancias, los dólares que uses para comprar un inmueble hasta el 31 de diciembre de 2027 se consideran incorporados a tu patrimonio el día de la operación. Eso es lo que evita que el uso de esos dólares se lea como una tenencia oculta en años anteriores y te reclamen Bienes Personales por esos períodos.
            </p>
          </aside>

          <Heading>Qué problema resuelve</Heading>
          <p>
            La primera Ley de Inocencia Fiscal (Ley 27.799), vigente desde enero de 2026, ya permitía usar fondos no declarados en una compraventa de inmuebles. Pero tenía un hueco: su protección alcanzaba a Ganancias e IVA y <strong>no a Bienes Personales</strong>. Quien aparecía comprando una casa con dólares que nunca había declarado quedaba expuesto a que se le reclamara ese impuesto por los años en que, en teoría, ya los tenía.
          </p>
          <p>
            La reforma, conocida como Inocencia Fiscal II, se aprobó en el Senado el 17 de septiembre y se publicó en el Boletín Oficial el 9 de octubre de 2026 como Ley 27.826. Su artículo 7 agrega a la ley anterior el artículo 40 bis, que es el que importa para quien compra una propiedad.
          </p>

          <Heading>Lo que dice la ley, en tres partes</Heading>
          <div className="my-8 space-y-4">
            {[
              [
                "El efectivo en la escritura cuenta como bancarizado",
                "Los adheridos al régimen simplificado tienen que canalizar sus operaciones por el sistema financiero. La ley da esa exigencia por cumplida para los pagos en efectivo hechos al otorgar escrituras públicas que constituyan, modifiquen, declaren o extingan derechos reales sobre inmuebles.",
              ],
              [
                "Para Bienes Personales, los fondos aparecen el día de la operación",
                "Hasta el 31 de diciembre de 2027, esos fondos “se considerarán como bienes incorporados al patrimonio del contribuyente en el día en que se efectúe la operación”. No se presume que los tenías el año pasado ni el anterior.",
              ],
              [
                "Se limitan las presunciones de ARCA",
                "Durante ese mismo período, la ley excluye la aplicación de las presunciones de los incisos f y g del artículo 18 de la Ley 11.683 de Procedimiento Tributario, que son herramientas de ARCA para determinar ingresos que no se declararon.",
              ],
            ].map(([title, text], i) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-gray-50 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-black text-white">{i + 1}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="!mb-0 mt-1 leading-relaxed text-gray-700">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <Heading>Quién puede usarlo y quién no</Heading>
          <p>
            No es una regla para cualquier comprador. Vale para <strong>personas humanas y sucesiones indivisas residentes en el país</strong> que optaron por el régimen simplificado de Ganancias. La reforma eliminó los topes de ingresos y de patrimonio que tenía la primera versión.
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6">
            <li><strong>Empleados, jubilados, autónomos</strong> y quienes combinan monotributo con Ganancias pueden adherir.</li>
            <li><strong>Un monotributista que no está inscripto en Ganancias</strong> no puede usarlo sin dejar el monotributo e inscribirse en el régimen general.</li>
            <li><strong>Grandes Contribuyentes Nacionales y ciertos funcionarios públicos</strong> pueden adherir solo para presentar y pagar la declaración, sin el resto de los efectos.</li>
            <li>Hay que ser <strong>residente fiscal durante todo el período</strong> declarado, salvo para quienes optan por el período 2025.</li>
          </ul>
          <p>
            Adherir no alcanza: la protección depende también de presentar la declaración jurada en término y pagar. Ese paso lo resuelve tu contador antes de la escritura, no después.
          </p>

          <Heading>Lo que no cambia</Heading>
          <p>
            <strong>El escribano sigue controlando.</strong> La ley dice que la adhesión al régimen es un “antecedente favorable” para quienes deben prevenir el lavado de activos, pero deja expresamente vigentes sus deberes de debida diligencia. Le dio a la UIF 15 días hábiles desde la publicación para emitir la norma que define cómo se aplica. El alcance concreto de ese “antecedente favorable” depende de esa norma.
          </p>
          <p>
            <strong>ARCA puede revisar si hay una discrepancia significativa.</strong> La presunción de exactitud no es un cheque en blanco: cae si un ajuste aumenta el impuesto determinado en un 15% o más y supera el 5% del monto de la evasión simple, hoy $5.000.000, o ante facturas apócrifas. La reforma pone la carga de la prueba en ARCA.
          </p>
          <p>
            <strong>Hay fecha de vencimiento.</strong> Todo esto rige para los fondos usados hasta el 31 de diciembre de 2027.
          </p>

          <Heading>Cómo ordenar la compra</Heading>
          <p>
            Si estás pensando en comprar en San Martín de los Andes con ahorros que no están en el banco, el orden importa más que la velocidad:
          </p>
          <ol className="mb-6 list-decimal space-y-2 pl-6">
            <li><strong>Antes de señar,</strong> confirmá con tu contador que podés adherir al régimen simplificado y que estás al día con la declaración y el pago.</li>
            <li><strong>Hablá con el escribano antes de la firma</strong> para saber qué documentación te va a pedir sobre el origen de los fondos.</li>
            <li><strong>Revisá la seña y el boleto:</strong> qué se paga en cada etapa y qué parte se paga en efectivo en la escritura. La regla protege los pagos hechos <em>al otorgar la escritura</em>.</li>
            <li><strong>Tené en cuenta el plazo</strong> si la operación es en cuotas o con posesión diferida.</li>
          </ol>
          <p>
            Si vendés, esto te interesa por otra razón: hay compradores con dólares que hasta ahora no se animaban a usarlos. Conviene que tu escribano y tu contador revisen cómo te afecta recibir el pago en efectivo, porque la norma está pensada desde quien usa los fondos.
          </p>

          <section className="mt-14 rounded-2xl border border-rose-200 bg-rose-50 p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white"><Image src={carolinaImage} alt="Carolina Godoy" fill sizes="80px" className="object-cover" /></div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">¿Estás por comprar o vender?</h2>
                <p className="mt-2 leading-relaxed text-gray-700">Carolina Godoy, abogada y socia de Catalán Propiedades, te ayuda a ordenar la reserva, la seña, el boleto y la escritura en San Martín de los Andes. La parte impositiva la resuelve tu contador.</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
                  <Link href="/propiedades" className="rounded-xl bg-rose-600 px-4 py-2 text-white">Ver propiedades en venta</Link>
                  <Link href="/contacto" className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-rose-700">Consultar mi caso</Link>
                </div>
              </div>
            </div>
          </section>

          <Heading>Preguntas frecuentes</Heading>
          {faqs.map(([question, answer]) => (
            <div key={question} className="mb-6 border-b border-gray-200 pb-4">
              <h3 className="mb-2 text-lg font-bold text-gray-900">{question}</h3>
              <p className="!mb-0">{answer}</p>
            </div>
          ))}

          <Heading>Fuentes y alcance de la nota</Heading>
          <p>
            Fuentes consultadas el 19 de octubre de 2026. La norma es la Ley 27.826, publicada en el Boletín Oficial el 9 de octubre de 2026, que incorpora el artículo 40 bis a la Ley 27.799. Esta nota explica la regla general; no analiza situaciones particulares ni reemplaza el asesoramiento de un contador o escribano.
          </p>
          <ul className="mb-6 space-y-4 text-sm">
            {sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-rose-700 underline underline-offset-4">{source.title}</a>
                <span className="mt-1 block text-gray-600">{source.detail}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-xl bg-amber-50 p-6 text-sm leading-relaxed text-amber-950">
            <p className="!mb-0 font-bold">Aviso legal</p>
            <p className="!mb-0 mt-2">Este contenido es informativo. La aplicación del régimen depende de la situación fiscal de cada persona y de las normas complementarias de ARCA y la UIF. Antes de operar, consultá a tu contador y al escribano interviniente.</p>
          </div>
        </div>
        <SeguirLeyendo slug="comprar-propiedad-con-dolares-del-colchon-inocencia-fiscal" destacados={["sena-reserva-compraventa-inquilino", "comprar-en-san-martin-de-los-andes-desde-buenos-aires"]} />
      </article>
    </>
  );
}
