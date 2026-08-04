export const dynamic = "force-static";
import { SITE_URL } from "@/config";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/favoritos", "/api/", "/admin", "/cuenta"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
