export const revalidate = 3600;
import { getPropertySlug } from "@/data/properties";
import { getProperties } from "@/lib/properties";
import { canonicalUrl } from "@/config";
import { blogPosts } from "@/lib/blogPosts";
import { barriosConPerfil } from "@/lib/barrios";

export default async function sitemap() {
  const properties = await getProperties();
  const now = new Date();

  const staticRoutes = [
    { url: canonicalUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: canonicalUrl("/propiedades"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: canonicalUrl("/alquileres"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: canonicalUrl("/inversiones"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/precio-m2"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/tasacion"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: canonicalUrl("/simulador-credito"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/vender"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/nosotros"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: canonicalUrl("/barrios"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: canonicalUrl("/experiencia-barrio"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalUrl("/contacto"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalUrl("/prensa"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/centro-ayuda"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/terminos"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Los posts salen de `lib/blogPosts.js`, la misma lista que renderiza /blog.
  // Antes esta lista estaba duplicada acá y se desincronizó: tres posts
  // publicados nunca entraron al sitemap. Si agregás un post allá, entra solo.
  const blogRoutes = blogPosts.map((post) => ({
    url: canonicalUrl(`/blog/${post.id}`),
    lastModified: new Date(post.updated || post.dateTime),
    changeFrequency: "monthly",
    priority: post.sitemapPriority ?? 0.9,
  }));

  // Solo los barrios con ficha publicada (`perfilCompleto`). Los demás no tienen
  // página propia todavía: listarlos acá sería mandar a Google a un 404.
  const barrioRoutes = barriosConPerfil().map((barrio) => ({
    url: canonicalUrl(`/barrios/${barrio.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tipoRoutes = ["casas", "departamentos", "cabanas", "lotes", "monoambientes", "ph"].map((tipo) => ({
    url: canonicalUrl(`/propiedades/${tipo}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Para evitar duplicados en el índice, sólo emitimos el slug descriptivo (canónico).
  // El ID numérico sigue existiendo como fallback de URLs viejas, pero su <link rel="canonical">
  // apunta al slug, así Google lo consolida sin necesidad de listarlo en el sitemap.
  const propertyRoutes = properties.filter((property) => !property.vendida && !property.noDisponible && property.status !== "no_disponible").map((property) => ({
    url: canonicalUrl(`/propiedades/${getPropertySlug(property)}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes, ...barrioRoutes, ...tipoRoutes, ...propertyRoutes];
}
