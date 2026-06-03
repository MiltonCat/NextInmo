import dynamic from "next/dynamic";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
const ContactoClient = dynamic(() => import("./ContactoClient"));

export const metadata = {
  title: "Contacto | Catalán Propiedades — San Martín de los Andes",
  description: "Contactate con Catalán Propiedades. Respuesta en menos de 48 horas. Asesoría inmobiliaria personalizada en San Martín de los Andes, Patagonia Argentina.",
  openGraph: {
    title: "Contacto — Catalán Propiedades",
    description: "Hablemos de tu inversión. Completá el formulario y te respondo en menos de 48 horas.",
    url: canonicalUrl("/contacto"),
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Contacto — Catalán Propiedades" }],
  },
  alternates: {
    canonical: canonicalUrl("/contacto"),
  },
};

export default function ContactPage() {
  return <ContactoClient />;
}
