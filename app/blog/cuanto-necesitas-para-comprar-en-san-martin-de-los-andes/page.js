import Image from "next/image";
import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import PodcastPlayer from "@/components/PodcastPlayer";
import { SITE_URL, WA_URL, canonicalUrl, TASADOR_PATH } from "@/config";
import { RELEVADAS_PUBLICO } from "@/lib/mercado";

const path = "/blog/cuanto-necesitas-para-comprar-en-san-martin-de-los-andes";
const url = canonicalUrl(path);
const image = `${SITE_URL}/tasacion-cuentas.jpg`;

export const metadata = {
  title: "¿Cuánto necesitás para comprar en San Martín de los Andes?",
  description:
    "La cuenta completa para comprar una propiedad en San Martín de los Andes en 2026: cuánto suman los gastos de escrituración en Neuquén, quién paga cada cosa, cuánto ahorro pide un crédito UVA y cómo saber si el precio publicado es justo.",
  keywords:
    "gastos de escrituracion neuquen 2026, cuanto necesito para comprar una propiedad, impuesto de sellos neuquen compraventa, comprar en san martin de los andes, gastos de compra inmueble argentina, credito uva cuanto ahorro necesito",
  openGraph: {
    title: "¿Cuánto necesitás REALMENTE para comprar en San Martín de los Andes?",
    description:
      "El precio del aviso es solo el comienzo. Cuánto suman los gastos de cierre en Neuquén, qué pide un crédito UVA y cómo validar el precio con datos antes de firmar la reserva.",
    url,
    type: "article",
    publishedTime: "2026-08-23T00:00:00-03:00",
    modifiedTime: "2026-08-23T00:00:00-03:00",
    authors: ["Milton Catalán"],
    images: [{ url: image, width: 1200, height: 630, alt: "Pareja haciendo las cuentas para comprar una propiedad" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Cuánto necesitás realmente para comprar en San Martín de los Andes?",
    description: "Los gastos de cierre que nadie te muestra, la cuenta del crédito UVA y cómo validar el precio con datos.",
    images: [image],
  },
  alternates: { canonical: url },
};

// Cada fila lleva el porcentaje y a quién le toca. Los valores de referencia
// para Neuquén salen de la nota del Colegio de Escribanos local (Río Negro,
// marzo 2026) y de la ley impositiva provincial. Se publican como referencia,
// no como número final: el escribano confirma el caso concreto.
const gastos = [
  {
    concepto: "Comisión inmobiliaria",
    detalle: "En Catalán Propiedades el comprador paga 3% + IVA. Es un porcentaje fijo y se dice antes de la reserva, no después.",
    porcentaje: "3% + IVA",
    quien: "Comprador",
  },
  {
    concepto: "Impuesto de sellos",
    detalle: "Tributo provincial sobre la compraventa. La alícuota general en Neuquén es del 3% y la costumbre es dividirlo en partes iguales, aunque es negociable. El boleto también sella y ese pago se toma a cuenta.",
    porcentaje: "3% (se suele partir 50/50)",
    quien: "Comprador y vendedor",
  },
  {
    concepto: "Honorarios del escribano",
    detalle: "Escritura traslativa de dominio, estudio de títulos y gestión. Ronda el 2% más IVA y admite negociación, con mínimos según la escala.",
    porcentaje: "≈ 2% + IVA",
    quien: "Comprador",
  },
  {
    concepto: "Inscripción registral",
    detalle: "Tasa del Registro de la Propiedad Inmueble para inscribir la escritura a tu nombre.",
    porcentaje: "≈ 0,6%",
    quien: "Comprador",
  },
  {
    concepto: "Certificados e informes",
    detalle: "Dominio, inhibiciones, libre deuda de impuestos y expensas, diligenciamientos. Es un costo chico pero existe.",
    porcentaje: "≈ 0,2%",
    quien: "Comprador",
  },
];

const pasosTasador = [
  {
    titulo: "Elegí el tipo",
    texto: "Casa o departamento. Son los dos tipos con suficientes datos en San Martín como para que el modelo diga algo serio. Si es un lote o un campo, esa la vemos a mano.",
  },
  {
    titulo: "Marcá el barrio",
    texto: "Es el paso que más pesa: entre el barrio más caro y el más barato de la ciudad hay casi el triple por m². Si no sabés el nombre exacto, el buscador te lo encuentra.",
  },
  {
    titulo: "Cargá los metros cubiertos",
    texto: "Cubiertos, sin balcones ni galerías abiertas. Si es casa, sumá también la superficie del terreno: en una casa el lote mueve el valor tanto como la construcción.",
  },
  {
    titulo: "Contá cómo está distribuida",
    texto: "Dormitorios y baños. Dos propiedades de los mismos metros no valen igual según cómo estén repartidos.",
  },
  {
    titulo: "Marcá los extras reales",
    texto: "Cochera, vista, calefacción central, lo que tenga. Marcá solo lo que exista de verdad: cada extra afina la estimación y ninguno es obligatorio.",
  },
];

const faqs = [
  [
    "¿Cuánto dinero necesito además del precio de la propiedad?",
    "Como referencia, entre un 7% y un 10% adicional sobre el valor de la propiedad para cubrir comisión, impuesto de sellos, honorarios del escribano, inscripción registral y certificados. Sobre una operación de USD 100.000 significa tener disponibles unos USD 107.000 a USD 110.000. Si la compra queda alcanzada por la exención de sellos por vivienda única, la cuenta baja.",
  ],
  [
    "¿Cuánto es el impuesto de sellos en Neuquén y quién lo paga?",
    "La alícuota general para la compraventa de inmuebles es del 3% sobre el precio o la valuación fiscal. Por costumbre se divide en partes iguales entre comprador y vendedor, pero es negociable y conviene dejarlo escrito en la reserva. El boleto de compraventa también sella y ese importe se computa a cuenta de la escritura.",
  ],
  [
    "¿Existe exención de sellos por vivienda única en Neuquén?",
    "Sí, el Código Fiscal provincial contempla una exención cuando la propiedad va a ser la vivienda única y familiar del comprador y su valor no supera un tope que se actualiza. Como el tope cambia, confirmá el monto vigente con tu escribano o en la Dirección Provincial de Rentas antes de presupuestar.",
  ],
  [
    "¿Se sigue pagando el ITI al vender una propiedad?",
    "No. El Impuesto a la Transferencia de Inmuebles fue derogado por la Ley 27.743, publicada en julio de 2024. Muchas guías que siguen circulando lo incluyen como 1,5% a cargo del vendedor: ese dato está desactualizado. La situación en el impuesto a las ganancias depende de cada vendedor y la define su contador.",
  ],
  [
    "¿Cuánto tengo que tener ahorrado si compro con crédito UVA?",
    "Los bancos financian hasta el 75% u 80% del valor de la propiedad o de su tasación, el menor de los dos, y no financian los gastos de cierre. Entre el anticipo y los gastos, conviene tener disponible cerca del 30% al 35% del valor total en dólares.",
  ],
  [
    "¿Los gastos de escritura se pueden pagar con el crédito?",
    "No. El crédito se desembolsa contra la escritura y cubre parte del precio, no los gastos. Además, si hay hipoteca, ese contrato también sella y suma un costo propio que conviene pedirle al escribano antes de firmar.",
  ],
  [
    "¿Cómo sé si el precio publicado es justo?",
    "El precio del aviso es una pretensión, no un valor. Para validarlo hace falta comparar contra el mercado real de la zona, no contra dos o tres publicaciones parecidas. El tasador de Catalán Propiedades usa un modelo entrenado con las publicaciones relevadas de San Martín de los Andes y devuelve un valor por m², un total, un rango y un nivel de confianza.",
  ],
  [
    "¿El tasador me pide mis datos?",
    "La primera tasación es gratuita y no pide correo. Recién a partir de la segunda te pedimos un correo para seguir usándolo, y ahí queda guardado en tu cuenta para volver a verlo cuando quieras.",
  ],
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "¿Cuánto necesitás realmente para comprar en San Martín de los Andes en 2026?",
  description:
    "Los gastos de cierre de una compraventa en Neuquén, la cuenta del crédito UVA y cómo validar el precio de una propiedad con datos antes de firmar la reserva.",
  image,
  datePublished: "2026-08-23",
  dateModified: "2026-08-23",
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
    name: "¿Cuánto necesitás realmente para comprar en San Martín de los Andes? — versión en audio",
    contentUrl: `${SITE_URL}/podcast/cuanto-necesitas-para-comprar-en-san-martin-de-los-andes.mp3`,
    encodingFormat: "audio/mpeg",
    duration: "PT29M38S",
    inLanguage: "es-AR",
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

const waMessage = encodeURIComponent(
  "Hola Milton, quiero comprar en San Martín de los Andes y me gustaría entender bien los gastos de la operación. ¿Me ayudás con la cuenta?",
);
const WA_COMPRA_URL = `${WA_URL}?text=${waMessage}`;

// El sitio no tiene @tailwindcss/typography instalado, así que las clases
// `prose` no aplican ningún estilo: los <p> quedarían pegados uno contra otro
// por el preflight de Tailwind. Por eso el espaciado del cuerpo va explícito.
function P({ children }) {
  return <p className="mb-6 text-lg leading-relaxed text-gray-700">{children}</p>;
}

function Heading({ children, id }) {
  return (
    <h2 id={id} className="mb-5 mt-14 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">
      {children}
    </h2>
  );
}

export default function CuantoNecesitasPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10 sm:mb-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-rose-600">Guía de compra · Costos</p>
          <h1 className="max-w-3xl text-[2rem] font-black leading-[1.08] text-gray-900 sm:text-4xl md:text-5xl">
            ¿Cuánto necesitás realmente para comprar en San Martín de los Andes?
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-xl">
            Viste un departamento en un portal, mirás tu ahorro y pensás que llegás. En una compraventa, el precio del
            aviso es apenas el comienzo de la cuenta. Acá está el resto, con los números de Neuquén y sin letra chica.
          </p>
          <div className="mt-8 flex items-center gap-4 border-t border-gray-200 pt-7">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
              <Image src="/Milton.webp" alt="Milton Catalán" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Milton Catalán</p>
              <p className="text-sm text-gray-500">Autor · 23 de agosto de 2026 · 9 min de lectura</p>
            </div>
          </div>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src="/tasacion-cuentas.jpg"
              alt="Pareja haciendo las cuentas de una compra de propiedad"
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </header>

        <PodcastPlayer slug="cuanto-necesitas-para-comprar-en-san-martin-de-los-andes" />

        <div className="prose prose-lg max-w-none text-gray-700">
          {/* Respuesta corta arriba de todo: es lo que la gente vino a buscar y
              lo que Google levanta como fragmento destacado. */}
          <div className="not-prose rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">La respuesta corta</p>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-gray-900">
              Presupuestá entre un 7% y un 10% por encima del precio de la propiedad para cubrir los gastos de cierre. Si
              comprás con crédito UVA, necesitás tener disponible cerca del 30% al 35% del valor total: el anticipo que
              el banco no financia más esos gastos, que tampoco financia.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Sobre una propiedad de USD 100.000, la operación se cierra con unos USD 107.000 a USD 110.000 disponibles.
            </p>
          </div>

          <Heading id="gastos">Los gastos que no aparecen en el aviso</Heading>
          <P>
            El error más común del comprador primerizo es presupuestar solo el valor del inmueble. En una compraventa en
            Neuquén, a ese valor hay que sumarle esto:
          </P>

          <div className="not-prose my-8 overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-black">Concepto</th>
                  <th className="px-5 py-3 font-black">Referencia</th>
                  <th className="hidden px-5 py-3 font-black sm:table-cell">Lo paga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gastos.map((g) => (
                  <tr key={g.concepto} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{g.concepto}</p>
                      <p className="mt-1 leading-relaxed text-gray-600">{g.detalle}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:hidden">{g.quien}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-rose-700">{g.porcentaje}</td>
                    <td className="hidden px-5 py-4 text-gray-600 sm:table-cell">{g.quien}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <P>
            Sumados, del lado del comprador esos conceptos dan entre un 7% y un 10% del valor de la propiedad. La
            diferencia entre un extremo y el otro casi siempre la explican dos cosas: si la operación queda exenta del
            impuesto de sellos por vivienda única y cuánto se negoció de honorarios.
          </P>

          <Heading id="ejemplos">La cuenta, con dos ejemplos</Heading>
          <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-6">
              <p className="text-sm font-black uppercase tracking-wide text-gray-500">Departamento · USD 120.000</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex justify-between gap-4"><span>Comisión 3% + IVA</span><span className="font-semibold tabular-nums">USD 4.356</span></li>
                <li className="flex justify-between gap-4"><span>Sellos (mitad del 3%)</span><span className="font-semibold tabular-nums">USD 1.800</span></li>
                <li className="flex justify-between gap-4"><span>Escribano 2% + IVA</span><span className="font-semibold tabular-nums">USD 2.904</span></li>
                <li className="flex justify-between gap-4"><span>Registro y certificados</span><span className="font-semibold tabular-nums">USD 960</span></li>
              </ul>
              <p className="mt-4 border-t border-gray-200 pt-4 text-lg font-black text-gray-900">
                Necesitás ≈ USD 130.020
              </p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
              <p className="text-sm font-black uppercase tracking-wide text-rose-800">Casa · USD 250.000</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li className="flex justify-between gap-4"><span>Comisión 3% + IVA</span><span className="font-semibold tabular-nums">USD 9.075</span></li>
                <li className="flex justify-between gap-4"><span>Sellos (mitad del 3%)</span><span className="font-semibold tabular-nums">USD 3.750</span></li>
                <li className="flex justify-between gap-4"><span>Escribano 2% + IVA</span><span className="font-semibold tabular-nums">USD 6.050</span></li>
                <li className="flex justify-between gap-4"><span>Registro y certificados</span><span className="font-semibold tabular-nums">USD 2.000</span></li>
              </ul>
              <p className="mt-4 border-t border-rose-200 pt-4 text-lg font-black text-gray-900">
                Necesitás ≈ USD 270.875
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Son cuentas de referencia para dimensionar el esfuerzo, con el sellos repartido en partes iguales y sin
            exenciones. El número final lo confirma el escribano sobre la operación concreta.
          </p>

          <Heading id="cambios">Dos cosas que cambiaron y muchas guías todavía no actualizaron</Heading>
          <div className="not-prose my-8 space-y-4">
            <div className="rounded-2xl bg-gray-50 p-6">
              <p className="font-bold text-gray-900">El ITI ya no existe</p>
              <p className="mt-2 leading-relaxed text-gray-700">
                El Impuesto a la Transferencia de Inmuebles, ese 1,5% que pagaba el vendedor, fue derogado por la Ley
                27.743 en julio de 2024. Si estás leyendo una guía que todavía lo incluye, esa guía es vieja. Lo que sí
                sigue existiendo es el tratamiento en ganancias, que depende del caso de cada vendedor y lo define su
                contador.
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-6">
              <p className="font-bold text-gray-900">La exención de sellos por vivienda única</p>
              <p className="mt-2 leading-relaxed text-gray-700">
                Neuquén exime del impuesto de sellos a la compra destinada a vivienda única y familiar cuando el valor no
                supera un tope, que se actualiza cada año. Si tu compra entra, te ahorrás la mitad del 3% y la cuenta
                total baja bastante. Preguntalo antes de firmar la reserva, no después: es plata.
              </p>
            </div>
          </div>

          <Heading id="uva">Si vas con crédito UVA</Heading>
          <P>
            Los bancos financian hasta el 75% u 80% del valor de la propiedad o de la tasación que hace el propio banco,
            lo que sea menor. Y no financian los gastos de cierre. Entonces la cuenta es esta: el 20% o 25% de anticipo,
            más el 7% a 10% de gastos. Redondeando, <strong>entre el 30% y el 35% del valor total en dólares</strong>.
          </P>
          <P>
            Hay un detalle que sorprende a mucha gente: si hay hipoteca, ese contrato también sella y tiene su propio
            costo. Pedile el número al escribano cuando armes el presupuesto.
          </P>
          <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
            <Link href="/blog/creditos-hipotecarios-uva-2026" className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md">
              <p className="text-xs font-bold uppercase text-rose-600">Financiación</p>
              <p className="mt-2 font-bold text-gray-900">Créditos UVA 2026: bancos, tasas y requisitos</p>
            </Link>
            <Link href="/blog/credito-hipotecario-neuquen-2026" className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md">
              <p className="text-xs font-bold uppercase text-rose-600">Neuquén</p>
              <p className="mt-2 font-bold text-gray-900">Crédito Neuquén Habita: requisitos y montos</p>
            </Link>
          </div>
          <P>
            Antes de salir a mirar propiedades, conseguí la preaprobación. Te da el techo real de tu búsqueda y te
            posiciona mucho mejor cuando llega el momento de ofertar.
          </P>

          <Heading id="precio">Ahora la pregunta difícil: ¿el precio del aviso es real?</Heading>
          <P>
            Supongamos que ya tenés el dinero o el crédito preaprobado. Aparece la duda que desvela a todo comprador:
            estoy pagando un precio justo o me están cobrando de más.
          </P>
          <P>
            La forma más común de resolverlo es la peor: mirar tres avisos parecidos en un portal y sacar un promedio.
            Los datos de los portales están sucios. Hay publicaciones de hace años con precios que nadie actualizó, el
            mismo departamento cargado tres veces por tres inmobiliarias distintas, superficies puestas en el campo
            equivocado y precios en pesos convertidos a una cotización que no es la de hoy. Un promedio sobre eso no es
            un dato: es ruido con aspecto de dato.
          </P>
          <P>
            Y hay algo más de fondo. <strong>El precio publicado no es el valor: es lo que alguien pretende.</strong>{" "}
            Cuando todos copian el precio del vecino, el mercado entero se corre de lugar sin que se haya vendido nada.
          </P>

          {/* Sección tasador: es el corazón de la conversión del post. No repite
              cómo funciona el modelo (eso vive en /blog/como-tasamos-...), sino
              cómo usarlo bien y cómo leer el resultado. */}
          <Heading id="tasador">Cómo usar el tasador en tres minutos</Heading>
          <P>
            Por eso construimos un tasador propio: en vez de mirar un aviso, un modelo aprende de{" "}
            {RELEVADAS_PUBLICO} propiedades relevadas de San Martín de los Andes, limpias y ordenadas una por una. No es
            un formulario que te pide los datos y te promete que después te llamamos. Te devuelve el número en pantalla,
            al instante.
          </P>

          <div className="not-prose my-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Antes de empezar, tené a mano</p>
            <p className="mt-3 leading-relaxed text-gray-700">
              El barrio, los metros cubiertos, los metros de terreno si es una casa, y cuántos dormitorios y baños tiene.
              Nada más. Si estás mirando un aviso, esos datos están ahí.
            </p>
          </div>

          <div className="not-prose my-8 space-y-4">
            {pasosTasador.map((paso, i) => (
              <div key={paso.titulo} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-gray-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-black text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">{paso.titulo}</h3>
                  <p className="mt-1 leading-relaxed text-gray-700">{paso.texto}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mb-3 mt-12 text-xl font-black text-gray-900">Cómo leer lo que te devuelve</h3>
          <P>
            El resultado no es un número solo, y eso es a propósito. Vas a ver cuatro cosas y conviene entender qué te
            dice cada una:
          </P>
          <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-6">
              <p className="font-bold text-gray-900">Valor por m² y valor total</p>
              <p className="mt-2 leading-relaxed text-gray-700">
                La referencia central. Sirve para comparar contra el precio del aviso y ver de qué tamaño es la
                diferencia.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6">
              <p className="font-bold text-gray-900">Un rango, mínimo y máximo</p>
              <p className="mt-2 leading-relaxed text-gray-700">
                Está calibrado para que el valor real caiga adentro alrededor de 9 de cada 10 veces. Un rango angosto
                habla de un mercado claro para ese tipo de propiedad; uno ancho, de más incertidumbre.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6">
              <p className="font-bold text-gray-900">Un nivel de confianza</p>
              <p className="mt-2 leading-relaxed text-gray-700">
                Depende de cuántos comparables reales hay en ese barrio. Cuando son pocos, el sistema te lo dice en vez
                de disimularlo. El error porcentual mediano medido en San Martín está cerca del 16%.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="font-bold text-gray-900">Lo que el modelo no ve</p>
              <p className="mt-2 leading-relaxed text-gray-700">
                La orientación real del sol en invierno, el estado de la caldera, el vecino ruidoso, una vista que no
                figura en ningún campo. Para eso está la visita. La estimación es un punto de partida muy bueno, no la
                última palabra.
              </p>
            </div>
          </div>

          <div className="not-prose my-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="font-bold text-gray-900">Un uso que casi nadie hace y rinde muchísimo</p>
            <p className="mt-2 leading-relaxed text-gray-700">
              Tasá la propiedad que te gusta <em>antes</em> de ofertar, y tasá también dos o tres alternativas del mismo
              barrio. En cinco minutos tenés una idea propia del mercado y dejás de negociar a ciegas. Si el aviso está
              por encima del rango máximo, ya sabés por dónde arrancar la conversación.
            </p>
          </div>

          <div className="not-prose my-10 rounded-3xl bg-gray-900 p-8 text-center sm:p-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Probalo ahora</p>
            <h2 className="mb-3 text-2xl font-black leading-tight text-white sm:text-3xl">
              Tasá la propiedad que estás mirando
            </h2>
            <p className="mx-auto mb-7 max-w-xl text-sm leading-relaxed text-gray-400">
              La primera tasación es gratis y no te pedimos el correo. Obtenés valor por m², valor total, rango y nivel
              de confianza en pantalla, al instante.
            </p>
            <TrackedLink
              event="tasador_click"
              eventParams={{ location: "blog_cuanto_necesitas_tasador" }}
              href={TASADOR_PATH}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
            >
              Tasar una propiedad al instante
            </TrackedLink>
          </div>

          <P>
            Si querés entender qué hay adentro del modelo (de dónde salen los datos, cómo se limpian y por qué damos un
            rango en vez de un número redondo), lo contamos en detalle en{" "}
            <Link href="/blog/como-tasamos-tu-propiedad-con-datos" className="font-semibold text-rose-700 underline underline-offset-4">
              cómo tasamos tu propiedad con datos
            </Link>
            .
          </P>

          <Heading id="checklist">El checklist antes de firmar la reserva</Heading>
          <div className="not-prose my-8 space-y-4">
            {[
              ["Tené el 10% extra disponible, no prometido", "Nunca firmes una reserva sin ese dinero líquido. Los gastos aparecen todos juntos y cerca de la escritura."],
              ["Preguntá por la exención de sellos", "Si es tu vivienda única y familiar, puede cambiar la cuenta. Confirmalo con el escribano antes de firmar."],
              ["Dejá escrito quién paga qué", "El reparto del sellos es costumbre, no ley. Que figure en la reserva evita una discusión cara sobre el final."],
              ["Validá el precio con datos, no con promedios", "Tasá la propiedad y un par de alternativas del mismo barrio antes de ofertar."],
              ["Si vas con crédito, primero la preaprobación", "Después la propiedad. Al revés se pierden operaciones y tiempo."],
            ].map(([titulo, texto], i) => (
              <div key={titulo} className="flex gap-4 rounded-2xl bg-gray-50 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-black text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">{titulo}</h3>
                  <p className="mt-1 leading-relaxed text-gray-700">{texto}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="not-prose mt-14 rounded-3xl bg-gray-50 p-8">
            <h2 className="text-2xl font-black text-gray-900">¿Lo vemos sobre tu caso?</h2>
            <p className="mt-3 leading-relaxed text-gray-700">
              Si ya tenés una propiedad en la mira, escribime y armamos juntos la cuenta completa: precio, gastos,
              financiación y qué dice el modelo sobre ese valor. Sin compromiso y sin vueltas.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                event="whatsapp_click"
                eventParams={{ location: "blog_cuanto_necesitas_cta" }}
                href={WA_COMPRA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Consultarle a Milton por WhatsApp
              </TrackedLink>
              <TrackedLink
                event="tasador_click"
                eventParams={{ location: "blog_cuanto_necesitas_cta" }}
                href={TASADOR_PATH}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Tasar una propiedad
              </TrackedLink>
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

          <div className="not-prose mt-12 rounded-xl bg-amber-50 p-6 text-sm leading-relaxed text-amber-950">
            <p className="font-bold">Sobre estos números</p>
            <p className="mt-2">
              Los porcentajes son de referencia para presupuestar, no cifras finales. Las alícuotas, los mínimos
              notariales y los topes de exención se actualizan, y cada operación tiene su particularidad: confirmá el
              detalle con tu escribano y en la Dirección Provincial de Rentas de Neuquén antes de cerrar. Este contenido
              es informativo y no reemplaza asesoramiento profesional.
            </p>
          </div>

          <section className="not-prose mt-12 border-t border-gray-100 pt-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">También te puede interesar</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes" className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md">
                <p className="text-xs font-bold uppercase text-rose-600">Precios</p>
                <p className="mt-2 font-bold text-gray-900">¿Cuánto cuesta una casa en San Martín de los Andes?</p>
              </Link>
              <Link href="/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires" className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md">
                <p className="text-xs font-bold uppercase text-rose-600">Guía</p>
                <p className="mt-2 font-bold text-gray-900">Comprar desde Buenos Aires, paso a paso</p>
              </Link>
              <Link href="/blog/sena-reserva-compraventa-inquilino" className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md">
                <p className="text-xs font-bold uppercase text-rose-600">Guía legal</p>
                <p className="mt-2 font-bold text-gray-900">Seña o reserva: qué firma cada parte</p>
              </Link>
              <Link href="/precio-m2" className="rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md">
                <p className="text-xs font-bold uppercase text-rose-600">Datos</p>
                <p className="mt-2 font-bold text-gray-900">Precio del m² por barrio en San Martín</p>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
