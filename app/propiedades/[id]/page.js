import { properties } from "@/data/properties";
import PropertyDetailClient from "@/components/PropertyDetailClient";

export async function generateStaticParams() {
  return properties.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = properties.find((p) => p.id === parseInt(id));
  if (!property) return { title: "Propiedad no encontrada | Catalan Propiedades" };
  return {
    title: `${property.title} | Catalan Propiedades`,
    description: property.description?.slice(0, 155),
    openGraph: {
      title: property.title,
      description: property.description?.slice(0, 155),
      images: [{ url: property.image }],
    },
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  return <PropertyDetailClient id={id} />;
}
