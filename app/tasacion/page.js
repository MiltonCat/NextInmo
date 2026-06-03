import TasacionForm from "@/components/TasacionForm";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";

export const metadata = {
  title: "Tasación de propiedades en San Martín de los Andes | Catalán Propiedades",
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
        text: "La tasación se basa en más de 600 propiedades relevadas en San Martín de los Andes, datos reales de operaciones cerradas en la zona, precio del m² por barrio, y características específicas de la propiedad como superficie, estado, ubicación y amenidades.",
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

      <section className="bg-gray-50 border-b border-gray-100 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-rose-600 text-xs font-bold tracking-widest uppercase mb-3">Gratuito · Sin compromiso</p>
          <h1 className="text-4xl font-black text-gray-900 mb-3 leading-tight">
            ¿Cuánto vale tu propiedad en San Martín de los Andes?
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl">
            Completá el formulario y Milton te envía una estimación orientativa basada en datos reales del mercado local. Sin turnos, sin costo, sin compromiso.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Beneficios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: "⏱", titulo: "Respuesta en 48 hs", desc: "Sin esperas largas ni burocracia" },
            { icon: "📊", titulo: "Basado en datos reales", desc: "600+ propiedades relevadas en SMA" },
            { icon: "🤝", titulo: "Sin compromiso", desc: "La tasación es orientativa y gratuita" },
          ].map((b) => (
            <div key={b.titulo} className="flex gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <span className="text-xl mt-0.5">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{b.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <TasacionForm />
        </div>

        <p className="text-gray-400 text-xs text-center mt-6">
          La tasación orientativa no reemplaza una tasación profesional formal. Los valores son referenciales y pueden variar según condiciones del mercado.
        </p>
      </div>
    </div>
  );
}
