import { SITE_URL } from "@/config";
import { properties } from "@/data/properties";

export default function sitemap() {
  const staticRoutes = [
    { url: SITE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE_URL}/propiedades`, priority: 0.9, changeFrequency: "daily" },
    { url: `${SITE_URL}/alquileres`, priority: 0.9, changeFrequency: "daily" },
    { url: `${SITE_URL}/inversiones`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${SITE_URL}/contacto`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/nosotros`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/blog`, priority: 0.6, changeFrequency: "weekly" },
    { url: `${SITE_URL}/tasacion`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/precio-m2`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/experiencia-barrio`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${SITE_URL}/terminos`, priority: 0.3, changeFrequency: "yearly" },
  ];

  const propertyRoutes = properties.map((p) => ({
    url: `${SITE_URL}/propiedades/${p.id}`,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...propertyRoutes];
}
