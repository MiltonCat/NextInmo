export const revalidate = 3600;
import { getPropertySlug } from "@/data/properties";
import { getProperties } from "@/lib/properties";
import { canonicalUrl } from "@/config";

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
    { url: canonicalUrl("/blog/alquileres-san-martin-de-los-andes-2026"), lastModified: new Date("2026-07-17"), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/blog/airbnb-facil-san-martin-de-los-andes-2026"), lastModified: new Date("2026-07-14"), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/blog/credito-hipotecario-neuquen-2026"), lastModified: new Date("2026-06-22"), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes"), lastModified: new Date("2026-06-16"), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/blog/como-tasamos-tu-propiedad-con-datos"), lastModified: new Date("2026-06-16"), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/blog/comprar-en-san-martin-de-los-andes-desde-buenos-aires"), lastModified: new Date("2026-06-12"), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/blog/donde-vivir-san-martin-de-los-andes"), lastModified: new Date("2026-06-02"), changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/blog/creditos-hipotecarios-uva-2026"), lastModified: new Date("2026-05-26"), changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/blog/bitcoin-ladrillos-patagonicos"), lastModified: new Date("2026-05-26"), changeFrequency: "monthly", priority: 0.7 },
    { url: canonicalUrl("/experiencia-barrio"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalUrl("/contacto"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalUrl("/prensa"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/centro-ayuda"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/terminos"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

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

  return [...staticRoutes, ...tipoRoutes, ...propertyRoutes];
}
