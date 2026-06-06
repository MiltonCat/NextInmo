import dynamic from "next/dynamic";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { getProperties } from "@/lib/properties";
const PropertiesClient = dynamic(() => import("./PropertiesClient"));

export const revalidate = 300;

export const metadata = {
  title: "Propiedades en venta en San Martín de los Andes | Catalán Propiedades",
  description: "Casas, departamentos, cabañas y lotes en venta en San Martín de los Andes, Patagonia. Más de 10 propiedades disponibles con asesoría personalizada y datos reales del mercado.",
  openGraph: {
    title: "Propiedades en San Martín de los Andes — Catalán Propiedades",
    description: "Casas, departamentos, cabañas y lotes en venta en la Patagonia Argentina.",
    url: canonicalUrl("/propiedades"),
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Propiedades en San Martín de los Andes" }],
  },
  alternates: {
    canonical: canonicalUrl("/propiedades"),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Propiedades en venta", item: canonicalUrl("/propiedades") },
  ],
};

export default async function PropertiesPage() {
  const properties = await getProperties();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PropertiesClient properties={properties} />
    </>
  );
}
