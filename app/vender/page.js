import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import { canonicalUrl, DEFAULT_OG_IMAGE, TASADOR_URL, WA_URL } from "@/config";

export const metadata = {
  title: "Vendé tu propiedad en San Martín de los Andes | Catalán Propiedades",
  description:
    "Vendé tu casa, departamento o lote en San Martín de los Andes al precio correcto. Tasación gratuita con datos reales del mercado, difusión en todos los portales y acompañamiento hasta la escritura.",
  openGraph: {
    title: "Vendé tu propiedad en San Martín de los Andes — Catalán Propiedades",
    description:
      "Tasación gratuita con datos reales, difusión profesional y acompañamiento completo hasta la escritura.",
    url: canonicalUrl("/vender"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Vender propiedad en San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vendé tu propiedad en San Martín de los Andes",
    description:
      "Tasación gratuita con datos reales del mercado y difusión profesional. Catalán Propiedades.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/vender"),
  },
};

const WA_VENDER_URL = `${WA_URL}?text=${encodeURIComponent(
  "Hola Milton, quiero vender mi propiedad en San Martín de los Andes y me gustaría recibir asesoramiento."
)}`;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta publicar mi propiedad con Catalán Propiedades?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Publicar tu propiedad no tiene costo. La tasación inicial, las fotos, la publicación en portales y la difusión están incluidas. Solo se cobra la comisión inmobiliaria habitual cuando la operación se concreta.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo se define el precio de venta de mi propiedad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El precio se define con datos: más de 600 propiedades relevadas en San Martín de los Andes, valores reales del m² por barrio y un modelo predictivo propio. Un precio correcto desde el inicio evita que la propiedad quede meses sin consultas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Dónde se publica mi propiedad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En los principales portales inmobiliarios del país, en catalanpropiedades.com.ar y en redes sociales. Además se presenta directamente a la cartera de compradores e inversores que buscan en la zona.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué necesito para empezar a vender mi propiedad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Solo los datos básicos de la propiedad para la tasación inicial. Después, Milton te acompaña con la documentación necesaria: título de propiedad, planos y estado de deudas e impuestos, hasta llegar a la escritura con seguridad jurídica.",
      },
    },
  ],
};

const PASOS = [
  {
    numero: "01",
    titulo: "Tasación con datos",
    desc: "Estimamos el valor real con el modelo predictivo y comparables del mercado local. Gratis y sin compromiso.",
  },
  {
    numero: "02",
    titulo: "Plan de venta",
    desc: "Definimos juntos precio, fotos profesionales y estrategia de difusión según el tipo de propiedad y tu urgencia.",
  },
  {
    numero: "03",
    titulo: "Difusión total",
    desc: "Tu propiedad se publica en portales, web propia y redes, y se presenta a compradores e inversores activos.",
  },
  {
    numero: "04",
    titulo: "Cierre seguro",
    desc: "Negociación, reserva y escritura con acompañamiento jurídico completo. Vos firmás tranquilo.",
  },
];

const DIFERENCIALES = [
  {
    icon: "📊",
    titulo: "Precio respaldado por datos",
    desc: "600+ propiedades relevadas en SMA y un modelo predictivo propio. El precio correcto desde el día uno.",
  },
  {
    icon: "📣",
    titulo: "Difusión multicanal",
    desc: "Portales nacionales, web propia, redes sociales y cartera activa de compradores e inversores.",
  },
  {
    icon: "🤝",
    titulo: "Trato directo con Milton",
    desc: "Sin intermediarios ni vendedores rotativos. Una sola persona responsable de tu operación, de punta a punta.",
  },
  {
    icon: "⚖️",
    titulo: "Seguridad jurídica",
    desc: "Documentación, reserva y escritura revisadas en cada paso. Más de 10 años operando en la zona.",
  },
];

