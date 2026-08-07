// app/centro-ayuda/page.js es un componente de cliente ("use client") y los
// componentes de cliente no pueden exportar `metadata`. Sin este layout, la
// página quedaba sin metadatos propios y sin canónico, aunque sí está en el
// sitemap. Este archivo existe solo para declararlos.
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";

export const metadata = {
  title: "Centro de ayuda — Preguntas frecuentes",
  description:
    "Respuestas a las dudas más comunes sobre comprar, alquilar e invertir en San Martín de los Andes: proceso de compra, extranjeros, escrituración, zonas y costos.",
  openGraph: {
    title: "Centro de ayuda — Catalán Propiedades",
    description:
      "Preguntas frecuentes sobre comprar, alquilar e invertir en San Martín de los Andes.",
    url: canonicalUrl("/centro-ayuda"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Centro de ayuda de Catalán Propiedades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Centro de ayuda — Catalán Propiedades",
    description:
      "Preguntas frecuentes sobre comprar, alquilar e invertir en San Martín de los Andes.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/centro-ayuda"),
  },
};

export default function CentroAyudaLayout({ children }) {
  return children;
}
