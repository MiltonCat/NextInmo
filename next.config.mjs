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
  // La nota "cuánto necesitás para comprar" se bajó el 2026-08-24: publicaba
  // la comisión con IVA y el impuesto de sellos partido 50/50, y ninguna de las
  // dos cosas es como opera la inmobiliaria. Su URL ya estaba indexada y en el
  // sitemap, así que se redirige al listado en vez de dejarla en 404: quien la
  // busque encuentra el resto del blog. Si la nota vuelve corregida, se saca
  // este redirect.
  async redirects() {
    return [
      {
        source: "/blog/cuanto-necesitas-para-comprar-en-san-martin-de-los-andes",
        destination: "/blog/",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      // El token con el que OpenAI verifica que el dominio es nuestro, para
      // publicar la app en el directorio de ChatGPT. El archivo vive en
      // public/.well-known/openai-apps-challenge.
      //
      // Dos cosas que lo rompen y por eso está acá:
      //  - El verificador pide la URL SIN barra final y exige un 200. Como el
      //    proyecto tiene trailingSlash:true, una ruta de app/ contestaría un
      //    308 y podría no seguirlo. Por eso es un archivo estático de public/,
      //    que se sirve en la ruta exacta y no pasa por ese redirect.
      //  - Sin extensión, el archivo se sirve como octet-stream. Se fuerza
      //    text/plain, y no-store para que un token viejo no quede cacheado
      //    entre un intento y el siguiente.
      //
      // OpenAI siempre lo busca en la RAÍZ del dominio, aunque el servidor MCP
      // esté en /api/mcp/: no soporta .well-known fuera de la raíz.
      {
        source: "/.well-known/openai-apps-challenge",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
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
    serverActions: {
      // OJO: esto NO sirve para subir fotos pesadas en producción.
      //
      // Vercel corta cualquier request de más de 4,5 MB antes de invocar la
      // función, y ese tope de plataforma no se puede levantar desde acá: este
      // ajuste solo tiene efecto con `next dev`. Durante meses el panel mandó
      // las cinco fotos dentro de la Server Action y en producción devolvía un
      // 413 (pantalla de error de Vercel, sin pasar por el formulario) mientras
      // en local andaba perfecto.
      //
      // Hoy las fotos van del navegador directo a Supabase con una URL firmada
      // (ver lib/adminDb.js → crearSubidaFirmada) y el formulario manda solo
      // texto. Este valor queda como red de seguridad para el camino sin
      // JavaScript y para cargas por script, pero nada debería acercarse a él.
      bodySizeLimit: "4mb",
      // Next valida cada Server Action comparando la cabecera `Origin` del
      // navegador contra el host que cree tener. `next dev` se registra como
      // `localhost:3000`, así que entrar por `127.0.0.1:3000` —que es a donde
      // apunta ACCOUNT_AUTH_REDIRECT_URL— no coincide y la acción se rechaza
      // en silencio: el formulario cae a POST nativo con recarga completa y la
      // pantalla de confirmación no aparece nunca.
      //
      // Los dos nombres apuntan a la misma máquina; declararlos evita tener
      // que recordar por cuál entrar. En producción no cambia nada: esos hosts
      // no son alcanzables y el origen propio ya está permitido por defecto.
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },
};

export default nextConfig;
