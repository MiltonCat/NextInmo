import dynamic from "next/dynamic";
const InversionesClient = dynamic(() => import("./InversionesClient"));
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { VALOR_M2_CASA, VALOR_M2_DEPTO, RANGO_M2 } from "@/lib/mercado";

const usd = (v) => `USD ${Number(v).toLocaleString("es-AR")}`;

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
        text: "La rentabilidad estimada depende del tipo de inversión: un alquiler permanente ronda el 6-8% anual, el alquiler turístico puede alcanzar el 12% y las operaciones de compra y reventa, hasta el 15%. A eso se suma la valorización del m² en dólares: San Martín es un mercado maduro, con precios entre los más altos del país y estables en el tiempo, más que de subas fuertes año a año. Estos valores son estimaciones orientativas y los resultados varían según la zona, la propiedad y la gestión.",
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
        // Decía "entre USD 1.200 y USD 3.500 aproximadamente", los dos escritos
        // a mano. El techo era falso: el modelo pone el p75 de departamentos en
        // USD 3.923. Y esto es un FAQPage, o sea lo que Google puede levantar
        // como respuesta destacada — el peor lugar para un número inventado.
        // Ahora sale del modelo, igual que /tasacion y /precio-m2.
        text: `El precio del m² en San Martín de los Andes depende sobre todo del tipo de propiedad: la mediana está en ${usd(VALOR_M2_CASA)}/m² para casas y ${usd(VALOR_M2_DEPTO)}/m² para departamentos. El 50 % central del mercado va de ${usd(RANGO_M2.Casa?.p25)} a ${usd(RANGO_M2.Departamento?.p75)} por m². Las zonas céntricas y con vista al lago o a la montaña concentran los valores más altos. Podés consultar el análisis actualizado por zona en nuestra página de precio del m².`,
      },
    },
  ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <InversionesClient />
    </>
  );
}
