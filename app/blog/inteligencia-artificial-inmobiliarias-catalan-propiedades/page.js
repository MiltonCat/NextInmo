import Image from "next/image";
import Link from "next/link";
import { SITE_URL, canonicalUrl } from "@/config";
import { blogPosts, fechasDelPost } from "@/lib/blogPosts";
import { RELEVADAS_MODELO_FMT, RELEVADAS_TOTAL_FMT, MERCADO_GENERADO } from "@/lib/mercado";
import SeguirLeyendo from "@/components/SeguirLeyendo";
import PodcastPlayer from "@/components/PodcastPlayer";

const ID = "inteligencia-artificial-inmobiliarias-catalan-propiedades";
const fechas = fechasDelPost(ID);
const post = blogPosts.find((entry) => entry.id === ID);
const url = canonicalUrl(`/blog/${post.id}`);

// Fecha del relevamiento que alimenta el tasador y el precio del m²: sale del
// export del modelo, no se escribe a mano.
const datosAl = (() => {
  const [a, m, d] = String(MERCADO_GENERADO || "").split("-");
  return a && m && d ? `${d}/${m}/${a}` : null;
})();

const fuentes = [
  {
    id: "nar2025",
    title: "NAR: 2025 REALTORS® Technology Survey (18 de septiembre de 2025)",
    href: "https://www.nar.realtor/press-releases/realtors-embrace-ai-digital-tools-to-enhance-client-service-nar-survey-finds",
    detail: "Encuesta de la Asociación Nacional de Realtors de Estados Unidos sobre uso de tecnología e IA en agentes inmobiliarios.",
  },
  {
    id: "nar2026",
    title: "Inman: NAR Technology Report Finds AI Use Among Realtors Climbing (22 de septiembre de 2026)",
    href: "https://www.inman.com/2026/09/22/nar-technology-report-ai-adoption/",
    detail: "Resumen del informe de tecnología 2026 de NAR: frecuencia de uso, tareas, herramientas y barreras.",
  },
  {
    id: "lanacion",
    title: "La Nación: entrevista a Sofía Grinberg sobre IA inmobiliaria (abril de 2026)",
    href: "https://www.lanacion.com.ar/propiedades/inmuebles-comerciales/sofia-grinberg-experta-en-inteligencia-artificial-inmobiliaria-se-logran-resultados-inesperados-en-nid18042026/",
    detail: "Datos de adopción de IA entre profesionales inmobiliarios argentinos citados en la nota.",
  },
  {
    id: "iprofesional",
    title: "iProfesional: cómo funciona AgonProp (26 de septiembre de 2026)",
    href: "https://www.iprofesional.com/realestate/464529-como-funciona-agonprop-la-plataforma-que-automatiza-operaciones-inmobiliarias",
    detail: "Un caso argentino de agente de IA por WhatsApp para inmobiliarias pequeñas y medianas.",
  },
  {
    id: "realtor",
    title: "Florida Realtors: Most Americans Use AI for Housing Market Info (octubre de 2025)",
    href: "https://www.floridarealtors.org/news-media/news-articles/2025/10/most-americans-use-ai-housing-market-info",
    detail: "Encuesta de Realtor.com a 1.000 adultos de Estados Unidos, relevada el 7 y 8 de agosto de 2025.",
  },
  {
    id: "bofa",
    title: "NAR: AI Becomes Early Step in Homebuying Journey (2026)",
    href: "https://www.nar.realtor/news/real-estate-news/technology/ai-becomes-early-step-in-homebuying-journey",
    detail: "Resume el Homebuyer Insights Report 2026 de Bank of America y un relevamiento de Cotality.",
  },
  {
    id: "zillow",
    title: "HousingWire: Zillow y ChatGPT lanzan su integración (6 de octubre de 2025)",
    href: "https://www.housingwire.com/articles/zillow-chatgpt-launch-app-integration/",
    detail: "Búsqueda de propiedades en venta y en alquiler dentro de una conversación de ChatGPT.",
  },
  {
    id: "ab723",
    title: "California AB 723: reglas sobre fotos alteradas digitalmente",
    href: "https://www.amplifiles.ai/blog/ai-virtual-staging-disclosure-laws",
    detail: "Resumen de la ley vigente desde el 1 de enero de 2026 que obliga a declarar las fotos retocadas o amuebladas con IA.",
  },
];
const fuente = (id) => fuentes.find((f) => f.id === id);

