import Image from "next/image";
import Link from "next/link";
import { SITE_URL, canonicalUrl } from "@/config";
import { blogPosts } from "@/lib/blogPosts";

const post = blogPosts.find((entry) => entry.id === "creditos-uva-autos-viviendas");
const url = canonicalUrl(`/blog/${post.id}`);
const sources = {
  antecedente: "https://www.bbva.com/es/ar/bbva-financiara-la-compra-de-vehiculos-100-electricos-en-argentina/",
  santander: "https://www.santander.com.ar/personas/prendarios/autos",
  bna: "https://www.bna.com.ar/Personas/CreditosHipotecarios",
  norma: "https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-polcre.pdf",
  uva23: "https://www.bcra.gob.ar/Pdfs/comytexord/B12686.pdf",
  uva24: "https://www.bcra.gob.ar/Pdfs/comytexord/B12916.pdf",
  uva25: "https://www.bcra.gob.ar/Pdfs/comytexord/B13091.pdf",
  salarios: "https://www.indec.gob.ar/uploads/informesdeprensa/salarios_02_261ECBDA5C7A.pdf",
  ipc: "https://www.indec.gob.ar/uploads/informesdeprensa/ipc_01_2517A7124C09.pdf",
  cer: "https://www.bcra.gob.ar/Pdfs/PublicacionesEstadisticas/tasmet.pdf",
  iva: "https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-5282-2022-374604/texto",
  cambio: "https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/Anexo-normativo-Informe-inclusion-%20financiera-octubre-24.pdf",
  cvs: "https://bna.com.ar/Personas/SimuladorHipotecariosUva",
  bbva: "https://www.bbva.com.ar/personas/productos/prestamos/prendarios.html",
  cancelacion: "https://www.bbva.com.ar/personas/productos/creditos-hipotecarios.html",
};

