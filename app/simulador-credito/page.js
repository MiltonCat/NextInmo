import Link from "next/link";
import SimuladorCuota from "@/components/SimuladorCuota";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";

export const metadata = {
  title: "Simulador de crédito hipotecario UVA",
  description:
    "Calculá la cuota inicial de un crédito hipotecario UVA para comprar en San Martín de los Andes: anticipo, plazo, tasa e ingreso mínimo requerido. Gratis y al instante.",
  openGraph: {
    title: "Simulador de crédito hipotecario UVA — Catalán Propiedades",
    description:
      "Calculá cuánto pagarías por mes y qué ingreso necesitás para comprar con crédito UVA en San Martín de los Andes.",
    url: canonicalUrl("/simulador-credito"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Simulador de crédito hipotecario UVA en San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulador de crédito hipotecario UVA",
    description:
      "Calculá cuota inicial, ingreso mínimo y anticipo para comprar con crédito UVA en San Martín de los Andes.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/simulador-credito"),
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto ingreso necesito para un crédito hipotecario UVA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La regla general de los bancos es que la cuota inicial no supere el 25% de tus ingresos netos. Es decir, necesitás ingresos de al menos 4 veces la cuota. Podés sumar ingresos con tu pareja o familiar directo en la mayoría de los bancos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué anticipo piden los bancos para comprar una propiedad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Los bancos financian entre el 70% y el 80% del valor de la propiedad, por lo que necesitás un anticipo del 20% al 30%, más los gastos de escrituración (escribano, impuestos y comisión), que en Neuquén rondan el 8% a 10% adicional.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo se ajusta la cuota de un crédito UVA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En los créditos UVA el capital se expresa en Unidades de Valor Adquisitivo, que se actualizan por inflación (CER). La cuota inicial es la más representativa hoy y luego se ajusta mes a mes según la inflación. Las tasas varían según el banco: consultá la lista comparativa oficial del BCRA que se actualiza mensualmente.",
      },
    },
    {
      "@type": "Question",
      name: "¿Se puede comprar con crédito hipotecario en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Varios bancos otorgan créditos hipotecarios UVA para propiedades en San Martín de los Andes. La propiedad debe ser apta crédito: con título perfecto, planos aprobados y escritura inmediata. En Catalán Propiedades te orientamos para que la propiedad que elijas sea compatible con tu crédito.",
      },
    },
  ],
};

export default function SimuladorCreditoPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-16 sm:px-6 md:pt-28 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-rose-600 text-xs font-semibold tracking-widest uppercase">Simulador</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-3">
          Simulá tu crédito hipotecario UVA
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xl">
          Calculá la cuota inicial, el ingreso mínimo que te van a pedir y cuánto necesitás
          tener ahorrado para comprar en San Martín de los Andes. Sin registrarte, al instante.
        </p>

        <SimuladorCuota />

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <Link
            href="/blog/credito-hipotecario-neuquen-2026"
            className="border border-gray-200 rounded-xl p-5 hover:border-rose-400 transition group"
          >
            <p className="text-rose-600 text-[11px] font-bold tracking-widest uppercase mb-1">Guía</p>
            <p className="font-semibold text-gray-800 group-hover:text-rose-600 transition text-sm">
              Crédito hipotecario en Neuquén: bancos, requisitos y paso a paso
            </p>
          </Link>
          <Link
            href="/propiedades"
            className="border border-gray-200 rounded-xl p-5 hover:border-rose-400 transition group"
          >
            <p className="text-rose-600 text-[11px] font-bold tracking-widest uppercase mb-1">Propiedades</p>
            <p className="font-semibold text-gray-800 group-hover:text-rose-600 transition text-sm">
              Ver propiedades en venta en San Martín de los Andes
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
