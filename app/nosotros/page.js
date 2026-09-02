import dynamic from "next/dynamic";
import { SITE_URL, canonicalUrl } from "@/config";
const NosotrosClient = dynamic(() => import("./NosotrosClient"));

export const metadata = {
  title: "Nosotros — San Martín de los Andes",
  description: "El equipo de Catalán Propiedades en San Martín de los Andes: Milton Catalán, asesor inmobiliario con más de 10 años de experiencia y criterio financiero, y Carolina Godoy, abogada, que respalda los contratos y la documentación de cada operación.",
  openGraph: {
    title: "Sobre Catalán Propiedades — Milton Catalán",
    description: "Asesor inmobiliario con criterio financiero y más de 10 años en San Martín de los Andes.",
    url: canonicalUrl("/nosotros"),
    type: "profile",
    images: [
      {
        url: `${SITE_URL}/Milton.webp`,
        width: 800,
        height: 800,
        alt: "Milton Catalán — Asesor inmobiliario en San Martín de los Andes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Catalán Propiedades — Milton Catalán",
    description: "Asesor inmobiliario con criterio financiero y más de 10 años en San Martín de los Andes.",
    images: [`${SITE_URL}/Milton.webp`],
  },
  alternates: {
    canonical: canonicalUrl("/nosotros"),
  },
};

export default function AboutPage() {
  return <NosotrosClient />;
}
