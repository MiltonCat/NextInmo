import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fukarishpopbtxtzhrrd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Headers de seguridad para todo el sitio. Vercel ya agrega HSTS solo.
  // La CSP es deliberadamente conservadora: solo bloquea lo que ninguna parte
  // del sitio usa (embeberse en iframes ajenos, <base> inyectado, forms a
  // dominios externos, plugins object/embed). No restringe scripts/imágenes/
  // conexiones, así GA4, Vercel Analytics, Supabase, Leaflet y EmailJS siguen
  // funcionando sin riesgo de romper producción. Endurecerla (script-src con
  // nonces) es un paso posterior que requiere pruebas.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // El navegador no debe "adivinar" tipos de contenido (mitiga XSS por MIME sniffing).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nadie puede meter el sitio en un iframe (clickjacking sobre el /admin).
          { key: "X-Frame-Options", value: "DENY" },
          // No filtrar URLs completas propias a sitios externos.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // APIs del navegador que el sitio no usa: negadas explícitamente.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["recharts"],
    // El panel /admin sube hasta 5 fotos por propiedad en una Server Action.
    // El límite por defecto es 1 MB y las fotos pesan varios MB, así que se amplía.
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
