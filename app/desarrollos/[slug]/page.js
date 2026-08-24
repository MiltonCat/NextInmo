import { notFound } from "next/navigation";
import DevelopmentDetailClient from "@/components/DevelopmentDetailClient";
import { getDevelopments, getDevelopmentBySlug, paraPublicar } from "@/lib/developments";
import { getDevelopmentSlug, estadoDe } from "@/data/developments";
import { SITE_URL, canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";

// Igual que las propiedades: se pre-renderizan las fichas conocidas y las que
// entren después se generan bajo demanda gracias a dynamicParams.
export const revalidate = 300;

export async function generateStaticParams() {
  const developments = await getDevelopments();
  const slugParams = developments.map((d) => ({ slug: getDevelopmentSlug(d) }));
  // El id suelto queda vivo como respaldo de enlaces cortos compartidos por
  // WhatsApp. Su canonical apunta al slug, así que Google no lo indexa aparte.
  const idParams = developments.map((d) => ({ slug: String(d.id) }));
  return [...slugParams, ...idParams];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const development = await getDevelopmentBySlug(slug);
  if (!development) return { title: "Desarrollo no encontrado" };

  // El mismo estado que ve la persona en la ficha. Si en Google el resultado
  // dice "En construcción" y al entrar lee "En desarrollo", el que se lleva la
  // duda es el que iba a consultar.
  const estado = estadoDe(development);
  const canonical = canonicalUrl(`/desarrollos/${getDevelopmentSlug(development)}`);
  const titulo = `${development.name} — Desarrollo en ${development.city}`;

  // La descripción se arma solo con los datos que existen. Antes concatenaba
  // todo de una y, en un desarrollo recién cargado, publicaba en Google
  // "entrega null" y "null unidades disponibles".
  const descripcion = [
    development.tagline,
    estado.label,
    development.entrega ? `entrega ${development.entrega}` : null,
    development.precioDesde > 0
      ? `desde USD ${development.precioDesde.toLocaleString("es-AR")}`
      : null,
    typeof development.unidadesDisponibles === "number"
      ? `${development.unidadesDisponibles} unidades disponibles`
      : null,
  ].filter(Boolean).join(". ") + ".";

  // La imagen que se ve cuando alguien pega el link en WhatsApp. Sin foto
  // propia, antes salía el logo genérico del sitio para todos los desarrollos
  // por igual; si el desarrollador publicó un video, la portada de ese video
  // dice muchísimo más del proyecto que nuestro isotipo.
  const imagen = development.image
    ? (development.image.startsWith("http") ? development.image : `${SITE_URL}${development.image}`)
    : development.video?.youtubeId
      ? `https://i.ytimg.com/vi/${development.video.youtubeId}/maxresdefault.jpg`
      : DEFAULT_OG_IMAGE;

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: `${development.name} — Catalán Propiedades`,
      description: descripcion,
      url: canonical,
      type: "website",
      images: [{ url: imagen, width: 1200, height: 630, alt: development.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [imagen],
    },
    alternates: { canonical },
  };
}

export default async function DesarrolloPage({ params }) {
  const { slug } = await params;
  const development = await getDevelopmentBySlug(slug);
  if (!development) notFound();

  const todos = await getDevelopments();
  // El slug se calcula acá y viaja como campo plano: el componente cliente no
  // necesita importar el módulo de datos entero solo para armar un enlace.
  const otros = todos
    .filter((d) => d.id !== development.id)
    .slice(0, 3)
    .map((d) => ({ ...paraPublicar(d), slug: getDevelopmentSlug(d) }));

  const canonical = canonicalUrl(`/desarrollos/${getDevelopmentSlug(development)}`);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Desarrollos", item: canonicalUrl("/desarrollos") },
      { "@type": "ListItem", position: 3, name: development.name, item: canonical },
    ],
  };

  // ResidentialComplex (subtipo de Place) describe mejor un emprendimiento que
  // un Product: hay muchas unidades con precios distintos, no un artículo con
  // un precio. El rango de precios va como AggregateOffer.
  // Los precios salen de las tipologías si están cargadas; si no, del "desde"
  // del proyecto. Sin ninguno de los dos, no se emite oferta: mejor un dato
  // menos que un precio inventado en el marcado que lee Google.
  const preciosTipologias = (development.tipologias ?? []).map((t) => t.precioDesde).filter(Boolean);
  const precios = preciosTipologias.length > 0
    ? preciosTipologias
    : (development.precioDesde > 0 ? [development.precioDesde] : []);

  // Los campos en null se omiten del JSON-LD en vez de mandarse vacíos.
  const complexJsonLd = {
    "@context": "https://schema.org",
    "@type": "ResidentialComplex",
    name: development.name,
    description: development.descripcionCorta ?? development.tagline,
    url: canonical,
    ...(development.image
      ? { image: development.image.startsWith("http") ? development.image : `${SITE_URL}${development.image}` }
      : {}),
    ...(typeof development.unidadesDisponibles === "number"
      ? { numberOfAvailableAccommodationUnits: development.unidadesDisponibles }
      : {}),
    numberOfAccommodationUnits: development.unidadesTotales,
    address: {
      "@type": "PostalAddress",
      streetAddress: development.location,
      addressLocality: development.city,
      addressRegion: development.provincia ?? "Neuquén",
      addressCountry: "AR",
    },
    ...(development.lat && development.lng
      ? { geo: { "@type": "GeoCoordinates", latitude: development.lat, longitude: development.lng } }
      : {}),
    ...(precios.length > 0
      ? {
          makesOffer: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: Math.min(...precios),
            highPrice: Math.max(...precios),
            ...(typeof development.unidadesDisponibles === "number"
              ? { offerCount: development.unidadesDisponibles }
              : {}),
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(complexJsonLd) }} />
      {/* paraPublicar y no `development` a secas: el objeto crudo lleva el
          sitio, el Instagram y las oficinas del desarrollador, y todo lo que
          se le pasa a un componente cliente termina legible en el HTML. */}
      <DevelopmentDetailClient development={paraPublicar(development)} otros={otros} />
    </>
  );
}
