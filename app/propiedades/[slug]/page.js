import { notFound } from "next/navigation";
import Link from "next/link";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import { getPropertySlug } from "@/data/properties";
import { getProperties, getPropertyById } from "@/lib/properties";
import { SITE_URL, canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import dynamic from "next/dynamic";

const PropertiesClient = dynamic(() => import("../PropertiesClient"));

// Refresca desde la base cada 5 minutos. Las propiedades nuevas (no incluidas
// en generateStaticParams) se renderizan bajo demanda gracias a dynamicParams.
export const revalidate = 300;

// Extrae el id numérico del final del slug (o de un slug que sea solo el id).
function idFromSlug(slug) {
  const match = String(slug).match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

const TIPO_MAP = {
  casas:         { tipos: ["Casa"],               label: "Casas",         labelSingular: "casa" },
  departamentos: { tipos: ["Departamento"],        label: "Departamentos", labelSingular: "departamento" },
  cabanas:       { tipos: ["Cabaña", "Cabañas"],   label: "Cabañas",       labelSingular: "cabaña" },
  lotes:         { tipos: ["Lote"],               label: "Lotes",         labelSingular: "lote" },
  monoambientes: { tipos: ["Monoambiente"],        label: "Monoambientes", labelSingular: "monoambiente" },
  ph:            { tipos: ["PH"],                 label: "PH",            labelSingular: "PH" },
};

export async function generateStaticParams() {
  const properties = await getProperties();
  // Slug descriptivo (canónico) de cada propiedad.
  const slugParams = properties.map((p) => ({ slug: getPropertySlug(p) }));
  // Id numérico como respaldo: mantiene vivas las URLs viejas ya indexadas
  // (su canonical apunta al slug descriptivo, así que no hay contenido duplicado).
  const idParams = properties.map((p) => ({ slug: String(p.id) }));
  const tipoParams = Object.keys(TIPO_MAP).map((tipo) => ({ slug: tipo }));
  return [...slugParams, ...idParams, ...tipoParams];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Página por tipo
  const tipoConfig = TIPO_MAP[slug];
  if (tipoConfig) {
    const properties = await getProperties();
    const count = properties.filter((p) => tipoConfig.tipos.includes(p.type)).length;
    return {
      title: `${tipoConfig.label} en venta en San Martín de los Andes | Catalán Propiedades`,
      description: `${count} ${tipoConfig.label.toLowerCase()} en venta en San Martín de los Andes, Patagonia. Asesoría personalizada y datos reales del mercado local.`,
      openGraph: {
        title: `${tipoConfig.label} en venta en San Martín de los Andes — Catalán Propiedades`,
        description: `Encontrá tu ${tipoConfig.labelSingular} ideal en San Martín de los Andes con asesoría de Catalán Propiedades.`,
        url: canonicalUrl(`/propiedades/${slug}`),
        type: "website",
        images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${tipoConfig.label} en San Martín de los Andes` }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${tipoConfig.label} en venta en San Martín de los Andes`,
        description: `${count} ${tipoConfig.label.toLowerCase()} con asesoría personalizada.`,
        images: [DEFAULT_OG_IMAGE],
      },
      alternates: { canonical: canonicalUrl(`/propiedades/${slug}`) },
    };
  }

  // Página de detalle de propiedad
  const property = await getPropertyById(idFromSlug(slug));
  if (!property) return { title: "Propiedad no encontrada | Catalán Propiedades" };

  const isAlquiler = property.modalidad === "alquiler_permanente";
  const priceText = isAlquiler
    ? `$${property.precioAlquilerARS?.toLocaleString("es-AR")}/mes`
    : `USD ${property.price.toLocaleString()}`;

  const bedroomText = property.bedrooms > 0 ? `${property.bedrooms} dormitorios` : "";
  const areaText = property.area > 0 ? `${property.area} m²` : "";
  const specs = [bedroomText, areaText, property.location].filter(Boolean).join(" · ");

  const seoTitle = `${property.title} - ${priceText} | Catalán Propiedades`;
  const seoDescription = `${property.type} en ${property.location}. ${specs}${property.description ? `. ${property.description.slice(0, 120)}...` : "."}`;
  const ogImage = property.image?.startsWith("http") ? property.image : `${SITE_URL}${property.image}`;
  // El canónico siempre apunta al slug descriptivo, aunque la URL actual venga del ID numérico.
  const canonical = canonicalUrl(`/propiedades/${getPropertySlug(property)}`);

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: property.title }],
      type: "article",
      locale: "es_AR",
      siteName: "Catalán Propiedades",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
    },
    alternates: { canonical },
  };
}

export default async function PropiedadesSlugPage({ params }) {
  const { slug } = await params;

  // Página por tipo
  const tipoConfig = TIPO_MAP[slug];
  if (tipoConfig) {
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "Propiedades", item: canonicalUrl("/propiedades") },
        { "@type": "ListItem", position: 3, name: tipoConfig.label, item: canonicalUrl(`/propiedades/${slug}`) },
      ],
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <PropertiesClient properties={await getProperties()} tipoFiltro={tipoConfig.tipos} tipoLabel={tipoConfig.label} />
      </>
    );
  }

  // Página de detalle de propiedad — acepta tanto slug descriptivo como ID numérico.
  const property = await getPropertyById(idFromSlug(slug));
  if (!property) notFound();

  const isAlquiler = property.modalidad === "alquiler_permanente";
  const canonical = canonicalUrl(`/propiedades/${getPropertySlug(property)}`);
  const imageUrl = property.image?.startsWith("http") ? property.image : `${SITE_URL}${property.image}`;

  const price = isAlquiler ? property.precioAlquilerARS : property.price;
  const priceCurrency = isAlquiler ? "ARS" : "USD";

  const realEstateListing = {
    "@type": isAlquiler ? "RentalListing" : "RealEstateListing",
    "@id": `${canonical}#listing`,
    name: property.title,
    description: property.description,
    url: canonical,
    image: imageUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location,
      addressLocality: "San Martín de los Andes",
      addressRegion: "Neuquén",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: -40.1576, longitude: -71.3533 },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability: "https://schema.org/InStock",
      ...(isAlquiler && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: property.precioAlquilerARS,
          priceCurrency: "ARS",
          unitCode: "MON",
        },
      }),
    },
    ...(property.area > 0 && { floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "MTK" } }),
    ...(property.bedrooms > 0 && { numberOfRooms: property.bedrooms }),
    ...(property.bathrooms > 0 && { numberOfBathroomsTotal: property.bathrooms }),
    amenityFeature: property.features?.map((f) => ({ "@type": "LocationFeatureSpecification", name: f })),
  };

  // Product habilita el rich snippet de precio en resultados de Google
  // (RealEstateListing por sí solo no califica para snippet de precio en SERP).
  const productListing = {
    "@type": "Product",
    "@id": `${canonical}#product`,
    name: property.title,
    description: property.description,
    image: imageUrl,
    sku: String(property.id),
    category: property.type,
    brand: { "@type": "Brand", name: "Catalán Propiedades" },
    offers: {
      "@type": "Offer",
      url: canonical,
      price,
      priceCurrency,
      availability: property.alquilada || property.reservada
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [realEstateListing, productListing],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Propiedades", item: canonicalUrl("/propiedades") },
      { "@type": "ListItem", position: 3, name: property.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-rose-600 transition-colors">Inicio</Link>
              <span>/</span>
              <Link href="/propiedades" className="hover:text-rose-600 transition-colors">Propiedades</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">{property.type}</span>
            </nav>
          </div>
        </div>
        <PropertyDetailClient property={property} />
      </div>
    </>
  );
}
