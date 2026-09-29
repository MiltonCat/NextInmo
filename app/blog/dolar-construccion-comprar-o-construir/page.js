import Image from "next/image";
import Link from "next/link";
import PodcastPlayer from "@/components/PodcastPlayer";
import { SITE_URL, canonicalUrl } from "@/config";
import { blogPosts, fechasDelPost } from "@/lib/blogPosts";
import SeguirLeyendo from "@/components/SeguirLeyendo";

const fechas = fechasDelPost("dolar-construccion-comprar-o-construir");

const post = blogPosts.find((entry) => entry.id === "dolar-construccion-comprar-o-construir");
const url = canonicalUrl(`/blog/${post.id}`);
const sources = [
  {
    title: "INDEC: costo de la construcción, agosto de 2026",
    href: "https://www.indec.gob.ar/uploads/informesdeprensa/icc_09_26FEFC2E3F64.pdf",
    detail: "Variaciones de costos en el Gran Buenos Aires. No es una cotización por m² para San Martín de los Andes.",
  },
  {
    title: "Colegio de Arquitectos, Distrito 1: metodología del índice APYMECO",
    href: "https://caubauno.org/indice-apymeco/",
    detail: "Describe la región y el edificio utilizado como modelo para elaborar ese indicador.",
  },
  {
    title: "Municipalidad de San Martín de los Andes: instructivos",
    href: "https://wpsmandes.neuquen.gob.ar/instructivos/",
    detail: "Documentación y ordenadores urbanísticos para consultar la viabilidad de un proyecto local.",
  },
];

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
    images: [{ url: `${SITE_URL}${post.image}`, alt: "Una pareja revisa el presupuesto para su vivienda" }],
  },
  twitter: {
    card: "summary_large_image",
    title: post.title,
    description: post.excerpt,
    images: [`${SITE_URL}${post.image}`],
  },
};

const faqs = [
  ["¿Hoy es más barato comprar que construir en San Martín de los Andes?", "No hay una respuesta general respaldada por los datos de esta nota. Hay que comparar una propiedad concreta con un terreno y un presupuesto de obra equivalentes, incorporando todos los gastos."],
  ["¿El costo de construcción incluye el terreno?", "Depende del presupuesto. Una cotización de obra por m² puede excluir terreno, proyecto, permisos, conexiones y otros gastos. Hay que pedir el detalle escrito de lo incluido y lo excluido."],
  ["¿Si ya tengo el lote puedo contarlo como costo cero?", "Para calcular el dinero que te falta desembolsar, no necesitás comprarlo otra vez. Para comparar el patrimonio que destinás a cada alternativa, sí corresponde considerar su valor actual y la posibilidad de venderlo."],
  ["¿Las casas tienen que subir si aumenta el costo de construir?", "No necesariamente. El costo de reposición influye en la oferta nueva, pero el precio de una vivienda existente también depende de la demanda, la ubicación, el estado y las condiciones de la operación."],
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
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  },
];

// Importes inventados para explicar el método, no estimaciones del mercado local.
// La casa comprada incluye su lote; en construcción se muestra por separado.
const example = [
  ["Casa terminada / ejecución de la obra", 215_000, 150_000],
  ["Terreno", 0, 40_000],
  ["Gastos de adquisición", 15_000, 4_000],
  ["Proyecto y permisos", 0, 12_000],
  ["Preparación del terreno y conexiones", 0, 10_000],
  ["Arreglos previstos", 5_000, 0],
  ["Reserva para imprevistos", 3_000, 15_000],
  ["Alquiler adicional durante la obra", 0, 6_000],
];
const totals = [1, 2].map((column) => example.reduce((total, row) => total + row[column], 0));
const dollars = (value) => `USD ${value.toLocaleString("es-AR")}`;
function Heading({ id, children }) {
  return <h2 id={id} className="mb-5 mt-12 scroll-mt-28 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">{children}</h2>;
}

