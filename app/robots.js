import { SITE_URL } from "@/config";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/favoritos", "/centro-ayuda"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
