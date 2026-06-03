import "./globals.css";
import Script from "next/script";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientShell from "@/components/ClientShell";
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
      { url: "/iso1.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/iso1.png",
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

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="icon" type="image/png" href="/iso1.png" id="favicon" />
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
        <main className="flex-grow pt-[120px]">
          {children}
        </main>
        <Footer />
        <ClientShell />
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-MSK4D75GPY" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-MSK4D75GPY');
        `}</Script>
      </body>
    </html>
  );
}
