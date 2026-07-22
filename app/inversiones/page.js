import dynamic from "next/dynamic";
const InversionesClient = dynamic(() => import("./InversionesClient"));
import { canonicalUrl, DEFAULT_OG_IMAGE, TASADOR_API_URL } from "@/config";

export const metadata = {
  title: "Inversión inmobiliaria en San Martín de los Andes 2026",
  description: "Analizá el mercado inmobiliario de San Martín de los Andes con datos reales. Precio del m², rentabilidad por zona, calculadora de ROI y comparativa de activos para inversores.",
  openGraph: {
    title: "Invertí en San Martín de los Andes — Análisis de mercado 2026",
    description: "Datos reales del mercado inmobiliario patagónico: precio del m², rentabilidad por zona y calculadora de ROI.",
    url: canonicalUrl("/inversiones"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Inversión inmobiliaria en San Martín de los Andes — Catalán Propiedades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invertí en San Martín de los Andes — Análisis 2026",
    description: "Precio del m², rentabilidad por zona y calculadora de ROI para invertir en la Patagonia.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/inversiones"),
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Conviene invertir en propiedades en San Martín de los Andes en 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "San Martín de los Andes muestra una tendencia sostenida de valorización del m² en dólares. La combinación de destino turístico consolidado, oferta limitada de suelo y demanda creciente lo posiciona como uno de los mercados inmobiliarios más estables de la Patagonia para inversores.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál es el ROI promedio de una propiedad en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La rentabilidad estimada depende del tipo de inversión: un alquiler permanente ronda el 6-8% anual, el alquiler turístico puede alcanzar el 12% y las operaciones de compra y reventa, hasta el 15%. A eso se suma la valorización del m², que creció más de 50% en dólares entre 2021 y 2026. Los resultados varían según la zona, la propiedad y la gestión.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué tipo de propiedad rinde más en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Las cabañas y departamentos en zonas turísticas tienen mayor rentabilidad por alquiler temporario. Los lotes en zonas de expansión muestran la mayor valorización de capital a largo plazo. Los departamentos céntricos ofrecen el mejor equilibrio entre demanda de alquiler permanente y valorización.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta el m² en San Martín de los Andes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El precio del m² en San Martín de los Andes varía según la zona, entre USD 1.200 y USD 3.500 aproximadamente. Las zonas céntricas y con vista al lago o a la montaña concentran los valores más altos. Podés consultar el análisis actualizado de precio por zona en nuestra página de precio del m².",
      },
    },
  ],
};

// Resumen de mercado calculado por el modelo predictivo (se reentrena cada semana).
// Si la API no responde (Render dormido, sin red), la página usa sus datos estáticos.
async function getMercado() {
  try {
    const res = await fetch(`${TASADOR_API_URL}/mercado?ciudad=sma`, {
      next: { revalidate: 21600 }, // 6 hs
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function InversionesPage() {
  const mercado = await getMercado();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <InversionesClient mercado={mercado} />
    </>
  );
}
