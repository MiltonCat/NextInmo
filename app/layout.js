import "./globals.css";
import Script from "next/script";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientShell from "@/components/ClientShell";

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
  title: "Catalán Propiedades | San Martín de los Andes",
  description: "Asesoría inmobiliaria de alto valor en San Martín de los Andes, Patagonia. Propiedades en venta y alquiler permanente.",
  openGraph: {
    siteName: "Catalán Propiedades",
    locale: "es_AR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Catalán Propiedades",
  description: "Asesoría inmobiliaria en San Martín de los Andes, Patagonia Argentina. Venta, alquiler permanente e inversiones.",
  telephone: "+54-9-2944-30-1470",
  email: "ventascatalanprop@gmail.com",
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/png" href="/iso1.png" id="favicon" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`flex flex-col min-h-screen ${plusJakarta.variable} ${dmSans.variable}`}>
        <Navbar />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
        <ClientShell />
        <Script id="favicon-anim" strategy="afterInteractive">{`
          (function () {
            const canvas = document.createElement("canvas");
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.src = "/iso1.png";
            img.onload = function () {
              let angle = 0, scale = 1, growing = true, frame = 0;
              function draw() {
                ctx.clearRect(0, 0, 64, 64);
                ctx.save();
                ctx.translate(32, 32);
                if (growing) { scale += 0.004; if (scale >= 1.12) growing = false; }
                else         { scale -= 0.004; if (scale <= 0.92) growing = true; }
                frame++;
                if (frame > 120) angle += 0.06;
                if (angle >= Math.PI * 2) { angle = 0; frame = 0; }
                ctx.rotate(angle);
                ctx.scale(scale, scale);
                ctx.drawImage(img, -40, -40, 80, 80);
                ctx.restore();
                const favicon = document.getElementById("favicon");
                if (favicon) favicon.href = canvas.toDataURL("image/png");
                requestAnimationFrame(draw);
              }
              draw();
            };
          })();
        `}</Script>
      </body>
    </html>
  );
}