export const metadata = {
  title: post.title,
  description: post.excerpt,
  alternates: { canonical: url },
  openGraph: {
    title: post.title,
    description: post.excerpt,
    url,
    type: "article",
    publishedTime: "2026-09-08T00:00:00-03:00",
    modifiedTime: "2026-09-08T00:00:00-03:00",
    authors: ["Milton Catalán"],
    images: [{ url: `${SITE_URL}${post.image}`, alt: "Créditos para vivienda" }],
  },
  twitter: {
    card: "summary_large_image",
    title: post.title,
    description: post.excerpt,
    images: [`${SITE_URL}${post.image}`],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.excerpt,
  image: `${SITE_URL}${post.image}`,
  datePublished: "2026-09-08T00:00:00-03:00",
  dateModified: "2026-09-08T00:00:00-03:00",
  author: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
  publisher: { "@type": "Organization", name: "Catalán Propiedades", url: SITE_URL },
  mainEntityOfPage: { "@type": "WebPage", "@id": url },
};

// Comparación controlada: TNA/12 (no conversión desde TEA), períodos iguales.
// Importes a la UVA de inicio; no incluyen impuestos, seguros ni comisiones.
const capital = 10_000_000;
const tna = 0.067;
function calcularPlazo(meses) {
  const i = tna / 12;
  const cuota = capital * i / (1 - (1 + i) ** -meses);
  let saldo = capital;
  for (let mes = 0; mes < 12; mes++) saldo = saldo * (1 + i) - cuota;
  return { meses, cuota, amortizado: 1 - saldo / capital, saldo, total: cuota * meses / capital };
}
const plazos = [24, 48, 240, 360].map(calcularPlazo);
const historia = [
  { fecha: "Diciembre 2023", uva: 463.4, total: 1, privado: 1, publico: 1 },
  { fecha: "Diciembre 2024", uva: 1300.85, total: 2.455, privado: 2.475, publico: 2.193 },
  { fecha: "Diciembre 2025", uva: 1707.79, total: 2.455 * 1.382, privado: 2.475 * 1.287, publico: 2.193 * 1.289 },
];
const pesos = (n) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const porcentaje = (n) => `${(n * 100).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

const faqs = [
  ["¿Tasa 0% en UVA significa cuotas fijas en pesos?", "No. El 0% se refiere al interés de esa oferta. El equivalente en pesos se ajusta por UVA y pueden sumarse seguros y otros costos."],
  ["¿Puedo pagar las cuotas y seguir debiendo más pesos?", "Sí. El capital pendiente puede bajar en UVA mientras aumenta su equivalente en pesos. Para entender la evolución hay que mirar ambas unidades."],
  ["¿El crédito para un auto es seguro porque dura menos?", "Un plazo menor reduce la duración de la exposición, pero exige devolver capital más rápido. La capacidad de pago y el valor de reventa siguen siendo importantes."],
  ["¿La cuota se ajusta por mi sueldo?", "La UVA se vincula al CER, no a tu ingreso individual. Las opciones vinculadas al CVS dependen del contrato y sus condiciones."],
];
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
};

function Fuente({ id, children }) {
  return <a href={sources[id]} target="_blank" rel="noopener noreferrer" className="font-medium text-rose-700 underline decoration-rose-300 underline-offset-4 hover:text-rose-900">{children}</a>;
}
function Heading({ id, children }) {
  return <h2 id={id} className="mb-5 mt-12 scroll-mt-28 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">{children}</h2>;
}
function Tabla({ caption, headers, rows }) {
  return (
    <div className="my-7 overflow-x-auto rounded-xl border border-gray-200" role="region" aria-label={caption} tabIndex={0}>
      <table className="w-full min-w-[580px] text-left text-sm">
        <caption className="bg-gray-50 px-5 py-4 text-left font-semibold text-gray-800">{caption}</caption>
        <thead className="bg-gray-900 text-white"><tr>{headers.map((h) => <th key={h} scope="col" className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row[0]} className={index % 2 ? "bg-gray-50" : "bg-white"}>
          {row.map((cell, col) => col === 0
            ? <th key={col} scope="row" className="border-t border-gray-100 px-5 py-4 font-semibold text-gray-900">{cell}</th>
            : <td key={col} className="border-t border-gray-100 px-5 py-4 tabular-nums text-gray-700">{cell}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  );
}

export default function CreditosUvaAutosViviendasPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10">
          <Link href="/blog" className="text-sm font-semibold text-rose-700 hover:underline">Volver al blog</Link>
          <p className="mb-3 mt-8 text-sm font-bold uppercase tracking-widest text-rose-600">Guía de crédito · Educación financiera</p>
          <h1 className="text-[2rem] font-black leading-[1.1] text-gray-900 sm:text-4xl md:text-5xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
            Una cuota que hoy entra en el presupuesto puede ocupar otra parte del sueldo dentro de unos años.
            Los créditos UVA para autos y viviendas comparten una forma de actualizar la deuda, pero el plazo
            y los gastos cambian mucho la cuenta. Acá lo explicamos con fuentes oficiales y números.
          </p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Image src="/Milton.webp" alt="Milton Catalán" width={64} height={64} className="h-16 w-16 shrink-0 rounded-full border-2 border-rose-200 object-cover" />
            <div>
              <p className="text-sm font-bold text-gray-900">Escrito por Milton Catalán</p>
              <p className="text-xs text-gray-600"><time dateTime={post.dateTime}>8 de septiembre de 2026</time> · {post.readTime} de lectura · Asesor inmobiliario en San Martín de los Andes</p>
            </div>
          </div>
          <div className="relative mt-8 aspect-[16/8.43] overflow-hidden rounded-2xl bg-gray-100">
            <Image src={post.image} alt="Financiación para acceder a una vivienda" fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
          </div>
        </header>

        <div className="text-base leading-relaxed text-gray-700 sm:text-lg [&_p]:mb-5">
          <aside className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-rose-700">La idea central</p>
            <p className="!mb-0 font-semibold text-gray-900">El plazo corto exige devolver capital más rápido. El plazo largo baja la cuota inicial por cada peso prestado, pero mantiene más deuda expuesta al ajuste. En ambos casos, importa cuánto crece la cuota respecto de tu ingreso.</p>
          </aside>
          <nav aria-label="Contenido del artículo" className="mt-8 border-y border-gray-200 py-5 text-sm">
            <p className="font-bold text-gray-900">En esta nota</p>
            <ol className="grid list-inside list-decimal gap-3 sm:grid-cols-2">
              {[["mecanismo", "Cómo funciona y qué pagás"], ["plazos", "La diferencia entre 4 y 30 años"], ["historia", "Qué muestran los datos oficiales"], ["escenarios", "Si tu ingreso se atrasa"], ["bien", "El valor del auto y de la casa"], ["antes-de-firmar", "Qué revisar antes de firmar"]].map(([id, label]) => <li key={id}><a href={`#${id}`} className="text-rose-700 underline underline-offset-4">{label}</a></li>)}
            </ol>
          </nav>

          <Heading>¿Es nuevo el crédito UVA para autos?</Heading>
          <p>La modalidad ya existía. El 14 de septiembre de 2020, BBVA anunció préstamos prendarios para vehículos VOLT en UVA, al 0% y hasta 48 meses. Una campaña reciente puede traer condiciones distintas, pero no implica que se haya creado ahora el instrumento. <Fuente id="antecedente">Anuncio oficial de BBVA.</Fuente></p>
          <p>Para comparar, tomamos ejemplos publicados por los bancos y los distinguimos de nuestros ejercicios matemáticos. Las condiciones fueron consultadas el 8 de septiembre de 2026 y pueden cambiar; no representan una cotización personal.</p>

          <Heading id="mecanismo">Primero: qué significa UVA + una tasa</Heading>
          <p>Cuando recibís el préstamo, los pesos se convierten a una cantidad de UVA. Si te prestaran $10 millones y la UVA del desembolso valiera $2.000, empezarías debiendo 5.000 UVA. Son valores ilustrativos para entender la conversión.</p>
          <p>En cada vencimiento pagás en pesos usando la UVA aplicable a esa fecha. Su valor se vincula al Coeficiente de Estabilización de Referencia (CER), que incorpora la evolución de los precios. <strong>No sigue tu sueldo individual ni garantiza acompañar el precio de tu auto o tu casa.</strong> El propio BCRA advierte que los ingresos pueden no seguir la evolución de la UVA. <Fuente id="norma">Política de crédito, sección 6.</Fuente></p>
          <p>En el sistema francés, con tasa fija y períodos mensuales iguales, la cuota de capital más interés permanece constante en UVA. Al principio tiene más interés y menos devolución de capital; con los pagos, esa composición cambia. El equivalente en pesos se actualiza. Los seguros y otros accesorios pueden evolucionar de otra manera.</p>

          <Heading>La cuota que ves y el débito que pagás</Heading>
          <ul className="mb-6 list-disc space-y-3 pl-6">
            <li><strong>Amortización:</strong> la parte que devuelve el capital prestado.</li>
            <li><strong>Interés:</strong> el cargo sobre el saldo adeudado, además del ajuste UVA.</li>
            <li><strong>Impuestos aplicables:</strong> por ejemplo, IVA sobre intereses cuando corresponde; no sobre todo el capital por defecto.</li>
            <li><strong>Seguros y otros costos:</strong> según el producto, la cobertura y el contrato.</li>
          </ul>
          <p>El tratamiento impositivo puede diferir: los intereses de ciertos préstamos para casa habitación están exentos de IVA, sujeto a requisitos. No corresponde copiar automáticamente el costo tributario de un prendario a una hipoteca. <Fuente id="iva">Normativa sobre préstamos para vivienda.</Fuente></p>
          <p>Además del débito mensual, necesitás presupuestar el anticipo y los gastos de la operación: tasación, escritura, inscripción de la garantía y sellos, según corresponda. Después aparecen mantenimiento, patente o tributos inmobiliarios y expensas. Aunque no todos integren el costo financiero del préstamo, salen del mismo presupuesto familiar.</p>

          <Heading>Por qué tasa 0% no significa costo cero</Heading>
          <p>En un ejemplo oficial de Santander para un vehículo, $10 millones en UVA al 0% a 24 meses tienen una cuota de $416.671,01, más $145.325 de seguro automotor. La suma es <strong>$561.996,01</strong>. El CFTEA publicado es 35,22%. El ejemplo usa una UVA de referencia de julio de 2026: no es el valor de una cuota contratada hoy. <Fuente id="santander">Ejemplo y condiciones.</Fuente></p>
          <p>El 0% se refiere al interés de esa oferta. La deuda sigue ajustándose por UVA y el seguro agrega un desembolso. Por eso hay que mirar la unidad de ajuste, el débito completo y qué conceptos incluye el Costo Financiero Total (CFT).</p>
          <p>Como referencia hipotecaria, BNA publica 6,7% TNA para determinados solicitantes de vivienda única con acreditación de haberes, hasta 30 años. Su ejemplo informa CFTEA 7,02% sin prima CVS y 9,42% con ella. En una operación indexada, esos porcentajes no fijan el costo nominal final en pesos. <Fuente id="bna">Condiciones oficiales de BNA.</Fuente></p>

          <Heading id="plazos">La diferencia entre devolver en 4 años y en 30</Heading>
          <p>Para ver qué cambia por el plazo, usamos el mismo capital —$10 millones— y la misma TNA del 6,7% en todos los casos. <strong>Aplicar esa tasa al auto es un supuesto de comparación, no una oferta prendaria.</strong> Excluimos seguros, impuestos y comisiones.</p>
          <Tabla caption="Mismo capital y tasa: efecto del plazo. Importes a la UVA de inicio." headers={["Plazo", "Cuota base equivalente", "Capital devuelto tras 12 cuotas"]} rows={plazos.map((p) => [`${p.meses / 12} años`, pesos(p.cuota), porcentaje(p.amortizado)])} />
          <p>En cuatro años devolvés el 22,55% del capital durante el primer año. En treinta años devolvés apenas el 1,08%. La cuota hipotecaria más baja se consigue repartiendo la devolución en muchos más pagos, con una gran parte del capital todavía pendiente.</p>
          <p>Estas cuotas están expresadas al valor UVA inicial: <strong>no son el primer débito futuro garantizado</strong>. El vencimiento tendrá su propia cotización y los costos adicionales del contrato.</p>
          <p>En el ejercicio a cuatro años, capital más interés suma 1,143 veces el capital original en unidades constantes; a treinta años, 2,323 veces. No es la suma nominal futura en pesos ni una comparación por valor presente. Tampoco compara por sí sola la utilidad de comprar un auto y una vivienda.</p>

          <Heading>¿Puedo pagar y aun así deber más pesos?</Heading>
          <p>Sí. Si la UVA se duplicara al cabo del primer año, el saldo del ejemplo a cuatro años sería de {pesos(plazos[1].saldo * 2)}; a treinta años, de {pesos(plazos[3].saldo * 2)}. En ambos casos se habrían pagado las doce cuotas normalmente.</p>
          <p>El saldo en UVA estaría bajando, mientras su equivalencia en pesos subiría. Esa suba nominal no demuestra por sí sola que se hayan agregado intereses impagos. Para entender el resumen del banco conviene mirar ambas columnas: unidades pendientes y pesos equivalentes.</p>

          <Heading id="historia">Lo que muestran la UVA y los salarios en 2024 y 2025</Heading>
          <p>Los valores oficiales de la UVA al 31 de diciembre fueron $463,40 en 2023, $1.300,85 en 2024 y $1.707,79 en 2025. Eso implica aumentos entre cierres de 180,72% durante 2024 y 31,28% durante 2025. Fuentes: BCRA <Fuente id="uva23">2023</Fuente>, <Fuente id="uva24">2024</Fuente> y <Fuente id="uva25">2025</Fuente>.</p>
          <p>Hay un detalle decisivo: el IPC de 2024 fue 117,8%. No es el mismo porcentaje que la variación UVA entre esos cierres, porque el ajuste tiene un calendario propio. Para reconstruir una cuota hay que usar la UVA de las fechas correspondientes, no reemplazarla por la inflación anual. <Fuente id="ipc">IPC del INDEC.</Fuente> <Fuente id="cer">Metodología del CER.</Fuente></p>
          <p>Ahora supongamos una cuota base constante en UVA que representaba el 25% del ingreso en diciembre de 2023. ¿Qué habría pasado si ese ingreso hubiera seguido los índices salariales del INDEC?</p>
          <Tabla caption="Cuota base / ingreso: reconstrucción de cierres, con punto de partida del 25%." headers={["Fecha", "Salario total", "Privado registrado", "Sector público"]} rows={historia.map((h) => [h.fecha, ...[h.total, h.privado, h.publico].map((salario) => porcentaje(0.25 * (h.uva / historia[0].uva) / salario))])} />
          <p>Con el salario total, la carga termina 2024 en 28,59% y 2025 en 27,16%. Con el índice público, llega a 32,59% al cierre de 2025. La experiencia cambia según el ingreso con el que se compare. <Fuente id="salarios">INDEC, salarios de diciembre de 2025, cuadro 2.</Fuente></p>
          <p className="rounded-xl bg-gray-50 p-5 text-sm">Este ejercicio usa cierres anuales, no una serie mensual completa ni cuotas observadas de familias. No muestra el peor mes. Excluye seguros, topes, mora, congelamientos y refinanciaciones. Los índices salariales son agregados: tu ingreso puede evolucionar de otra manera.</p>

          <Heading id="escenarios">Qué pasa si la UVA sube más que tu ingreso</Heading>
          <p>Tomemos una carga inicial del 25%, un aumento anual supuesto de UVA del 30% y de ingresos del 20%. Es un escenario hipotético, no un pronóstico de inflación ni de salarios.</p>
          <Tabla caption="Escenario: UVA +30% anual e ingreso +20% anual. Sin gastos adicionales." headers={["Tiempo transcurrido", "Cuota base / ingreso"]} rows={[1, 2, 3, 4, 10].map((anios) => [`${anios} ${anios === 1 ? "año" : "años"}${anios === 10 ? " (hipoteca que continúa)" : ""}`, porcentaje(0.25 * (1.3 / 1.2) ** anios)])} />
          <p>A cuatro años, la cuota ocuparía 34,43% del ingreso. Una hipoteca que siguiera vigente bajo el mismo supuesto llegaría a 55,66% a los diez años. La acumulación del desajuste explica por qué el horizonte importa.</p>
          <p>Si el ingreso y la UVA crecen igual, la carga de la cuota base se mantiene estable. Si el ingreso le gana, baja. Y si el ingreso cae 20% de golpe, una carga inicial del 25% pasa a 31,25%, incluso sin ajuste UVA.</p>

          <Heading id="bien">El auto y la casa también tienen un valor de venta</Heading>
          <p>El plazo no es la única diferencia. El auto puede perder valor por uso, antigüedad y cambios del mercado. La vivienda depende de ubicación, estado, demanda y moneda de referencia. <strong>Ninguno tiene garantizado seguir al CER.</strong></p>
          <p>Para medir la posibilidad de salir de la deuda usamos otra relación: saldo en pesos dividido por valor de venta del bien en pesos. Si el bien se cotiza en dólares, hay que convertirlo con un tipo de cambio compatible con la operación.</p>
          <p>Como sensibilidad, imaginemos un crédito a cuatro años al 6,7%, que financió el 80% de la compra. Si al primer año el bien perdiera el 40% de su valor medido en UVA, la deuda representaría aproximadamente 103,26% de ese valor. Venderlo no alcanzaría para cancelar, incluso antes de gastos de venta. <strong>Esa caída es un supuesto de prueba, no una depreciación observada.</strong></p>
          <p>También importa qué reemplaza cada compra. Una vivienda puede evitar un alquiler. Un auto puede ahorrar transporte o generar ingresos de trabajo, descontando sus costos. Para evaluar conveniencia económica hay que sumar anticipo, gastos, mantenimiento, costo de oportunidad y valor residual.</p>
          <p>En San Martín de los Andes, además, conviene contrastar el crédito con la propiedad concreta y su documentación. Una cuenta nacional no reemplaza la revisión del inmueble que querés comprar. Podés ampliar este punto en nuestra nota sobre <Link href="/blog/cuando-el-plano-no-coincide-con-la-casa" className="text-rose-700 underline underline-offset-4">qué pasa cuando el plano no coincide con la casa</Link>.</p>

          <Heading>¿Hay un tope si los salarios quedan atrás?</Heading>
          <p>No hay que darlo por supuesto. En mayo de 2024 se eliminó la obligación general anterior de ofrecer extensión o tope en determinadas condiciones para préstamos UVA. La sección 6.1 del texto ordenado del BCRA consultado en junio de 2026 mantiene ese esquema; no debe confundirse con las reglas de UVI. <Fuente id="cambio">Cambio normativo.</Fuente> <Fuente id="norma">Texto ordenado.</Fuente></p>
          <p>Algunas entidades ofrecen opciones contractuales vinculadas al Coeficiente de Variación Salarial (CVS). Ese índice tampoco es tu sueldo individual. Hay que revisar requisitos, prima, alcance y tratamiento de cualquier diferencia.</p>
          <p>La cancelación anticipada puede tener costos. Por ejemplo, BBVA informa para hipotecas cancelación total sin costo después del mayor entre 180 días y el 25% del plazo; antes, 4% más IVA. Revisá las condiciones de tu operación, incluida la diferencia entre cancelación total y parcial. <Fuente id="cancelacion">Condiciones de BBVA.</Fuente></p>

          <Heading id="antes-de-firmar">Las preguntas que conviene llevar al banco</Heading>
          <ol className="mb-8 list-decimal space-y-3 pl-6">
            <li>¿Cuánto dinero recibo y cuánto necesito de anticipo y gastos iniciales?</li>
            <li>¿Cuántas UVA debo y cuál es la tasa sobre ese saldo?</li>
            <li>¿Cuál es el débito completo, con impuestos, seguros y cargos?</li>
            <li>¿Qué incluye el CFT y bajo qué supuestos está calculado?</li>
            <li>¿Cómo quedaría mi presupuesto si el ingreso se atrasa o cae?</li>
            <li>¿Hay cobertura CVS? ¿Cuánto cuesta y qué cubre exactamente?</li>
            <li>¿Cuánto cuesta cancelar antes y qué pasa si vendo el bien?</li>
          </ol>
          <p>La aprobación bancaria no reemplaza tu presupuesto. Además de la cuota, necesitás cubrir los gastos esenciales, otras deudas y una reserva para imprevistos. Una cuota inicial baja puede facilitar la compra, pero no describe por sí sola el compromiso completo.</p>

          <details className="my-10 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
            <summary className="cursor-pointer font-bold text-gray-900">Cómo hicimos las cuentas y qué límites tienen</summary>
            <div className="mt-5 text-sm leading-relaxed">
              <p>Usamos amortización francesa con períodos mensuales iguales. Si P es el capital en UVA, i = TNA / 12 y n la cantidad de cuotas, la cuota base es A = P × i / [1 − (1 + i)^(−n)]. A tasa cero, A = P / n. Cada mes, interés = saldo × i; amortización = A − interés; nuevo saldo = saldo − amortización.</p>
              <p>El pago en pesos se obtiene multiplicando el servicio en UVA por la cotización aplicable y sumando los cargos correspondientes. Para la carga sobre ingresos, multiplicamos la relación inicial por el crecimiento acumulado de UVA y la dividimos por el crecimiento acumulado del ingreso.</p>
              <p>Se verificaron la devolución completa del capital, el saldo final, el caso de tasa cero y los saldos mediante una fórmula independiente. Las tablas muestran elaboración propia a partir de los supuestos indicados. No se estimaron probabilidades de incumplimiento ni treinta años de evolución futura.</p>
              <p>El histórico emplea cierres de 2023 a 2025 y porcentajes salariales del INDEC. No es una reconstrucción mensual completa. Las variaciones de precios de autos o inmuebles usadas como sensibilidad no son datos de transacciones locales.</p>
              <p>También encontramos inconsistencias en páginas comerciales: el <Fuente id="cvs">simulador BNA</Fuente> mezcla «2 p.p.a.» con una aclaración escrita de 1,50 puntos; su página de producto muestra dos límites distintos en UVA. Un <Fuente id="bbva">ejemplo prendario BBVA</Fuente> presenta equivalencias UVA incompatibles entre componentes. No usamos esos datos ambiguos para calcular la comparación ni modelamos la cobertura CVS.</p>
              <p className="!mb-0">Fuentes consultadas al 8 de septiembre de 2026: BCRA, INDEC, normativa tributaria y páginas oficiales de las entidades, enlazadas junto a cada dato. Los ejemplos comerciales no constituyen una recomendación personalizada ni garantizan condiciones futuras.</p>
            </div>
          </details>
          <section className="mt-14 rounded-2xl bg-gray-50 p-6 sm:p-8">
            <h2 className="mb-7 text-2xl font-black text-gray-900 sm:text-3xl">Preguntas frecuentes</h2>
            <div className="space-y-6">{faqs.map(([question, answer]) => <div key={question}><h3 className="text-lg font-bold text-gray-900">{question}</h3><p className="mt-2 !mb-0">{answer}</p></div>)}</div>
          </section>
          <section className="mt-12 border-t border-gray-100 pt-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">También te puede interesar</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/blog/creditos-hipotecarios-uva-2026" className="rounded-2xl border border-gray-200 p-5 hover:shadow-md"><p className="text-xs font-bold uppercase text-rose-600">Guía de compra</p><p className="!mb-0 font-bold text-gray-900">Cómo funciona un crédito UVA, paso a paso</p></Link>
              <Link href="/blog/cuando-el-plano-no-coincide-con-la-casa" className="rounded-2xl border border-gray-200 p-5 hover:shadow-md"><p className="text-xs font-bold uppercase text-rose-600">Guía legal</p><p className="!mb-0 font-bold text-gray-900">Cuando el plano no coincide con la casa</p></Link>
            </div>
          </section>
          <footer className="mt-10 border-t border-gray-200 pt-6">
            <Link href="/blog" className="font-semibold text-rose-700 hover:underline">Ver más artículos del blog</Link>
          </footer>
        </div>
      </article>
    </>
  );
}
