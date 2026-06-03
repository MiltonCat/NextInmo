import ExperienciaBarrioPage from "@/components/ExperienciaBarrioPage";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";

export const metadata = {
  title: "Guía de Barrios San Martín de los Andes | Catalán Propiedades",
  description: "¿Cómo es vivir en Centro, Chapelco, Las Marías o Costanera? Experiencias reales de vecinos para ayudarte a elegir dónde comprar o invertir en San Martín de los Andes.",
  openGraph: {
    title: "Guía de Barrios — San Martín de los Andes · Catalán Propiedades",
    description: "Experiencias reales de vecinos sobre los barrios de San Martín de los Andes. Información que ningún portal inmobiliario tiene.",
    url: canonicalUrl("/experiencia-barrio"),
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Guía de Barrios San Martín de los Andes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guía de Barrios — San Martín de los Andes",
    description: "Experiencias reales de vecinos para elegir dónde vivir o invertir.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/experiencia-barrio"),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Guía de Barrios", item: canonicalUrl("/experiencia-barrio") },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ExperienciaBarrioPage />
    </>
  );
}
