import Image from "next/image";
import Link from "next/link";
import { SITE_URL, canonicalUrl } from "@/config";
import PodcastPlayer from "@/components/PodcastPlayer";

const ARTICLE_PATH = "/blog/alquileres-san-martin-de-los-andes-2026";
const ARTICLE_URL = canonicalUrl(ARTICLE_PATH);
const ARTICLE_IMAGE = `${SITE_URL}/volcan-lanin.png`;
const CCYC_URL =
  "https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975/actualizacion";
const DNU_URL =
  "https://www.argentina.gob.ar/normativa/nacional/decreto-70-2023-395521/texto";
const CAROLINA_IMAGE = "/carolina-godoy.jpeg";
const CAROLINA_PHONE_DISPLAY = "2944-630649";
const CAROLINA_PHONE_HREF = "tel:2944630649";
const CAROLINA_LINKEDIN_URL = "https://www.linkedin.com/in/cjgodoy/";

export const metadata = {
  title:
    "Alquileres en San Martín de los Andes 2026: guía legal antes de firmar | Catalán Propiedades",
  description:
    "Guía jurídica de Carolina Godoy sobre contratos de alquiler permanente y temporario en San Martín de los Andes: Código Civil y Comercial, cláusulas esenciales y jurisprudencia real de Neuquén.",
  keywords:
    "contrato alquiler san martin de los andes, abogado alquileres neuquen, alquiler temporario neuquen, codigo civil comercial locacion, jurisprudencia alquileres neuquen, carolina godoy",
  openGraph: {
    title: "Alquileres en San Martín de los Andes: qué revisar antes de firmar",
    description:
      "Plazo, actualización, reparaciones, gastos, llaves y garantías, explicados con el Código Civil y Comercial y fallos reales de la Justicia de Neuquén.",
    url: ARTICLE_URL,
    type: "article",
    publishedTime: "2026-07-17T00:00:00-03:00",
    modifiedTime: "2026-07-17T00:00:00-03:00",
    authors: ["Carolina Godoy"],
    images: [
      {
        url: ARTICLE_IMAGE,
        width: 1200,
        height: 630,
        alt: "San Martín de los Andes y guía jurídica de alquileres",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alquileres en San Martín de los Andes: guía legal 2026",
    description:
      "Qué revisar antes de firmar: cláusulas, Código Civil y Comercial y jurisprudencia real de Neuquén.",
    images: [ARTICLE_IMAGE],
  },
  alternates: { canonical: ARTICLE_URL },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Alquileres en San Martín de los Andes 2026: qué revisar antes de firmar",
  description:
    "Guía jurídica sobre contratos de alquiler permanente y temporario, con artículos del Código Civil y Comercial y jurisprudencia de la Provincia del Neuquén.",
  image: ARTICLE_IMAGE,
  datePublished: "2026-07-17",
  dateModified: "2026-07-17",
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
};

const faqItems = [
  {
    question: "¿El contrato de alquiler debe hacerse por escrito?",
    answer:
      "Sí. El artículo 1188 del Código Civil y Comercial exige forma escrita para el contrato de locación de inmueble y para sus prórrogas y modificaciones.",
  },
  {
    question: "¿Las partes pueden elegir el plazo y la forma de actualización?",
    answer:
      "La regulación vigente permite acordar el plazo, la moneda, el índice y la periodicidad de actualización, dentro de los límites generales del ordenamiento. Es indispensable que la cláusula sea clara y verificable.",
  },
  {
    question: "¿El inquilino debe pagar todas las expensas y todos los impuestos?",
    answer:
      "No necesariamente. El contrato debe individualizar con claridad qué expensas asume cada parte. Según el artículo 1209, el locatario puede asumir las expensas derivadas de gastos habituales vinculados con servicios normales y permanentes, aunque el consorcio las denomine ordinarias o extraordinarias. La libertad contractual ampliada por el DNU 70/2023 opera dentro de los límites legales y no convierte por sí sola una carga que grava la propiedad o un gasto extraordinario no habitual en obligación del inquilino.",
  },
  {
    question: "¿Seguir pagando después del vencimiento renueva automáticamente el contrato?",
    answer:
      "No. El artículo 1218 establece que no hay tácita reconducción: la locación continúa en los mismos términos hasta que una de las partes la dé por concluida mediante comunicación fehaciente.",
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

const cases = [
  {
    title: "Pozzebon Ezequiel Isaac c/ Arévalo Mauro Germán",
    detail:
      "Cámara de Apelaciones en lo Civil, Comercial, Laboral y de Minería de Neuquén, Sala II, “Pozzebon Ezequiel Isaac c/ Arévalo Mauro Germán s/ D. y P. derivados de la responsabilidad contractual de particulares”, JNQCI1, expediente 545866/2021, sentencia del 24 de julio de 2024. Jueces: Patricia Clerici y José Noacco. Secretaria: Micaela Rosales.",
    lesson:
      "El tribunal valoró el texto del contrato, la operación conectada y la prueba testimonial para determinar que existía una finalidad temporaria real. El caso enseña que el título elegido por las partes no reemplaza la prueba del destino efectivo.",
    href: "https://gestion.abognqn.org/index.php/Paperless/descargar_archivo/2/21582",
  },
  {
    title: "Antorena Verónica Patricia c/ Brandinu Elsa y otros",
    detail:
      "Cámara de Apelaciones en lo Civil, Comercial, Laboral y de Minería de Neuquén, Sala II, “Antorena Verónica Patricia c/ Brandinu Elsa y otros s/ cobro de alquileres”, JNQJE2, expediente 688323/2022, sentencia del 25 de octubre de 2023. Jueces: Patricia Clerici y José Noacco. Secretaria: Sandra Andrade.",
    lesson:
      "Se admitió ejecutar la penalidad por restitución tardía sin intimación previa porque la cláusula fijaba con claridad su exigibilidad desde el vencimiento. La precisión de la cláusula cambió el resultado.",
    href: "https://gestion.abognqn.org/index.php/Paperless/descargar_archivo/2/3466",
  },
  {
    title: "Temossi Teresa del Carmen c/ Paolinelli Ernesto Atilio",
    detail:
      "Cámara de Apelaciones en lo Civil, Comercial, Laboral y de Minería de Neuquén, Sala III, “Temossi Teresa del Carmen c/ Paolinelli Ernesto Atilio s/ desalojo por finalización de contrato de locación”, JNQCI6, expediente 518223/2017, sentencia del 7 de junio de 2018. Jueces: Marcelo Juan Medori y Fernando Marcelo Ghisini. Secretaria: Audelina Torrez.",
    lesson:
      "La permanencia y la recepción de pagos después del vencimiento no probaron un contrato nuevo: operó la continuación prevista por el artículo 1218 del Código Civil y Comercial.",
    href: "https://gestion.abognqn.org/index.php/Paperless/descargar_archivo/2/6794",
  },
  {
    title: "Gómez Weiss Carlos c/ Provincia del Neuquén y otro",
    detail:
      "Cámara de Apelaciones en lo Civil, Comercial, Laboral y de Minería de Neuquén, Sala I, “Gómez Weiss Carlos c/ Provincia del Neuquén y otro s/ D. y P. derivados de la responsabilidad contractual del Estado”, JNQCI5, expediente 501577/2014, sentencia del 15 de febrero de 2018. Jueces: Cecilia Pamphile y Jorge Pascuarelli. Secretaria: Estefanía Martiarena.",
    lesson:
      "Al resolver sobre el deterioro del inmueble, la Cámara ponderó el anexo inventario, la prueba pericial y el desarrollo completo de la relación. Documentar el estado inicial no es un detalle: es prueba.",
    href: "https://gestion.abognqn.org/index.php/Paperless/descargar_archivo/2/17655",
  },
];

function LawLink({ articles, children }) {
  return (
    <a
      href={CCYC_URL}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 hover:text-rose-800"
    >
      {articles ? `Arts. ${articles} del CCyC` : children}
    </a>
  );
}

export default function AlquileresGuiaLegalPage() {
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
              Guía legal · Alquileres
            </p>
            <h1 className="mb-6 text-4xl font-black leading-tight text-gray-900 md:text-6xl">
              Alquileres en San Martín de los Andes 2026: qué revisar antes de firmar
            </h1>
            <p className="max-w-3xl text-xl leading-relaxed text-gray-600">
              El precio importa, pero el contrato define quién paga, quién repara,
              cómo se actualiza el alquiler y qué ocurre cuando la relación termina.
              Esta guía explica los puntos críticos con normas vigentes y fallos
              reales de la Justicia de Neuquén.
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
                  Autora · 17 de julio de 2026 · 10 min de lectura
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Versión escuchada — no se muestra si el post no tiene audio registrado */}
        <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
          <PodcastPlayer slug="alquileres-san-martin-de-los-andes-2026" />
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-950 sm:aspect-[16/10]">
            <Image
              src="/volcan-lanin.png"
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="scale-110 object-cover opacity-40 blur-2xl"
            />
            <div className="absolute inset-0 bg-slate-950/20" aria-hidden="true" />
            <Image
              src="/volcan-lanin.png"
              alt="Volcán nevado en la Patagonia"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <p>
              En San Martín de los Andes conviven alquileres para vivienda permanente,
              contratos temporarios vinculados con el turismo y acuerdos pensados para
              estadías laborales o personales concretas. Esa diversidad vuelve
              especialmente importante que el contrato describa la realidad y no se
              limite a usar una etiqueta.
            </p>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-gray-800">
              <p className="font-bold text-rose-800">Idea central</p>
              <p className="mt-2">
                Un buen contrato no elimina todos los conflictos, pero reduce las zonas
                grises y deja mejor preparada la prueba si el desacuerdo llega a una
                instancia judicial.
              </p>
            </div>
          </div>

          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-black text-gray-900">
              Libertad contractual: lo firmado obliga
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-700">
              <p>
                El Código Civil y Comercial reconoce que las partes pueden determinar
                el contenido del contrato dentro de los límites de la ley, el orden
                público, la moral y las buenas costumbres. Una vez celebrado válidamente,
                el acuerdo obliga y debe ejecutarse de buena fe. Estas reglas surgen de
                los <LawLink articles="958, 959 y 961" />.
              </p>
              <p>
                En locaciones de inmuebles, además, el contrato, sus prórrogas y sus
                modificaciones deben instrumentarse por escrito, conforme el{
                " "
                }<LawLink articles="1188" />. Por eso no conviene confiar en promesas
                verbales sobre arreglos, aumentos, mascotas, devolución del depósito o
                fecha de entrega.
              </p>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-black text-gray-900">
              Qué pueden acordar hoy las partes
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-700">
              <p>
                La regulación vigente permite acordar el plazo. Si no se fija uno, el{
                " "
                }<LawLink articles="1198" /> establece plazos supletorios: dos años
                para vivienda permanente y tres años para otros destinos, con reglas
                especiales para usos temporarios y los que correspondan por usos y
                costumbres.
              </p>
              <p>
                También pueden pactarse moneda, índice y periodicidad de actualización
                según el <LawLink articles="1199" />. El depósito, la garantía y la
                periodicidad de pago se rigen por el <LawLink articles="1196" />. Que
                exista libertad no significa que alcance con escribir “se actualizará”:
                hay que definir el índice, la fuente, la fecha base, la frecuencia, la
                moneda y qué sucede si el indicador deja de publicarse.
              </p>
              <p className="text-base text-gray-600">
                El régimen fue modificado por el{
                " "
                }<a
                  href={DNU_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4"
                >
                  DNU 70/2023
                </a>
                . La ley aplicable a un contrato concreto depende, entre otros factores,
                de la fecha en que fue celebrado; una reforma posterior no modifica
                automáticamente todo acuerdo anterior.
              </p>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-black text-gray-900">
              Permanente o temporario: el nombre no alcanza
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-700">
              <p>
                Si la locación es temporaria, el contrato debería explicar el motivo
                concreto de la transitoriedad y ser coherente con la duración, el destino
                y la prueba disponible. Llamar “temporario” a un vínculo destinado en
                los hechos a vivienda estable puede abrir una discusión judicial.
              </p>
              <p>
                En <strong>Pozzebon c/ Arévalo</strong>, la Sala II de la Cámara de
                Apelaciones de Neuquén no se quedó solo con el título del documento:
                examinó el contrato, una operación vinculada y testimonios para concluir
                que existía una finalidad temporal real. El contrato allí analizado era
                de 2021, anterior al régimen actual; se cita por su enseñanza probatoria,
                no como una aplicación de las reformas de 2023.
              </p>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="mb-8 text-3xl font-black text-gray-900">
              Seis cláusulas que merecen una revisión cuidadosa
            </h2>
            <div className="space-y-8">
              <div className="rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-black uppercase tracking-widest text-rose-600">
                  01 · Destino
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Para qué se entrega el inmueble
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  Debe decir si será vivienda, alquiler turístico, actividad profesional
                  u otro uso, y contemplar reglamentos de copropiedad y habilitaciones.
                  Los <LawLink articles="1194 y 1205" /> regulan destino y uso conforme
                  a lo convenido.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-black uppercase tracking-widest text-rose-600">
                  02 · Precio y actualización
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Una fórmula que cualquiera pueda verificar
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  Conviene individualizar precio inicial, moneda, medio y lugar de pago,
                  índice, fuente, fecha base, periodicidad, redondeos y mecanismo
                  alternativo. La ambigüedad sobre el aumento suele convertirse en el
                  primer conflicto.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-black uppercase tracking-widest text-rose-600">
                  03 · Estado y reparaciones
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Inventario, fotografías y procedimiento de aviso
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  Los <LawLink articles="1200, 1201, 1206 y 1207" /> distribuyen deberes
                  sobre entrega, conservación y reparaciones. El contrato debería sumar
                  inventario firmado, fotografías fechadas, medidores, defectos existentes
                  y un canal para denunciar urgencias. En <strong>Gómez Weiss</strong>,
                  la Cámara valoró el anexo inventario y la pericia al decidir sobre daños.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-black uppercase tracking-widest text-rose-600">
                  04 · Gastos, tasas y expensas
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Definir con precisión qué expensas paga cada parte
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  El DNU 70/2023 amplió la libertad contractual mediante el{
                  " "
                  }<LawLink articles="958" />, por lo que resulta especialmente
                  importante individualizar en el contrato los servicios, tasas y
                  expensas que asume cada parte. Sin embargo, esa libertad opera dentro
                  de los límites de la ley y el DNU no modificó el{
                  " "
                  }<LawLink articles="1209" />. Esta norma permite poner a cargo del
                  locatario las expensas derivadas de gastos habituales vinculados con
                  servicios normales y permanentes, aun cuando el consorcio las denomine
                  ordinarias o extraordinarias. La etiqueta contable no decide por sí
                  sola: una expensa llamada “extraordinaria” puede corresponder al
                  inquilino si cubre un servicio habitual; una obra o carga no habitual
                  que grava la propiedad no se vuelve exigible solo por incluirla en una
                  cláusula genérica.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-black uppercase tracking-widest text-rose-600">
                  05 · Terminación y llaves
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Fecha, inspección, restitución y recepción
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  Los <LawLink articles="1210, 1218 y 1222" /> regulan restitución,
                  continuación luego del vencimiento y recepción de llaves. En{
                  " "
                  }<strong>Temossi</strong>, seguir ocupando y pagando no creó por sí
                  solo un contrato nuevo. En <strong>Antorena</strong>, una cláusula
                  precisa permitió exigir la penalidad por restitución tardía desde el
                  vencimiento, sin una intimación previa adicional.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-black uppercase tracking-widest text-rose-600">
                  06 · Garantías y fiadores
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Alcance, vigencia y renovación expresa
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-700">
                  El <LawLink articles="1225" /> dispone, como regla, que la obligación
                  del fiador cesa al vencimiento, salvo por la falta de restitución en
                  tiempo. Para una renovación o prórroga se requiere consentimiento
                  expreso; no alcanza una extensión anticipada y genérica.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-14 rounded-3xl bg-gray-900 p-8 text-white md:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
              Checklist antes de firmar
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Diez preguntas para hacerle al contrato
            </h2>
            <ol className="mt-7 space-y-3 text-base leading-relaxed text-gray-200">
              {[
                "¿El destino escrito coincide con el uso real?",
                "¿El plazo y la fecha de entrega están determinados?",
                "¿La actualización tiene índice, fuente, base y frecuencia?",
                "¿Cada gasto está individualizado y correctamente asignado?",
                "¿Existe inventario con fotos, medidores y defectos preexistentes?",
                "¿Hay un procedimiento claro para reparaciones urgentes?",
                "¿Se regula la devolución del depósito y su plazo?",
                "¿La recepción de llaves queda documentada?",
                "¿Las penalidades indican desde cuándo son exigibles?",
                "¿Fiadores y garantes conocen exactamente el alcance asumido?",
              ].map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="font-black text-rose-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-14">
            <h2 className="mb-5 text-3xl font-black text-gray-900">
              El valor del asesoramiento preventivo
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-700">
              <p>
                Revisar un contrato antes de firmarlo permite detectar contradicciones,
                completar cláusulas y ordenar la prueba cuando todavía hay margen para
                negociar. Cuando el conflicto ya empezó, las opciones suelen ser más
                costosas y limitadas.
              </p>
              <p>
                La revisión debe ser individual: influyen el destino, la fecha, la
                documentación, las partes, el inmueble y la normativa local aplicable.
                Una plantilla general no reemplaza ese análisis.
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
            <h2 className="mt-5 text-2xl font-black text-gray-900">
              Carolina Godoy
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-700">
              Consultas sobre revisión y redacción de contratos de locación.
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

          <section className="mt-14">
            <h2 className="mb-6 text-3xl font-black text-gray-900">
              Jurisprudencia de la Provincia del Neuquén citada
            </h2>
            <div className="space-y-5">
              {cases.map((caseItem) => (
                <article
                  key={caseItem.title}
                  className="rounded-2xl border border-gray-200 p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {caseItem.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {caseItem.detail}
                  </p>
                  <p className="mt-3 leading-relaxed text-gray-700">
                    <strong>Qué aporta:</strong> {caseItem.lesson}
                  </p>
                  <a
                    href={caseItem.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 hover:text-rose-800"
                  >
                    Consultar sentencia oficial en PDF
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-2xl bg-gray-50 p-8">
            <h2 className="text-2xl font-black text-gray-900">Fuentes normativas</h2>
            <ul className="mt-5 space-y-3 text-gray-700">
              <li>
                <a
                  href={CCYC_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4"
                >
                  Código Civil y Comercial de la Nación, texto actualizado
                </a>
                , sitio oficial Argentina.gob.ar.
              </li>
              <li>
                <a
                  href={DNU_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4"
                >
                  Decreto de Necesidad y Urgencia 70/2023, texto oficial
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="mt-14 bg-gray-50 rounded-2xl p-8">
            <h2 className="mb-7 text-3xl font-black text-gray-900">
              Preguntas frecuentes
            </h2>
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
              Este artículo es informativo, refleja una explicación general a la fecha
              de publicación y no constituye asesoramiento jurídico para un caso
              concreto. La solución puede variar según la fecha del contrato, su texto,
              la prueba y las circunstancias particulares. Antes de firmar o adoptar
              una decisión, consultá con un profesional habilitado.
            </p>
          </div>

          <section className="mt-12 border-t border-gray-100 pt-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              También te puede interesar
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/blog/cuanto-rinde-alquiler-temporario-san-martin-de-los-andes"
                className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
                  Inversión
                </p>
                <p className="mt-2 font-bold text-gray-900">
                  Cuánto rinde un alquiler temporario en San Martín de los Andes
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
