import Image from "next/image";
import Link from "next/link";
import { SITE_URL, canonicalUrl } from "@/config";
import PodcastPlayer from "@/components/PodcastPlayer";

const path = "/blog/sena-reserva-compraventa-inquilino";
const url = canonicalUrl(path);
const image = `${SITE_URL}/planos.jpg`;
const carolinaImage = "/carolina-godoy.jpeg";
const linkedin = "https://www.linkedin.com/in/cjgodoy/";
const ccyc = "https://www.argentina.gob.ar/normativa/nacional/ley-26994-235975/actualizacion";
const dnu = "https://www.argentina.gob.ar/normativa/nacional/decreto-70-2023-395521/texto";

export const metadata = {
  title: "Seña o reserva: diferencias y qué pasa si compra el inquilino",
  description: "Guía legal sobre reserva, seña confirmatoria y penitencial, boleto de compraventa y alquiler cuando el inquilino compra la propiedad que ocupa.",
  keywords: "seña reserva compraventa inmueble, seña confirmatoria, seña penitencial, boleto compraventa, inquilino compra propiedad",
  openGraph: {
    title: "Seña o reserva: qué firmás y qué pasa si el comprador ya vive adentro",
    description: "Cómo se ordenan la reserva, la seña, el boleto, el alquiler y el depósito cuando un inquilino compra la propiedad que ocupa.",
    url,
    type: "article",
    publishedTime: "2026-08-12T00:00:00-03:00",
    modifiedTime: "2026-08-12T00:00:00-03:00",
    authors: ["Carolina Godoy"],
    images: [{ url: image, width: 1200, height: 630, alt: "Guía legal sobre seña, reserva y compraventa inmobiliaria" }],
  },
  twitter: { card: "summary_large_image", title: "Seña o reserva: qué firma cada parte", description: "Qué efecto tiene cada instrumento y qué ocurre cuando el comprador también es el inquilino.", images: [image] },
  alternates: { canonical: url },
};

const faqs = [
  ["¿Reserva y seña son lo mismo?", "No. La reserva no tiene regulación propia en el Código y suele funcionar como una oferta sujeta a aceptación del propietario. La seña está regulada por los artículos 1059 y 1060 y se presume confirmatoria, salvo pacto expreso de arrepentimiento."],
  ["Si señé una compra y me arrepiento, ¿solo pierdo la seña?", "Depende. Con una seña penitencial, quien la entregó la pierde y quien la recibió devuelve el doble. Si no se aclaró nada, se presume confirmatoria y la otra parte puede exigir el cumplimiento y reclamar daños."],
  ["Si soy inquilino y firmo el boleto, ¿dejo de pagar alquiler?", "No automáticamente. Compraventa y locación son contratos distintos. Hasta la escritura el alquiler sigue devengándose, salvo que el boleto establezca expresamente otra cosa."],
  ["¿Cuándo deja de correr el alquiler?", "Al escriturar, comprador e inquilino pasan a ser la misma persona. La obligación se extingue por confusión al reunirse las calidades de acreedor y deudor en un mismo patrimonio."],
  ["¿El inquilino tiene prioridad legal para comprar?", "No. En Argentina no existe un derecho legal general de preferencia para el inquilino. Solo existe si fue pactado expresamente por escrito."],
];

