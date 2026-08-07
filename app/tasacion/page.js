import TasacionForm from "@/components/TasacionForm";
import TrackedLink from "@/components/TrackedLink";
import { canonicalUrl, DEFAULT_OG_IMAGE, TASADOR_URL } from "@/config";
import { RELEVADAS_TOTAL_FMT, VALOR_M2_CASA, VALOR_M2_DEPTO } from "@/lib/mercado";

export const metadata = {
  title: "Tasación de propiedades en San Martín de los Andes",
  description: "Solicitá una tasación orientativa gratuita de tu propiedad en San Martín de los Andes. Respuesta en menos de 48 hs con datos reales del mercado local.",
  openGraph: {
    title: "Tasación gratuita en San Martín de los Andes — Catalán Propiedades",
    description: "Descubrí el valor de tu propiedad con datos reales del mercado. Sin costo, sin compromiso, respuesta en 48 hs.",
    url: canonicalUrl("/tasacion"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Tasación de propiedades en San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tasación gratuita en San Martín de los Andes",
    description: "Descubrí el valor de tu propiedad con datos reales del mercado. Sin costo, respuesta en 48 hs.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/tasacion"),
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta la tasación de una propiedad en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La tasación orientativa de Catalán Propiedades es completamente gratuita y sin compromiso. Completás el formulario y recibís una estimación basada en datos reales del mercado local en menos de 48 horas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto tarda en llegar la tasación?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El tiempo de respuesta es de menos de 48 horas hábiles. Milton Catalán revisa personalmente cada solicitud y te contacta por WhatsApp o email con la estimación.",
      },
    },
    {
      "@type": "Question",
      name: "¿En qué se basa la tasación de propiedades en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `La tasación se basa en ${RELEVADAS_TOTAL_FMT} propiedades relevadas en San Martín de los Andes, datos reales de operaciones cerradas en la zona, precio del m² por barrio, y características específicas de la propiedad como superficie, estado, ubicación y amenidades.`,
      },
    },
    {
      "@type": "Question",
      name: "¿La tasación orientativa reemplaza una tasación profesional formal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. La tasación orientativa es una estimación referencial útil para tomar decisiones iniciales. Para operaciones formales de compra, venta o garantías bancarias se requiere una tasación profesional certificada.",
      },
    },
  ],
};

export default function TasacionPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="bg-slate-900 pt-10 pb-10 md:pt-24 md:pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 text-slate-300 text-[11px] font-medium tracking-wider uppercase px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Gratis · sin compromiso
          </span>
          <h1 className="text-3xl md:text-[42px] font-bold text-white mb-4 leading-[1.15]">
            ¿Cuánto vale tu propiedad en San Martín de los Andes?
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">
            Completá los datos y Milton te responde con una estimación basada en el mercado real de la zona.
          </p>

          <div className="grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden mt-9">
            {[
              { valor: RELEVADAS_TOTAL_FMT, label: "propiedades relevadas" },
              { valor: `USD ${VALOR_M2_CASA.toLocaleString("es-AR")}`, label: "el m² en casas" },
              { valor: `USD ${VALOR_M2_DEPTO.toLocaleString("es-AR")}`, label: "el m² en departamentos" },
            ].map((m) => (
              <div key={m.label} className="bg-slate-900 px-4 py-4">
                <p className="text-white text-lg md:text-xl font-bold tabular-nums leading-tight">{m.valor}</p>
                <p className="text-slate-500 text-[11px] md:text-xs mt-1 leading-snug">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Tasador instantáneo con modelo entrenado */}
        <TrackedLink
          event="tasador_click"
          eventParams={{ source: "tasacion" }}
          href={TASADOR_URL}
          className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 mb-9 rounded-xl bg-rose-50 border border-rose-100 hover:border-rose-200 transition-colors"
        >
          <span className="w-10 h-10 rounded-lg bg-rose-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="text-rose-900 font-semibold leading-snug">Tasador instantáneo</p>
            <p className="text-rose-800/80 text-sm leading-relaxed mt-0.5">
              Resultado en segundos con el modelo predictivo, más un informe PDF gratis.
            </p>
          </div>
          <span className="inline-flex items-center justify-center gap-2 bg-rose-600 group-hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap flex-shrink-0">
            Probar
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </TrackedLink>

        <div className="flex items-center gap-3 mb-10">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">o pedí la tasación personal de Milton</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Formulario */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <TasacionForm />
        </div>

        <p className="text-gray-400 text-xs text-center mt-6">
          La tasación orientativa no reemplaza una tasación profesional formal. Los valores son referenciales y pueden variar según condiciones del mercado.
        </p>
      </div>
    </div>
  );
}
