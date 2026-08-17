import ExperienciaBarrioPage from "@/components/ExperienciaBarrioPage";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";

// La página rankea en posición ~3,5 con 84 impresiones en 28 días y solo 2
// clics: 2,4% de CTR donde esa posición debería dar 8-10%.
//
// El título anterior, "Guía de Barrios", describía el formato pero no lo que
// se gana entrando. La descripción hablaba de "experiencias reales" en
// abstracto. Ahora ambos nombran lo concreto que la encuesta realmente
// releva —acceso en invierno, ruido, servicios, señal— porque eso es lo que
// nadie más publica y lo que de verdad decide una mudanza en esta ciudad.
//
// El título evita a propósito la frase "dónde vivir": esa la trabaja
// /blog/donde-vivir-san-martin-de-los-andes y competir con la propia página
// por la misma consulta reparte la fuerza en vez de sumarla.
export const metadata = {
  title: "Barrios de San Martín de los Andes: opiniones de vecinos",
  description: "¿Cómo es vivir en Centro, Chapelco o Costanera? Vecinos cuentan cómo es el acceso en invierno, el ruido, los servicios y la señal de cada barrio.",
  // Al compartir por WhatsApp conviene el gancho más fuerte y más corto: en el
  // teléfono se ven pocas líneas y el invierno es la preocupación que más
  // pesa acá.
  openGraph: {
    title: "Barrios de San Martín de los Andes, contados por sus vecinos",
    description: "Cómo es el acceso en invierno, el ruido y los servicios en cada barrio. Información que ningún portal inmobiliario tiene.",
    url: canonicalUrl("/experiencia-barrio"),
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Barrios de San Martín de los Andes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barrios de San Martín de los Andes, contados por sus vecinos",
    description: "Cómo es el acceso en invierno, el ruido y los servicios en cada barrio.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/experiencia-barrio"),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Guía de Barrios", item: canonicalUrl("/experiencia-barrio") },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ExperienciaBarrioPage />
    </>
  );
}
