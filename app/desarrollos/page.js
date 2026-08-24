import dynamic from "next/dynamic";
import { canonicalUrl, DEFAULT_OG_IMAGE, SITE_URL } from "@/config";
import { getDevelopments, paraPublicar } from "@/lib/developments";
import { getDevelopmentSlug } from "@/data/developments";

const DevelopmentsClient = dynamic(() => import("./DevelopmentsClient"));

// Mismo ritmo que /propiedades: la obra avanza de a semanas, pero el estado de
// disponibilidad de una unidad puede cambiar en el día.
export const revalidate = 300;

export const metadata = {
  title: "Desarrollos inmobiliarios en San Martín de los Andes",
  description:
    "Emprendimientos en pozo, en construcción y terminados en San Martín de los Andes. Departamentos, loteos y complejos con plan de pago en cuotas y avance de obra verificable.",
  keywords: [
    "desarrollos inmobiliarios San Martín de los Andes",
    "emprendimientos en pozo Neuquén",
    "departamentos en construcción San Martín de los Andes",
    "loteos San Martín de los Andes",
    "invertir en pozo Patagonia",
  ],
  openGraph: {
    title: "Desarrollos inmobiliarios en San Martín de los Andes — Catalán Propiedades",
    description:
      "Comprá en pozo o en obra: mejor precio por m², plan de pago en cuotas y avance de obra a la vista.",
    url: canonicalUrl("/desarrollos"),
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Desarrollos inmobiliarios en San Martín de los Andes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desarrollos inmobiliarios en San Martín de los Andes",
    description: "Emprendimientos en pozo, en obra y terminados, con plan de pago en cuotas.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: { canonical: canonicalUrl("/desarrollos") },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Desarrollos", item: canonicalUrl("/desarrollos") },
  ],
};

export default async function DesarrollosPage() {
  const developments = await getDevelopments();

  // ItemList en vez de una lista de Product: Google entiende que la página es
  // un listado y puede mostrar el carrusel, sin que cada desarrollo pretenda
  // ser un producto con precio único (tienen precio "desde", no precio).
  const listaJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Desarrollos inmobiliarios en San Martín de los Andes",
    numberOfItems: developments.length,
    itemListElement: developments.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.name,
      url: `${SITE_URL}/desarrollos/${getDevelopmentSlug(d)}/`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listaJsonLd) }} />
      <DevelopmentsClient developments={developments.map(paraPublicar)} />
    </>
  );
}
