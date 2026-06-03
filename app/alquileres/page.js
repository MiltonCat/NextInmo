import dynamic from "next/dynamic";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
const AlquileresClient = dynamic(() => import("./AlquileresClient"));

export const metadata = {
  title: "Alquileres permanentes en San Martín de los Andes | Catalán Propiedades",
  description: "Propiedades en alquiler permanente en San Martín de los Andes, Patagonia. Encontrá tu hogar con asesoría personalizada, contratos transparentes y atención directa del propietario.",
  openGraph: {
    title: "Alquileres permanentes en San Martín de los Andes — Catalán Propiedades",
    description: "Propiedades en alquiler permanente en la Patagonia Argentina.",
    url: canonicalUrl("/alquileres"),
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Alquileres permanentes en San Martín de los Andes" }],
  },
  alternates: {
    canonical: canonicalUrl("/alquileres"),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Alquileres permanentes", item: canonicalUrl("/alquileres") },
  ],
};

export default function AlquileresPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <AlquileresClient />
    </>
  );
}
