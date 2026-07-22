import "./globals.css";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientShell from "@/components/ClientShell";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {
  SITE_URL,
  PHONE_DISPLAY,
  CONTACT_EMAIL,
  DEFAULT_OG_IMAGE,
  GOOGLE_SITE_VERIFICATION,
  canonicalUrl,
} from "@/config";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Catalán Propiedades | Inmobiliaria en San Martín de los Andes",
    template: "%s | Catalán Propiedades",
  },
  description:
    "Asesoría inmobiliaria en San Martín de los Andes, Patagonia. Venta de propiedades, alquileres permanentes e inversiones con datos reales del mercado local. +10 años de experiencia.",
  applicationName: "Catalán Propiedades",
  authors: [{ name: "Milton Catalán", url: `${SITE_URL}/nosotros/` }],
  creator: "Milton Catalán",
  publisher: "Catalán Propiedades",
  keywords: [
    "inmobiliaria San Martín de los Andes",
    "propiedades San Martín de los Andes",
    "casas en venta San Martín de los Andes",
    "alquiler permanente San Martín de los Andes",
    "inversión inmobiliaria Patagonia",
    "precio m2 San Martín de los Andes",
    "tasación propiedades Neuquén",
    "Catalán Propiedades",
    "Milton Catalán",
  ],
  category: "real estate",
  alternates: {
    canonical: canonicalUrl("/"),
    languages: {
      "es-AR": canonicalUrl("/"),
    },
  },
  openGraph: {
    siteName: "Catalán Propiedades",
    locale: "es_AR",
    type: "website",
    url: canonicalUrl("/"),
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "San Martín de los Andes — Catalán Propiedades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalán Propiedades | Inmobiliaria en San Martín de los Andes",
    description:
      "Venta, alquiler e inversión inmobiliaria en San Martín de los Andes, Patagonia. Datos reales, criterio financiero y +10 años de experiencia.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=winter-snowflake-v1", type: "image/svg+xml" },
      { url: "/icon.png?v=winter-snowflake-v1", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=winter-snowflake-v1",
    apple: "/icon.png?v=winter-snowflake-v1",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e11d48",
  colorScheme: "light",
};

const realEstateAgentJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": `${SITE_URL}/#organization`,
  name: "Catalán Propiedades",
  description:
    "Asesoría inmobiliaria en San Martín de los Andes, Patagonia Argentina. Venta, alquiler permanente e inversiones.",
  url: canonicalUrl("/"),
  logo: `${SITE_URL}/logoMC.webp`,
  image: DEFAULT_OG_IMAGE,
  telephone: PHONE_DISPLAY,
  email: CONTACT_EMAIL,
  priceRange: "$$",
  sameAs: [
    "https://www.instagram.com/catalan_propiedades/",
    "https://www.facebook.com/profile.php?id=100077645447671",
  ],
  areaServed: [
    { "@type": "City", name: "San Martín de los Andes" },
    { "@type": "City", name: "Junín de los Andes" },
    { "@type": "Place", name: "Cerro Chapelco" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Martín de los Andes",
    addressRegion: "Neuquén",
    addressCountry: "AR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -40.1576,
    longitude: -71.3533,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "19:00",
  },
  founder: { "@type": "Person", name: "Milton Catalán", url: canonicalUrl("/nosotros") },
};

