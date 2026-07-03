import "./globals.css";
import Script from "next/script";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
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
  weight: ["400", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
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
      { url: "/favicon.svg?v=bounce-ball-v2", type: "image/svg+xml" },
      { url: "/icon.png?v=bounce-ball-v2", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=bounce-ball-v2",
    apple: "/icon.png?v=bounce-ball-v2",
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

// Favicon animado (pelotita que rebota). IMPORTANTE: este script NO debe tocar
// los <link> de icono que renderiza React (metadata.icons / head del layout).
// La versión anterior los borraba con node.remove() cada 120 ms; en la próxima
// navegación React intentaba reconciliar nodos que ya no existían, tiraba
// "Cannot read properties of null (reading 'removeChild')" y la navegación
// moría en silencio → había que tocar/clickear dos veces para cambiar de página.
// Ahora crea SU PROPIO <link id="animated-favicon-link"> al final del <head>
// (los navegadores priorizan el último icono declarado) y solo actualiza su href.
const animatedFaviconScript = `(() => {
  const frames = [
    { y: 34, s: 1.0, pulse: 19, shadow: 1.0, angle: 0 },
    { y: 27, s: 1.06, pulse: 22, shadow: 0.75, angle: 45 },
    { y: 20, s: 1.12, pulse: 25, shadow: 0.45, angle: 90 },
    { y: 15, s: 1.16, pulse: 27, shadow: 0.25, angle: 135 },
    { y: 20, s: 1.12, pulse: 25, shadow: 0.45, angle: 180 },
    { y: 27, s: 1.06, pulse: 22, shadow: 0.75, angle: 225 },
    { y: 34, s: 1.0, pulse: 19, shadow: 1.0, angle: 270 },
    { y: 37, s: 0.92, pulse: 17, shadow: 1.15, angle: 315 },
  ];

  const ball = (y, scale, angle) => '<g transform="translate(32 ' + y + ') rotate(' + angle + ') scale(' + scale + ')"><circle cx="0" cy="0" r="14" fill="#fff"/><path fill="#111827" d="M0-9l8 6-3 9H-5l-3-9 8-6Z"/><path fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" d="M-5 6l-7 6M5 6l7 6M-8-3l-8-3M8-3l8-3M0-9V-14"/><path fill="none" stroke="#e11d48" stroke-width="3" stroke-linecap="round" d="M-10-9c6-4 14-4 20 0"/><path fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" d="M-10 11c6 4 14 4 20 0"/><circle cx="0" cy="0" r="14" fill="none" stroke="#111827" stroke-width="2"/></g>';

  const drawFrame = (frame) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#ffffff"/><circle cx="32" cy="32" r="' + frame.pulse + '" fill="#e11d48" opacity="0.18"/><path d="M8 49h48" stroke="#16a34a" stroke-width="7" stroke-linecap="round"/><ellipse cx="32" cy="48" rx="' + (15 * frame.shadow) + '" ry="3" fill="#111827" opacity="0.25"/>' + ball(frame.y, frame.s, frame.angle) + '</svg>';

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
  }, 120);
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

// Guardia anti-crash con traductores del navegador (Google Translate, etc.).
// Esas extensiones reemplazan nodos de texto por su cuenta; cuando React
// desmonta el árbol, llama removeChild/insertBefore sobre un nodo cuyo padre
// ya cambió y lanza "Cannot read properties of null (reading 'removeChild')".
// Hacemos esos métodos defensivos para que no tiren la página. NO desactiva la
// traducción. Patrón conocido (facebook/react#11538). Debe correr antes de hidratar.
const domGuardScript = `(function(){
  if (typeof Node !== "function" || !Node.prototype) return;
  var rc = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child){
    if (child && child.parentNode !== this) { return child; }
    return rc.apply(this, arguments);
  };
  var ib = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode){
    if (referenceNode && referenceNode.parentNode !== this) { return newNode; }
    return ib.apply(this, arguments);
  };
  // NOTA: acá había un silenciador global de errores "Cannot read properties of
  // null (reading 'removeChild')". Se quitó a propósito: la causa real era el
  // script del favicon animado borrando <link> administrados por React (ya
  // corregido), y silenciar esos errores escondía navegaciones rotas — el
  // síntoma del "doble tap/click". Si reaparece ese error, es una regresión
  // que hay que arreglar de raíz, no taparla.
})();`;

// Guard de Analytics: corre síncrono en el <head>, antes de que cargue gtag.js,
// para que la PRIMERA página vista ya respete la exclusión (entrar directo a
// /admin, o un dispositivo marcado con "no contarme"). Las navegaciones cliente
// posteriores las mantiene al día el componente GoogleAnalytics. Si cambiás esta
// lógica, replicala en components/GoogleAnalytics.jsx (shouldDisable).
const gaGuardScript = `(function(){
  try {
    var id = ${JSON.stringify(process.env.NEXT_PUBLIC_GA_ID || "")};
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
        <script dangerouslySetInnerHTML={{ __html: domGuardScript }} />
        <script dangerouslySetInnerHTML={{ __html: gaGuardScript }} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=bounce-ball-v2" id="favicon" />
        <link rel="alternate icon" type="image/png" href="/icon.png?v=bounce-ball-v2" />
        <link rel="shortcut icon" href="/favicon.ico?v=bounce-ball-v2" />
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
      <body className={`flex flex-col min-h-screen ${plusJakarta.variable} ${dmSans.variable}`}>
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