export const metadata = {
  title: post.title,
  description: post.excerpt,
  alternates: { canonical: url },
  openGraph: {
    title: post.title,
    description: post.excerpt,
    url,
    type: "article",
    publishedTime: fechas.publicado,
    modifiedTime: fechas.modificado,
    authors: ["Milton Catalán"],
    images: [{ url: `${SITE_URL}${post.image}`, alt: "Una mano robótica y una mano humana a punto de tocarse con la punta de los dedos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: post.title,
    description: post.excerpt,
    images: [`${SITE_URL}${post.image}`],
  },
};

const faqs = [
  ["¿Lucía es ChatGPT?", "No. Lucía usa inteligencia artificial para conversar, pero responde con los datos de Catalán Propiedades: las propiedades publicadas, el relevamiento de precios y lo que está en el sitio, con los criterios de la casa. Si un dato no está, lo dice en vez de completarlo."],
  ["¿El tasador reemplaza una tasación profesional?", "No. Da un rango con datos reales de la zona y muestra su error promedio. No ve el estado de la propiedad, las terminaciones, la humedad ni la documentación: eso lo revisa una persona."],
  ["¿Lucía puede equivocarse?", "Sí, como cualquier sistema de IA. Por eso tiene reglas: no inventa datos, cita la página de donde saca cada dato, no pide ni confirma pagos por el chat y deriva a Milton lo que requiere criterio profesional."],
  ["¿Qué pasa si una foto está modificada con IA?", "Si publicamos una imagen amueblada o modificada digitalmente, la identificamos como tal. La foto tiene que mostrar la propiedad que vas a visitar."],
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `${SITE_URL}${post.image}`,
    datePublished: fechas.publicado,
    dateModified: fechas.modificado,
    author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
    publisher: { "@type": "Organization", name: "Catalán Propiedades", url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    audio: {
      "@type": "AudioObject",
      name: `${post.title} — versión en audio`,
      contentUrl: `${SITE_URL}/podcast/${post.id}.mp3`,
      encodingFormat: "audio/mpeg",
      duration: "PT15M12S",
      inLanguage: "es-AR",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  },
];

function Heading({ id, children }) {
  return <h2 id={id} className="mb-5 mt-12 scroll-mt-28 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">{children}</h2>;
}

function Fuente({ id, children }) {
  const f = fuente(id);
  return <a href={f.href} target="_blank" rel="noopener noreferrer" className="text-rose-700 underline underline-offset-4">{children}</a>;
}

function A({ href, children }) {
  return <Link href={href} className="font-semibold text-rose-700 underline underline-offset-4">{children}</Link>;
}

const herramientas = [
  {
    nombre: "Tasador online",
    href: "/tasacion",
    que: "Un rango de valor para casas y departamentos, con su error promedio a la vista.",
    como: `Modelo propio, entrenado con ${RELEVADAS_MODELO_FMT} casas y departamentos de San Martín de los Andes.`,
    nota: ["/blog/como-tasamos-tu-propiedad-con-datos", "Cómo tasamos tu propiedad con datos"],
  },
  {
    nombre: "Precio del m² por barrio",
    href: "/precio-m2",
    que: "Medianas de precio publicado por barrio y por tipo de propiedad.",
    como: `Relevamiento propio de ${RELEVADAS_TOTAL_FMT} publicaciones${datosAl ? `, con datos al ${datosAl}` : ""}.`,
    nota: ["/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes", "¿Cuánto cuesta una casa en San Martín de los Andes?"],
  },
  {
    nombre: "Inversiones",
    href: "/inversiones",
    que: "Rentabilidad por zona, calculadora de ROI y comparación con otros activos.",
    como: "Los mismos datos del relevamiento, leídos como un inversor lee un activo.",
    nota: ["/blog/score-de-inversion-san-martin-de-los-andes", "Score de inversión: cómo leer una propiedad como un activo"],
  },
  {
    nombre: "Guía de barrios",
    href: "/barrios",
    que: "La ficha de cada barrio: servicios, distancias y qué lo caracteriza.",
    como: "Conocimiento de la zona, ordenado para que sea fácil de comparar.",
    nota: ["/blog/donde-vivir-san-martin-de-los-andes", "¿Dónde vivir en San Martín de los Andes?"],
  },
];

export default function IAInmobiliariasPage() {
  return (
    <>
      {structuredData.map((data) => <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />)}
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10">
          <Link href="/blog" className="text-sm font-semibold text-rose-700 hover:underline">Volver al blog</Link>
          <p className="mb-3 mt-8 text-sm font-bold uppercase tracking-widest text-rose-600">Tecnología · Inteligencia artificial</p>
          <h1 className="hyphens-none text-[2rem] font-black leading-[1.1] text-gray-900 sm:text-4xl md:text-5xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">La mayoría de las inmobiliarias ya usa inteligencia artificial, pero casi siempre para escribir más rápido. Mientras tanto, los compradores empezaron a hacerle a un asistente las preguntas que antes le hacían a un corredor. Qué dicen los datos del sector, qué gana y qué arriesga el que compra o vende, y cómo armamos nuestras propias herramientas en Catalán Propiedades.</p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Image src="/Milton.webp" alt="Milton Catalán" width={64} height={64} className="h-16 w-16 shrink-0 rounded-full border-2 border-rose-200 object-cover" />
            <div>
              <p className="text-sm font-bold text-gray-900">Escrito por Milton Catalán</p>
              <p className="text-xs text-gray-600"><time dateTime={post.dateTime}>30 de septiembre de 2026</time> · {post.readTime} de lectura · Asesor inmobiliario y programador</p>
            </div>
          </div>
          <div className="relative mt-8 aspect-[16/8.43] overflow-hidden rounded-2xl bg-gray-100">
            <Image src={post.image} alt="Una mano robótica y una mano humana a punto de tocarse con la punta de los dedos" fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
          </div>
        </header>

        <PodcastPlayer slug={ID} />

        <div className="text-base leading-relaxed text-gray-700 sm:text-lg [&_p]:mb-5">
          <aside className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">La idea central</p>
            <p className="!mb-0 font-semibold text-gray-900">La IA sirve cuando trabaja sobre datos propios y con reglas claras. Suelta, redacta con seguridad cosas que no sabe. Por eso en Catalán Propiedades la usamos sobre un relevamiento propio del mercado, con límites escritos, y dejando en manos de una persona lo que ningún modelo puede ver.</p>
          </aside>
          <nav aria-label="Contenido del artículo" className="mt-8 border-y border-gray-200 py-5 text-sm">
            <p className="font-bold text-gray-900">En esta nota</p>
            <ol className="grid list-inside list-decimal gap-3 sm:grid-cols-2">
              {[["sector", "Qué hacen las inmobiliarias con la IA"], ["comprador", "El comprador ya pregunta primero a un asistente"], ["balance", "Ventajas y riesgos reales"], ["catalan", "Cómo la usamos en Catalán"], ["lucia", "Lucía: qué hace y qué no"], ["desarrollo", "Cómo lo desarrollamos"], ["humano", "Lo que no delegamos"]].map(([id, label]) => <li key={id}><a href={`#${id}`} className="text-rose-700 underline underline-offset-4">{label}</a></li>)}
            </ol>
          </nav>

          <Heading id="sector">La mayoría de los corredores ya usa IA, sobre todo para escribir</Heading>
          <p>La referencia más completa es la encuesta anual de tecnología de la Asociación Nacional de Realtors de Estados Unidos (NAR). En 2025, el <strong>20% de los agentes usaba herramientas de IA todos los días</strong>, otro 22% todas las semanas y un 32% todavía no las había adoptado. ChatGPT era la herramienta más usada, y el 46% usaba IA para redactar las descripciones de las propiedades. <Fuente id="nar2025">Ver el comunicado de NAR.</Fuente></p>
          <p>El informe 2026 muestra la curva subiendo: <strong>23% de uso diario, 25% semanal y solo 21% que no la usa</strong>. Entre quienes la usan, el 75% escribe con IA las descripciones de las propiedades y el 56% sus publicaciones en redes. El motivo principal, para el 81%, es ahorrar tiempo. Las barreras más citadas son aprender a usarla (63%) y el costo (59%). <Fuente id="nar2026">Ver el resumen de Inman.</Fuente></p>
          <p>En la Argentina la adopción va más atrás. Una nota de La Nación de abril de 2026 cita que <strong>solo el 27% de los profesionales inmobiliarios usa IA</strong> en su trabajo, y que el 94% de quienes ya la usan planea aumentar su uso este año. <Fuente id="lanacion">Leer la nota.</Fuente> Los productos que están creciendo acá se enfocan en la atención: agentes que responden por WhatsApp, cargan propiedades y agendan visitas. Uno de ellos, lanzado en Córdoba en julio de 2026, informaba 35 inmobiliarias usuarias a dos meses de salir. <Fuente id="iprofesional">Ver el caso.</Fuente></p>
          <p>El patrón es claro: <strong>la IA entró a las inmobiliarias como herramienta de productividad</strong>, para escribir más rápido y responder más rápido. Es útil, pero no le cambia nada a quien compra o vende. El cambio de fondo está pasando del otro lado del mostrador.</p>

          <Heading id="comprador">El comprador ya le hace sus preguntas a un asistente antes que a un corredor</Heading>
          <p>En una encuesta de Realtor.com a 1.000 adultos de Estados Unidos que compraron, vendieron o planeaban hacerlo, el <strong>82% dijo usar IA para informarse sobre el mercado inmobiliario</strong>. Aun así, eligieron a los agentes como la fuente más confiable y más precisa. <Fuente id="realtor">Ver la encuesta.</Fuente></p>
          <p>El informe 2026 de Bank of America mide algo más acotado: <strong>uno de cada cinco compradores potenciales y propietarios ya usó IA para investigar sobre la compra de una vivienda</strong>. Entre ellos, el 57% la usó para estimar cuánto puede pagar, cuotas o gastos. El 55% la usó para entender el proceso y el 52% para investigar barrios, tendencias o valores. Más de la mitad sigue prefiriendo a un profesional para visitar propiedades y para lo legal. En otro relevamiento del mismo año, de Cotality, el 44% dijo que pagaría más por un profesional que verifique lo que le dijo la IA. <Fuente id="bofa">Ver el resumen de NAR.</Fuente></p>
          <p>Los portales ya se mudaron a la conversación. Desde el 6 de octubre de 2025 se pueden buscar propiedades de Zillow dentro de ChatGPT, en venta y en alquiler, con preguntas como “¿qué puedo pagar cerca de acá?”. La respuesta trae fotos, mapa y precio, y después deriva al portal para coordinar la visita. <Fuente id="zillow">Ver el lanzamiento.</Fuente></p>
          <p>Eso cambia la forma de comercializar en tres puntos:</p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li><strong>La primera consulta ya no llega al corredor.</strong> Llega a un asistente, y la persona aparece después con un precio en la cabeza que alguien, o algo, le dijo.</li>
            <li><strong>Una propiedad que un asistente no puede leer, para ese comprador, no existe.</strong> Estar publicado ya no alcanza: hay que ser citable, con datos estructurados, fechas y links.</li>
            <li><strong>El valor del corredor se corre hacia lo que la IA no resuelve:</strong> verificar, interpretar el caso concreto y sostener la operación hasta la escritura.</li>
          </ul>

          <Heading id="balance">Qué gana y qué arriesga quien compra o vende</Heading>
          <div className="my-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="text-sm font-black uppercase tracking-wide text-emerald-800">Lo que suma</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                <li>Respuestas a cualquier hora, sin esperar a que alguien conteste.</li>
                <li>Números en minutos: un rango de valor, una cuota, una comparación por barrio.</li>
                <li>Preguntas “tontas” sin vergüenza, que después hacen mejor la conversación con el corredor.</li>
                <li>Más tiempo del profesional para lo que requiere criterio.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-sm font-black uppercase tracking-wide text-amber-800">Lo que arriesga</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                <li>Un modelo general redacta con seguridad datos que no tiene: precios inventados, requisitos que no existen.</li>
                <li>Datos viejos presentados como actuales.</li>
                <li>Fotos retocadas o amuebladas con IA que no muestran la casa real.</li>
                <li>Lo que ningún modelo ve: estado, humedad, ruido, papeles.</li>
              </ul>
            </div>
          </div>
          <p>Lo de las fotos ya llegó a la ley. En California, desde el 1 de enero de 2026, toda foto de una publicación alterada digitalmente, incluido el amueblamiento virtual, tiene que decirlo y dar acceso a la imagen original. <Fuente id="ab723">Ver el resumen de la norma.</Fuente> En la Argentina no hay una regla así, pero el problema es el mismo: la foto crea una expectativa que la visita confirma o destruye.</p>

          <Heading id="catalan">Cómo la usamos en Catalán Propiedades</Heading>
          <p>Para nosotros la IA es una herramienta al servicio de quien compra o vende, no un atajo para producir más texto. La usamos donde aporta claridad: entender un precio, comparar barrios o resolver una duda a cualquier hora. Siempre con información de San Martín de los Andes que se puede verificar.</p>
          <div className="my-8 grid gap-4 sm:grid-cols-2">
            {herramientas.map((h) => (
              <div key={h.href} className="rounded-2xl border border-gray-200 p-6">
                <Link href={h.href} className="text-lg font-black text-gray-900 hover:text-rose-700">{h.nombre}</Link>
                <p className="mt-2 text-base">{h.que}</p>
                <p className="mt-2 text-sm text-gray-600">{h.como}</p>
                <p className="mt-3 text-sm">Para entenderla: <A href={h.nota[0]}>{h.nota[1]}</A></p>
              </div>
            ))}
          </div>
          <p><strong>El tasador</strong> te da una primera referencia de valor en minutos, como un rango y no como un número cerrado, para que sepas desde dónde partir. Lo que solo se ve en persona, como el estado o las terminaciones, lo completamos nosotros en la visita. <A href="/tasacion">Probá el tasador</A>.</p>
          <p>El <strong>precio del m² por barrio</strong> y la sección <strong>Inversiones</strong> salen del mismo relevamiento, y siempre aclaran que son precios publicados, no precios de cierre. Con eso se pueden responder preguntas concretas: cuánto cuesta una casa, cuánto rinde un alquiler o si <A href="/blog/dolar-construccion-comprar-o-construir">conviene comprar o construir</A>, con un método y no con una intuición.</p>

          <Heading id="lucia">Lucía: qué hace y qué no hace</Heading>
          <p>Lucía es la asistente del sitio. Usa inteligencia artificial para conversar, pero lo que la distingue no es el modelo sino los datos y las reglas con los que trabaja.</p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li><strong>Responde con datos propios.</strong> Habla de las propiedades que están publicadas hoy y de los precios relevados en la zona. Si una propiedad ya no está publicada, no la ofrece.</li>
            <li><strong>Cita la fuente.</strong> Cuando usa un dato, nombra la nota o la sección de donde sale y deja el link, así podés ir a verificarlo.</li>
            <li><strong>Habla con el criterio de la casa.</strong> Somos una empresa familiar, y la medida de una operación no es firmarla, es la vida que la persona hace después en esa propiedad.</li>
            <li><strong>Tiene límites escritos.</strong> No inventa datos, no pide ni confirma pagos por el chat, y lo que requiere criterio profesional lo deriva a una persona.</li>
            <li><strong>Explica tu tasación.</strong> Dentro del tasador, podés preguntarle por qué te dio ese rango o cómo se compara tu m² con la mediana del barrio.</li>
          </ul>
          <p>Cuando Lucía no puede responder bien una pregunta, eso nos marca qué nota falta en este blog.</p>

          <Heading id="desarrollo">Cómo lo desarrollamos</Heading>
          <p>Todo esto lo construimos nosotros. Trabajo en la venta de propiedades y también soy programador, y eso nos permitió diseñar cada herramienta desde las preguntas reales de quienes compran y venden acá, en vez de adaptar un producto genérico. El sitio, el modelo del tasador y Lucía se escribieron y se ajustan en casa, con cuatro reglas:</p>
          <ol className="mb-6 list-decimal space-y-3 pl-6">
            <li><strong>Nunca inventar un dato.</strong> Si una información no está confirmada, queda vacía. Una ficha incompleta es mejor que una ficha falsa.</li>
            <li><strong>Primero los datos, después la IA.</strong> El modelo conversa sobre el relevamiento; no lo reemplaza.</li>
            <li><strong>Mostrar la incertidumbre.</strong> Rangos en vez de números mágicos, errores promedio a la vista y fechas en cada dato.</li>
            <li><strong>Probar antes de publicar.</strong> Cada cambio en las herramientas pasa por pruebas antes de llegar al sitio.</li>
          </ol>
          <p>Pensamos el sitio también para los asistentes de IA, no solo para las personas. Si un comprador le pregunta a una IA por San Martín de los Andes, queremos que la respuesta salga de datos verificados, con fecha y link.</p>

          <Heading id="humano">Lo que no delegamos</Heading>
          <p>Hay tres cosas que ninguna herramienta resuelve y que siguen siendo nuestro trabajo:</p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li><strong>La visita.</strong> El estado de una casa, la luz, el ruido y cómo se vive en invierno se ven en persona.</li>
            <li><strong>Los papeles.</strong> La documentación, la reserva, la seña y el boleto los revisa Carolina Godoy, abogada matriculada y socia de la inmobiliaria. Algunos de esos problemas los contamos en <A href="/blog/cuando-el-plano-no-coincide-con-la-casa">Cuando el plano no coincide con la casa</A> y en <A href="/blog/sena-reserva-compraventa-inquilino">Seña o reserva</A>.</li>
            <li><strong>La decisión.</strong> La IA puede ordenar opciones. Elegir dónde vivir o en qué invertir sigue siendo una conversación entre personas.</li>
          </ul>
          <p>La inteligencia artificial no reemplaza al corredor, pero sí cambia lo que se espera de él. Menos intermediar información y más verificarla, interpretarla y hacerse responsable de ella. Construimos nuestras herramientas para eso.</p>

          <aside className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
            <h2 className="mb-3 text-xl font-black text-gray-900">Probá las herramientas</h2>
            <p>Tasá tu propiedad, mirá el precio del m² de tu barrio o preguntale a Lucía lo que quieras saber de San Martín de los Andes.</p>
            <div className="flex flex-wrap gap-3 text-sm font-bold">
              <Link href="/tasacion" className="rounded-lg bg-rose-700 px-5 py-3 text-white hover:bg-rose-800">Tasar mi propiedad</Link>
              <Link href="/precio-m2" className="rounded-lg border border-rose-300 bg-white px-5 py-3 text-rose-800 hover:bg-rose-100">Ver el precio del m²</Link>
              <Link href="/inversiones" className="rounded-lg border border-rose-300 bg-white px-5 py-3 text-rose-800 hover:bg-rose-100">Analizar una inversión</Link>
            </div>
          </aside>

          <Heading>Preguntas frecuentes</Heading>
          {faqs.map(([question, answer]) => <div key={question} className="mb-6 border-b border-gray-200 pb-4"><h3 className="mb-2 text-lg font-bold text-gray-900">{question}</h3><p className="!mb-0">{answer}</p></div>)}

          <Heading>Fuentes y alcance de la nota</Heading>
          <p>Fuentes consultadas el 30 de septiembre de 2026. Las cifras de adopción provienen en su mayoría de Estados Unidos, donde se mide con más regularidad. Los datos locales citados son de medios nacionales. La descripción de las herramientas de Catalán Propiedades corresponde a cómo funcionan a la fecha de publicación.</p>
          <ul className="mb-6 space-y-4 text-sm">
            {fuentes.map((f) => <li key={f.href}><a href={f.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-rose-700 underline underline-offset-4">{f.title}</a><span className="mt-1 block text-gray-600">{f.detail}</span></li>)}
          </ul>
        </div>
        <SeguirLeyendo slug="inteligencia-artificial-inmobiliarias-catalan-propiedades" destacados={["como-tasamos-tu-propiedad-con-datos", "score-de-inversion-san-martin-de-los-andes"]} />
      </article>
    </>
  );
}