export default function ComprarOConstruirPage() {
  return (
    <>
      {structuredData.map((data) => <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />)}
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10">
          <Link href="/blog" className="text-sm font-semibold text-rose-700 hover:underline">Volver al blog</Link>
          <p className="mb-3 mt-8 text-sm font-bold uppercase tracking-widest text-rose-600">Mercado · Economía y vivienda</p>
          <h1 className="hyphens-none text-[2rem] font-black leading-[1.1] text-gray-900 sm:text-4xl md:text-5xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">Si los materiales y los salarios aumentan en pesos mientras el dólar se mueve menos, construir puede encarecerse en dólares. Pero una casa ya construida no cambia de precio al mismo ritmo. ¿Cómo se compara una alternativa con la otra y qué hay que mirar en San Martín de los Andes?</p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Image src="/Milton.webp" alt="Milton Catalán" width={64} height={64} className="h-16 w-16 shrink-0 rounded-full border-2 border-rose-200 object-cover" />
            <div>
              <p className="text-sm font-bold text-gray-900">Escrito por Milton Catalán</p>
              <p className="text-xs text-gray-600"><time dateTime={post.dateTime}>26 de septiembre de 2026</time> · {post.readTime} de lectura · Asesor inmobiliario en San Martín de los Andes</p>
            </div>
          </div>
          <div className="relative mt-8 aspect-[16/8.43] overflow-hidden rounded-2xl bg-gray-100">
            <Image src={post.image} alt="Una pareja revisa documentos y cuentas para su vivienda" fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
          </div>
        </header>

        <PodcastPlayer slug={post.id} />

        <div className="text-base leading-relaxed text-gray-700 sm:text-lg [&_p]:mb-5">
          <aside className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">La idea central</p>
            <p className="!mb-0 font-semibold text-gray-900">Puede haber propiedades cuyo precio sea menor que el costo de hacer una vivienda equivalente desde cero. Eso no demuestra que todo el mercado esté barato ni que los precios vayan a subir. La cuenta útil compara el costo total y las características de cada alternativa.</p>
          </aside>
          <nav aria-label="Contenido del artículo" className="mt-8 border-y border-gray-200 py-5 text-sm">
            <p className="font-bold text-gray-900">En esta nota</p>
            <ol className="grid list-inside list-decimal gap-3 sm:grid-cols-2">
              {[["dolar", "Por qué puede subir el costo en dólares"], ["precios", "Por qué las casas no suben igual"], ["comparacion", "La cuenta completa"], ["san-martin", "Qué cambia en San Martín"], ["decidir", "Qué pedir antes de decidir"]].map(([id, label]) => <li key={id}><a href={`#${id}`} className="text-rose-700 underline underline-offset-4">{label}</a></li>)}
            </ol>
          </nav>

          <Heading id="dolar">El dólar puede moverse poco y la obra seguir aumentando</Heading>
          <p>En el mercado inmobiliario argentino es habitual comparar viviendas en dólares, mientras buena parte de los gastos de obra se paga en pesos. Para ponerlos en la misma unidad hay que convertir esos gastos con un tipo de cambio definido y una fecha concreta.</p>
          <p className="rounded-xl bg-gray-100 p-5 font-semibold text-gray-900">Costo en dólares = costo en pesos ÷ pesos necesarios para obtener un dólar.</p>
          <p>Un ejemplo matemático: si un mismo presupuesto aumenta 10% en pesos y el tipo de cambio no cambia, su equivalente en dólares también aumenta 10%. Si el dólar aumenta 5%, el costo en dólares sube aproximadamente 4,8%. Son variaciones hipotéticas para explicar la relación, no un pronóstico cambiario.</p>
          <p>La expresión <strong>“dólar quieto” describe ese escenario</strong>: costos que crecen más que el tipo de cambio elegido. No supone que todas las cotizaciones del dólar estén inmóviles hoy ni que todos los rubros de obra aumenten igual. Una inflación menor también puede significar que los costos suben más despacio, sin que hayan bajado.</p>
          <p>Como referencia reciente, el INDEC informó que el costo de la construcción en el <strong>Gran Buenos Aires aumentó 2,5% en agosto de 2026</strong> respecto de julio. Materiales subió 1,7%; mano de obra, 3,2%; y gastos generales, 2,2%. El informe fue publicado el 16 de septiembre. <a href={sources[0].href} target="_blank" rel="noopener noreferrer" className="text-rose-700 underline underline-offset-4">Ver informe del INDEC.</a></p>
          <p>Ese índice mide la evolución de costos en su área de cobertura. <strong>No dice cuánto cuesta construir una casa en San Martín de los Andes</strong> ni permite concluir, por sí solo, que acá conviene comprar. Para eso hacen falta presupuestos locales y propiedades comparables.</p>

          <Heading id="precios">El costo de construir y el precio de una casa son cuentas distintas</Heading>
          <p>El costo de reposición es lo que demandaría producir hoy una vivienda equivalente. El precio de una propiedad existente es lo que un comprador y un vendedor aceptan en una operación. En esa negociación pesan la ubicación, el estado, la oferta disponible, los ingresos, el acceso al crédito y la necesidad de vender.</p>
          <p>Por eso, un aumento de los materiales no se traslada automáticamente a las casas publicadas. Si los compradores no pueden pagar más, el propietario puede sostener el precio, negociar o esperar. El costo de obra no funciona como un piso obligatorio del mercado.</p>
          <p>Para quien desarrolla viviendas, una brecha entre costos y precios de venta puede reducir el margen esperado. Si la cuenta deja de cerrar, puede postergar un proyecto o revisar su escala. Eso podría afectar la oferta futura, pero no determina cuándo ni cuánto cambiarán los precios: también intervienen la demanda y la financiación.</p>
          <p>Comprar por debajo del costo de reposición puede ser un dato interesante. Aun así, una vivienda con problemas constructivos, una ubicación poco conveniente o gastos importantes pendientes puede absorber esa diferencia. El ahorro inicial necesita sobrevivir a una revisión técnica y documental.</p>

          <Heading id="comparacion">Comparar el precio de una casa con el valor de la obra deja gastos afuera</Heading>
          <p>Una casa terminada suele ofrecer terreno y construcción en un mismo precio. Un presupuesto de obra puede cubrir solamente la ejecución. Antes de dividir por metros cuadrados, verificá qué incluye cada número y si estás comparando superficies cubiertas con el mismo criterio.</p>
          <p>En construcción, la cuenta puede sumar lote, gastos de adquisición, proyecto, permisos, preparación del suelo, conexiones, obra, terminaciones, impuestos y honorarios que no estén incluidos, además de una reserva para imprevistos. También importa el alquiler que seguís pagando mientras esperás y el costo de financiar cada etapa.</p>
          <p>En una compra, agregá los gastos de la operación, reparaciones necesarias y una reserva acorde con el diagnóstico técnico. Pedí que un profesional detalle los gastos aplicables al caso: no conviene usar un porcentaje genérico como si fuera una liquidación definitiva.</p>
          <p><strong>El siguiente ejemplo es completamente hipotético.</strong> Los importes fueron elegidos para mostrar el método; no son precios, cotizaciones ni estimaciones de San Martín. Supongamos viviendas equivalentes y una compra disponible para habitar. No hay financiación y todos los valores están expresados en dólares de una misma fecha.</p>
          <div className="my-7 overflow-x-auto rounded-xl border border-gray-200" role="region" aria-label="Ejemplo hipotético de costo total" tabIndex={0}>
            <table className="w-full min-w-[580px] text-left text-sm">
              <caption className="bg-gray-50 px-5 py-4 text-left font-semibold text-gray-800">Ejemplo didáctico: importes ficticios en USD</caption>
              <thead className="bg-gray-900 text-white"><tr>{["Concepto", "Comprar", "Construir"].map((label) => <th key={label} scope="col" className="px-5 py-3 font-semibold">{label}</th>)}</tr></thead>
              <tbody>{example.map(([label, buy, build], index) => <tr key={label} className={index % 2 ? "bg-gray-50" : "bg-white"}>
                <th scope="row" className="border-t border-gray-100 px-5 py-4 font-semibold text-gray-900">{label}</th>
                <td className="border-t border-gray-100 px-5 py-4 tabular-nums">{label === "Terreno" ? "Incluido en la casa" : dollars(buy)}</td>
                <td className="border-t border-gray-100 px-5 py-4 tabular-nums">{dollars(build)}</td>
              </tr>)}</tbody>
              <tfoot className="bg-rose-50 font-bold text-gray-900"><tr><th scope="row" className="px-5 py-4">Presupuesto total con reservas</th>{totals.map((total, index) => <td key={index} className="px-5 py-4 tabular-nums">{dollars(total)}</td>)}</tr></tfoot>
            </table>
          </div>
          <p>Mirando sólo la primera fila, la obra parece USD 65.000 más barata. Al sumar todo, las alternativas quedan a USD 1.000 de distancia: una diferencia demasiado pequeña para sacar una conclusión firme frente a los imprevistos. Las reservas son dinero previsto, no gastos que necesariamente se van a consumir.</p>
          <p>Si ya tenés el lote, distinguí dos preguntas. Para saber cuánto efectivo necesitás, no lo comprás otra vez. Para evaluar qué patrimonio destinás al proyecto, su valor actual cuenta: podrías venderlo y usar ese dinero en otra alternativa. El precio que pagaste años atrás no reemplaza esa comparación.</p>

          <Heading id="san-martin">En San Martín, el terreno y el proyecto pueden cambiar toda la cuenta</Heading>
          <p>Un presupuesto de otra ciudad sirve para entender cómo se ordenan los rubros, pero no para cotizar automáticamente una vivienda acá. El índice APYMECO, por ejemplo, utiliza un edificio de departamentos en el Gran La Plata como modelo. Esa tipología y esa región no equivalen a una casa sobre un lote de montaña. <a href={sources[1].href} target="_blank" rel="noopener noreferrer" className="text-rose-700 underline underline-offset-4">Consultar su metodología.</a></p>
          <p>Para un proyecto local conviene revisar, con el arquitecto y los técnicos que correspondan:</p>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li><strong>Suelo y pendiente:</strong> qué estudios, fundaciones, movimiento de tierra, drenajes o contenciones requiere ese lote.</li>
            <li><strong>Servicios:</strong> disponibilidad efectiva y presupuesto de conexiones o soluciones necesarias; no alcanza con que una red pase cerca.</li>
            <li><strong>Ubicación y accesos:</strong> logística de materiales y condiciones para trabajar durante las distintas etapas.</li>
            <li><strong>Confort y calidad:</strong> aislación, aberturas, calefacción y mantenimiento. Una casa nueva y una usada pueden tener prestaciones y gastos futuros diferentes.</li>
            <li><strong>Viabilidad urbanística:</strong> qué se puede construir en esa parcela, qué documentación requiere y cuáles son los plazos del proyecto.</li>
          </ul>
          <p>La Municipalidad publica <a href={sources[2].href} target="_blank" rel="noopener noreferrer" className="text-rose-700 underline underline-offset-4">instructivos y ordenadores urbanísticos</a>. La aplicación al terreno concreto debe verificarse antes de tomar como realizable una superficie imaginada.</p>
          <p>Del lado de la vivienda usada, pedí una revisión de estructura, humedad, cubierta e instalaciones, además de planos y documentación. Dos casas con los mismos metros pueden requerir inversiones muy distintas para quedar en condiciones equivalentes.</p>

          <Heading id="decidir">Qué pedir antes de decidir entre comprar y construir</Heading>
          <ol className="mb-6 list-decimal space-y-4 pl-6">
            <li><strong>Una comparación de inmuebles equivalentes.</strong> Barrio, lote, superficie, calidad y estado. Diferenciá precios publicados de valores efectivamente negociados.</li>
            <li><strong>Un presupuesto con alcance escrito.</strong> Rubros incluidos, exclusiones, impuestos, terminaciones, fecha, moneda y condiciones de actualización.</li>
            <li><strong>Un cronograma con desembolsos.</strong> Cuánto pagás al inicio, durante la obra y hasta poder habitarla; incorporá financiación y alquiler si corresponden.</li>
            <li><strong>Una prueba de sensibilidad.</strong> Recalculá si aumenta un rubro o se demora la entrega. Si la ventaja desaparece con un cambio pequeño, la decisión necesita más margen.</li>
            <li><strong>Una evaluación técnica y documental.</strong> Tanto del lote que comprarías como de la casa que estás considerando.</li>
          </ol>
          <p>Construir también puede permitirte elegir distribución y prestaciones que no encontrás en la oferta actual. Comprar puede resolver una necesidad de vivienda antes. Esos beneficios tienen valor para cada familia, aunque no se lean en el precio por metro cuadrado.</p>
          <p>La pregunta útil es cuánto cuesta llegar a la vivienda que necesitás, en qué plazo y con qué incertidumbre. Una diferencia entre costo de obra y precio de venta abre una comparación; por sí sola no acredita una oportunidad ni promete una revalorización.</p>

          <aside className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
            <h2 className="mb-3 text-xl font-black text-gray-900">¿Estás comparando opciones en San Martín?</h2>
            <p>Podés revisar el relevamiento local de precios y consultar por propiedades concretas. Para la alternativa de construir, sumá un presupuesto de un profesional con el proyecto y el lote definidos.</p>
            <div className="flex flex-wrap gap-3 text-sm font-bold">
              <Link href="/precio-m2" className="rounded-lg bg-rose-700 px-5 py-3 text-white hover:bg-rose-800">Ver valores del m² local</Link>
              <Link href="/contacto" className="rounded-lg border border-rose-300 bg-white px-5 py-3 text-rose-800 hover:bg-rose-100">Consultar una propiedad</Link>
            </div>
          </aside>

          <Heading>Preguntas frecuentes</Heading>
          {faqs.map(([question, answer]) => <div key={question} className="mb-6 border-b border-gray-200 pb-4"><h3 className="mb-2 text-lg font-bold text-gray-900">{question}</h3><p className="!mb-0">{answer}</p></div>)}
          <Heading>Fuentes y alcance de la nota</Heading>
          <p>Fuentes consultadas el 26 de septiembre de 2026. La nota explica un mecanismo económico y un método de comparación. No presenta un relevamiento de costos de obra local ni demuestra una brecha general entre comprar y construir en San Martín.</p>
          <ul className="mb-6 space-y-4 text-sm">
            {sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-rose-700 underline underline-offset-4">{source.title}</a><span className="mt-1 block text-gray-600">{source.detail}</span></li>)}
          </ul>
          <Heading>Para seguir leyendo</Heading>
          <ul className="space-y-3 text-rose-700 underline underline-offset-4">
            <li><Link href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes">Cuánto cuesta una casa en San Martín de los Andes</Link></li>
            <li><Link href="/blog/creditos-uva-autos-viviendas">Créditos UVA para autos y casas: qué cambia en la cuota y en la deuda</Link></li>
          </ul>
        </div>
        <SeguirLeyendo slug="dolar-construccion-comprar-o-construir" />
      </article>
    </>
  );
}