export default function VenderPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-100 pt-8 pb-10 md:pt-24 md:pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-rose-600 text-xs font-bold tracking-widest uppercase mb-3">
            Para propietarios · Sin costo de publicación
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
            Vendé tu propiedad en San Martín de los Andes al precio correcto
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-xl mb-6">
            Una propiedad mal tasada se queda meses sin consultas. Acá el precio se define
            con datos reales del mercado local, y la venta se acompaña de punta a punta:
            desde la tasación hasta la escritura.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <TrackedLink
              event="tasador_click"
              eventParams={{ source: "vender_hero" }}
              href={TASADOR_URL}
              className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
            >
              Tasar gratis online en 2 minutos
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </TrackedLink>
            <TrackedLink
              event="whatsapp_click"
              eventParams={{ location: "vender_hero" }}
              href={WA_VENDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-full text-sm transition-colors"
            >
              Hablar con Milton por WhatsApp
            </TrackedLink>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

        {/* Cómo trabajamos */}
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
          Cómo vendemos tu propiedad
        </h2>
        <p className="text-gray-500 text-sm md:text-base mb-8">
          Un proceso claro, sin letra chica y con vos informado en cada paso.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {PASOS.map((paso) => (
            <div key={paso.numero} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-rose-600 text-xs font-black tracking-widest mb-2">{paso.numero}</p>
              <p className="text-base font-bold text-gray-900 mb-1">{paso.titulo}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{paso.desc}</p>
            </div>
          ))}
        </div>

        {/* Diferenciales */}
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
          Por qué vender con Catalán Propiedades
        </h2>
        <p className="text-gray-500 text-sm md:text-base mb-8">
          No somos un portal: somos asesores locales que deciden con datos.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {DIFERENCIALES.map((d) => (
            <div key={d.titulo} className="flex gap-3 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <span className="text-2xl mt-0.5">{d.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900">{d.titulo}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA tasador */}
        <TrackedLink
          event="tasador_click"
          eventParams={{ source: "vender_cta" }}
          href={TASADOR_URL}
          className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 mb-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex-1">
            <p className="text-rose-400 text-[11px] font-bold tracking-widest uppercase mb-1.5">
              El primer paso · Resultado al instante
            </p>
            <p className="text-white text-lg font-bold leading-snug mb-1">
              Descubrí cuánto vale tu propiedad hoy
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Tasador predictivo entrenado con datos reales de San Martín de los Andes.
              Estimación inmediata más informe PDF gratis.
            </p>
          </div>
          <span className="inline-flex items-center justify-center gap-2 bg-rose-600 group-hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors whitespace-nowrap flex-shrink-0">
            Tasar al instante
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </TrackedLink>

        {/* FAQ */}
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">
          Preguntas frecuentes
        </h2>
        <div className="space-y-4 mb-14">
          {faqJsonLd.mainEntity.map((faq) => (
            <details key={faq.name} className="group bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <summary className="text-sm font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between gap-3">
                {faq.name}
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg leading-none flex-shrink-0">+</span>
              </summary>
              <p className="text-sm text-gray-500 leading-relaxed mt-3">
                {faq.acceptedAnswer.text}
              </p>
            </details>
          ))}
        </div>

        {/* CTA final */}
        <div className="text-center bg-gray-50 border border-gray-100 rounded-2xl p-8">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
            ¿Listo para vender?
          </h2>
          <p className="text-gray-500 text-sm md:text-base mb-6 max-w-md mx-auto">
            Empezá con una tasación gratuita o escribile directo a Milton.
            Sin compromiso y con respuesta rápida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tasacion"
              className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
            >
              Pedir tasación gratuita
            </Link>
            <TrackedLink
              event="whatsapp_click"
              eventParams={{ location: "vender_footer" }}
              href={WA_VENDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-full text-sm transition-colors"
            >
              Escribir por WhatsApp
            </TrackedLink>
          </div>
        </div>
      </div>
    </div>
  );
}
