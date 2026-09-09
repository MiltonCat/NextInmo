import { connection } from "next/server";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { getProperties } from "@/lib/properties";
import AlquileresClient from "./AlquileresClient";

export const revalidate = 300;

export const metadata = {
  title: "Alquileres en San Martín de los Andes",
  description: "Encontrá propiedades en alquiler permanente en San Martín de los Andes. Consultá disponibilidad y recibí asesoramiento local para elegir tu próximo hogar.",
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

export default async function AlquileresPage() {
  await connection();
  const properties = await getProperties();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <AlquileresClient properties={properties} />
    </>
  );
}