const articleJsonLd = {
  "@context": "https://schema.org", "@type": "Article",
  headline: "Seña, reserva: qué firma cada quién y qué pasa cuando el que compra ya vive adentro",
  description: "Guía legal sobre reserva, seña, boleto de compraventa y locación cuando el inquilino compra la propiedad que ocupa.",
  image, datePublished: "2026-08-12", dateModified: "2026-08-12",
  author: { "@type": "Person", name: "Carolina Godoy", image: `${SITE_URL}${carolinaImage}`, telephone: "2944-630649", sameAs: [linkedin] },
  publisher: { "@type": "Organization", name: "Catalán Propiedades", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-catalan.png` } },
  mainEntityOfPage: { "@type": "WebPage", "@id": url },
};

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
};

function Heading({ children }) {
  return <h2 className="mb-5 mt-12 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">{children}</h2>;
}

export default function SenaReservaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10 sm:mb-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-rose-600">Guía legal · Contratos</p>
          <h1 className="max-w-3xl text-[2rem] font-black leading-[1.08] text-gray-900 sm:text-4xl md:text-5xl">Seña, reserva: qué firma cada quién y qué pasa cuando el que compra ya vive adentro</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-xl">Hay un caso que en San Martín de los Andes aparece seguido: el inquilino que termina comprando la casa que alquila. Ahí se cruzan dos contratos y conviene tener claro cómo se ordenan.</p>
          <div className="mt-8 flex items-center gap-4 border-t border-gray-200 pt-7">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-rose-100"><Image src={carolinaImage} alt="Carolina Godoy" fill sizes="48px" className="object-cover" /></div>
            <div><p className="font-bold text-gray-900">Carolina Godoy</p><p className="text-sm text-gray-500">Autora · 12 de agosto de 2026 · 8 min de lectura</p></div>
          </div>
          <div className="relative mt-8 aspect-[16/8.43] overflow-hidden rounded-2xl bg-gray-100"><Image src="/planos.jpg" alt="Planos y documentación de una operación inmobiliaria" fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" /></div>
        </header>

        <PodcastPlayer slug="sena-reserva-compraventa-inquilino" />

        <div className="prose prose-lg max-w-none text-gray-700">
          <div className="not-prose rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-widest text-rose-700">Idea central</p><p className="mt-3 text-lg font-semibold leading-relaxed text-gray-900">Seña y reserva no son etapas obligatorias de una misma cosa. Son instrumentos distintos y sus efectos dependen de lo que se haya escrito. Si comprador e inquilino son la misma persona, además hay dos contratos vivos hasta la escritura.</p></div>

          <Heading>La reserva: el primer papel y el más malentendido</Heading>
          <p>La reserva suele firmarse cuando un interesado quiere sacar una propiedad del mercado mientras se termina de definir la operación. Entrega una suma y, a cambio, el inmueble deja de ofrecerse durante un plazo.</p>
          <p>No tiene una regulación propia en el Código Civil y Comercial. En la práctica funciona como una oferta de compra que el propietario todavía puede aceptar o rechazar. Hasta que el dueño no acepta, no hay operación cerrada.</p>
          <p>Su efecto depende del texto. Si el propietario acepta y luego una parte se arrepiente, el destino del dinero se resuelve según lo escrito. Una reserva de dos líneas puede generar más conflicto que protección.</p>

          <Heading>La seña: el Código sí tiene reglas</Heading>
          <p>La seña —o arras— está regulada por los artículos 1059 y 1060. El Código actual presume que es <strong>confirmatoria</strong>: refuerza el contrato y se imputa a cuenta del precio. No habilita a arrepentirse, salvo que las partes lo pacten expresamente.</p>
          <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-6"><p className="text-sm font-black uppercase tracking-wide text-gray-500">Seña confirmatoria</p><p className="mt-3 leading-relaxed text-gray-700">Es la regla si no se aclara nada. Confirma la operación y el incumplimiento puede habilitar un reclamo de cumplimiento y daños.</p></div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><p className="text-sm font-black uppercase tracking-wide text-amber-800">Seña penitencial</p><p className="mt-3 leading-relaxed text-gray-700">Solo existe si se pacta expresamente. Quien la entregó y se arrepiente la pierde; quien la recibió debe devolver el doble, salvo otro acuerdo.</p></div>
          </div>

          <Heading>Entonces, ¿en qué se diferencian?</Heading>
          <ul><li><strong>Reserva:</strong> opera como oferta sujeta a aceptación y sus efectos dependen de la redacción.</li><li><strong>Seña:</strong> se presume confirmatoria y funciona como parte del precio. Solo permite arrepentirse si se pacta como penitencial.</li></ul>

          <Heading>Cuando quien compra ya alquila la propiedad</Heading>
          <p>Alguien alquila una casa, decide comprarla, entrega una seña, firma el boleto y avanza hacia la escritura. Mientras todo eso ocurre, el contrato de locación sigue vivo.</p>
          <h3>Señar o firmar el boleto no extingue el alquiler</h3>
          <p>La locación da el uso y goce; la compraventa busca transmitir la propiedad. Hasta la escritura, la persona sigue siendo inquilina y debe pagar el alquiler, salvo que el boleto diga expresamente otra cosa.</p>
          <p>Puede pactarse que desde el boleto se suspenda el alquiler o que determinados pagos se imputen al precio. Si el boleto calla, la locación continúa normalmente.</p>
          <h3>Con la escritura aparece la “confusión”</h3>
          <p>Al escriturar, quien debía pagar y quien tenía derecho a cobrar pasan a ser la misma persona. El artículo 931 llama a esto <strong>confusión</strong>. En términos simples, nadie puede ser inquilino de sí mismo.</p>
          <h3>El depósito de garantía</h3>
          <p>Puede devolverse o computarse a cuenta del precio. Lo importante es resolverlo en la misma operación y dejar constancia escrita, junto con la fecha hasta la cual se devengó el alquiler.</p>

          <Heading>Qué mirar antes de firmar</Heading>
          <div className="not-prose space-y-4">
            {[["Si entregás una reserva o seña", "Exigí que el instrumento identifique qué es y cuáles son las consecuencias del arrepentimiento o incumplimiento."], ["Si comprás la casa que alquilás", "Dejá escrito en el boleto qué pasa con el alquiler y el depósito hasta la escritura."], ["Si le vendés a tu inquilino", "Cerrá la cuenta de la locación: depósito, alquileres y fecha de finalización."]].map(([title, text], i) => <div key={title} className="flex gap-4 rounded-2xl bg-gray-50 p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-black text-white">{i + 1}</span><div><h3 className="font-bold text-gray-900">{title}</h3><p className="mt-1 leading-relaxed text-gray-700">{text}</p></div></div>)}
          </div>

          <section className="not-prose mt-14 rounded-2xl border border-rose-200 bg-rose-50 p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white"><Image src={carolinaImage} alt="Carolina Godoy" fill sizes="80px" className="object-cover" /></div><div><h2 className="text-2xl font-black text-gray-900">Carolina Godoy</h2><p className="mt-2 leading-relaxed text-gray-700">Consultas sobre seña, reserva, boletos de compraventa y contratos de locación en San Martín de los Andes y la Provincia del Neuquén.</p><div className="mt-4 flex flex-wrap gap-3"><a href="tel:2944630649" className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">Llamar al 2944-630649</a><a href={linkedin} target="_blank" rel="noreferrer" className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-700">Ver perfil en LinkedIn</a></div></div></div></section>

          <section className="not-prose mt-14 rounded-2xl bg-gray-50 p-8"><h2 className="text-2xl font-black text-gray-900">Fuentes normativas</h2><ul className="mt-5 space-y-3 text-gray-700"><li><a href={ccyc} target="_blank" rel="noreferrer" className="font-semibold text-rose-700 underline underline-offset-4">Código Civil y Comercial de la Nación</a>: arts. 999, 1059, 1060, 1165, 1170, 1171, 931, 932 y 1217 a 1221.</li><li><a href={dnu} target="_blank" rel="noreferrer" className="font-semibold text-rose-700 underline underline-offset-4">DNU 70/2023</a>: modificaciones al régimen de locaciones.</li></ul></section>

          <section className="not-prose mt-14 rounded-2xl bg-gray-50 p-8"><h2 className="mb-7 text-3xl font-black text-gray-900">Preguntas frecuentes</h2><div className="space-y-6">{faqs.map(([question, answer]) => <div key={question}><h3 className="text-lg font-bold text-gray-900">{question}</h3><p className="mt-2 leading-relaxed text-gray-700">{answer}</p></div>)}</div></section>

          <div className="not-prose mt-12 rounded-xl bg-amber-50 p-6 text-sm leading-relaxed text-amber-950"><p className="font-bold">Aviso legal</p><p className="mt-2">Este contenido es informativo y no reemplaza el asesoramiento profesional. Cada operación requiere análisis particular por escribano o abogado, y la redacción concreta de la reserva, la seña y el boleto define en gran medida sus efectos.</p></div>

          <section className="not-prose mt-12 border-t border-gray-100 pt-10"><p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">También te puede interesar</p><div className="grid gap-4 sm:grid-cols-2"><Link href="/blog/alquileres-san-martin-de-los-andes-2026" className="rounded-2xl border border-gray-200 p-5 hover:shadow-md"><p className="text-xs font-bold uppercase text-rose-600">Guía legal</p><p className="mt-2 font-bold text-gray-900">Alquileres: qué revisar antes de firmar</p></Link><Link href="/blog/cuando-el-plano-no-coincide-con-la-casa" className="rounded-2xl border border-gray-200 p-5 hover:shadow-md"><p className="text-xs font-bold uppercase text-rose-600">Guía legal</p><p className="mt-2 font-bold text-gray-900">Cuando el plano no coincide con la casa</p></Link></div></section>
        </div>
      </article>
    </>
  );
}