// Favicon estacional de invierno (copo que gira y flota suavemente). IMPORTANTE:
// este script NO debe tocar
// los <link> de icono que renderiza React (metadata.icons / head del layout).
// La versión anterior los borraba con node.remove() cada 120 ms; en la próxima
// navegación React intentaba reconciliar nodos que ya no existían, tiraba
// "Cannot read properties of null (reading 'removeChild')" y la navegación
// moría en silencio → había que tocar/clickear dos veces para cambiar de página.
// Ahora crea SU PROPIO <link id="animated-favicon-link"> al final del <head>
// (los navegadores priorizan el último icono declarado) y solo actualiza su href.
const animatedFaviconScript = `(() => {
  const frames = Array.from({ length: 24 }, (_, index) => ({
    y: 32 + Math.sin((index / 24) * Math.PI * 2) * 6,
    scale: 0.9 + ((Math.sin((index / 24) * Math.PI * 2) + 1) * 0.08),
    angle: index * 15,
  }));

  const snowflake = (y, scale, angle) => '<g transform="translate(32 ' + y + ') rotate(' + angle + ') scale(' + scale + ')" fill="none" stroke="#0284c7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M0-22V22M-19-11L19 11M-19 11L19-11"/><path d="M-6-17L0-11 6-17M-6 17L0 11 6 17M-15-12L-13-4-21-2M15 12L13 4 21 2M-21 2L-13 4-15 12M21-2L13-4 15-12"/><circle cx="0" cy="0" r="4" fill="#fff" stroke="#0284c7" stroke-width="2"/><circle cx="10" cy="-15" r="3" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5"/></g>';

  const drawFrame = (frame) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#eff9ff"/><circle cx="32" cy="32" r="25" fill="#dff4ff" stroke="#7dd3fc" stroke-width="2"/>' + snowflake(frame.y, frame.scale, frame.angle) + '</svg>';

  let link = null;
  const setIcon = (frame) => {
    if (!link || !link.isConnected) {
      link = document.getElementById('animated-favicon-link');
      if (!link) {
        link = document.createElement('link');
        link.id = 'animated-favicon-link';
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        document.head.appendChild(link);
      }
    }
    link.href = 'data:image/svg+xml,' + encodeURIComponent(drawFrame(frame));
  };

  let index = 0;
  setIcon(frames[index]);
  window.setInterval(() => {
    index = (index + 1) % frames.length;
    setIcon(frames[index]);
  }, 160);
})();`;
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: canonicalUrl("/"),
  name: "Catalán Propiedades",
  description:
    "Inmobiliaria en San Martín de los Andes. Venta, alquiler permanente e inversión inmobiliaria con datos reales del mercado patagónico.",
  inLanguage: "es-AR",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

// Guard de Analytics: corre síncrono en el <head>, antes de que cargue gtag.js,
// para que la PRIMERA página vista ya respete la exclusión (entrar directo a
// /admin, o un dispositivo marcado con "no contarme"). Las navegaciones cliente
// posteriores las mantiene al día el componente GoogleAnalytics. Si cambiás esta
// lógica, replicala en components/GoogleAnalytics.jsx (shouldDisable).
const gaGuardScript = `(function(){
  try {
    var id = ${JSON.stringify(process.env.NEXT_PUBLIC_GA_ID || "G-BPWSKDWRBN")};
    if (!id) return;
    var admin = location.pathname.indexOf("/admin") === 0;
    var optout = false;
    try { optout = localStorage.getItem("cp-no-track") === "1"; } catch(e){}
    window["ga-disable-" + id] = admin || optout;
  } catch(e){}
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        <Script id="ga-guard" strategy="beforeInteractive">
          {gaGuardScript}
        </Script>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=winter-snowflake-v1" id="favicon" />
        <link rel="alternate icon" type="image/png" href="/icon.png?v=winter-snowflake-v1" />
        <link rel="shortcut icon" href="/favicon.ico?v=winter-snowflake-v1" />
        <link rel="canonical" href={canonicalUrl("/")} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgentJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`flex flex-col min-h-screen antialiased ${plusJakarta.variable}`}>
        <Navbar />
        <main className="flex-grow pt-[104px] pb-20 md:pt-[120px] md:pb-0">
          {children}
        </main>
        <Footer />
        <ClientShell />
        <SpeedInsights />
        <Analytics />
        <Script id="animated-favicon" strategy="afterInteractive">{animatedFaviconScript}</Script>
        {/* Google Analytics: excluye /admin y los dispositivos con "no contarme". */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}


