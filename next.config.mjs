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
