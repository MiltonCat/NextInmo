import dynamic from "next/dynamic";
const InversionesClient = dynamic(() => import("./InversionesClient"));
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { faqInversionesJsonLd } from "@/lib/inversionesFaq";

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


// Acá había un fetch a `${TASADOR_API_URL}/mercado?ciudad=sma` cuyo resultado
// se le pasaba al cliente para pisar la serie, el m² de referencia y la fecha.
// Se sacó el 2026-08-10: la API devuelve un relevamiento MÁS VIEJO que el
// export estático (17-jul sobre 956 propiedades contra 6-ago sobre 1.597), así
// que esta página publicaba números que contradecían a /tasacion y /precio-m2.
// El detalle está en la cabecera de InversionesClient.js.
//
// Cuando el modelo se reexporte y se redeploye, el enchufe va en lib/mercado.js
// —del que cuelgan las tres páginas—, no acá.
export default function InversionesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqInversionesJsonLd) }}
      />
      <InversionesClient />
    </>
  );
}
