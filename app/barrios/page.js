// Índice de la Guía de Barrios: la puerta de entrada a las fichas /barrios/[slug].
//
// Lista los barrios con ficha propia y, aparte, los que todavía no la tienen.
// Los segundos NO son links a páginas vacías: apuntan a /experiencia-barrio,
// que es donde se juntan las opiniones que después les van a dar contenido.

import Link from "next/link";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { BARRIOS, barriosConPerfil } from "@/lib/barrios";
import { getPerfilBarrio } from "@/lib/barriosPerfil";

export const metadata = {
  title: "Barrios de San Martín de los Andes: guía para elegir dónde comprar",
  description:
    "Ficha por barrio de San Martín de los Andes: precio del m², internet, transporte, acceso en invierno, distancia al hospital, cloacas y seguridad. Datos reales, ventajas y desventajas.",
  keywords:
    "barrios san martin de los andes, donde vivir san martin de los andes, centro, chapelco golf, la cascada, vega maipu, penon de lolog, caleuche",
  openGraph: {
    title: "Barrios de San Martín de los Andes — Catalán Propiedades",
    description:
      "Una ficha por barrio con precio del m², servicios, acceso en invierno y la opinión de los vecinos.",
    url: canonicalUrl("/barrios"),
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Barrios de San Martín de los Andes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barrios de San Martín de los Andes",
    description: "Precio del m², servicios y acceso en invierno, barrio por barrio.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: { canonical: canonicalUrl("/barrios") },
};

export default function BarriosIndexPage() {
  const conFicha = barriosConPerfil();
  const sinFicha = BARRIOS.filter((b) => !b.perfilCompleto);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Barrios de San Martín de los Andes",
    itemListElement: conFicha.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.nombre,
      url: canonicalUrl(`/barrios/${b.slug}`),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Barrios", item: canonicalUrl("/barrios") },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-gray-50 border-b border-gray-100 pt-8 pb-10 md:pt-20 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">Guía de Barrios</p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-jakarta leading-tight mb-4">
            Los barrios de San Martín de los Andes, uno por uno
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl">
            Precio del m², internet, transporte, acceso en invierno y distancia al
            hospital. Lo que necesitás saber antes de elegir dónde comprar — incluido
            lo que no sale en los avisos.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <ul className="grid gap-5 sm:grid-cols-2">
          {conFicha.map((b) => {
            const perfil = getPerfilBarrio(b.slug);
            return (
              <li key={b.slug}>
                <Link
                  href={`/barrios/${b.slug}`}
                  className="group block h-full rounded-2xl border border-gray-200 p-6 transition hover:border-rose-300 hover:shadow-lg"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h2 className="text-xl font-black text-gray-900 font-jakarta group-hover:text-rose-600">
                      <span aria-hidden="true">{perfil.emoji}</span> {b.nombre}
                    </h2>
                    <span className="shrink-0 text-sm font-bold text-rose-600">{perfil.precioM2}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{perfil.descripcion}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {perfil.tags.map((t) => (
                      <span key={t} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {sinFicha.length > 0 && (
          <section className="mt-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 sm:p-8">
            <h2 className="text-xl font-black text-gray-900 font-jakarta mb-2">
              Barrios que todavía no tienen ficha
            </h2>
            <p className="text-sm text-gray-600 mb-4 max-w-2xl">
              {sinFicha.map((b) => b.nombre).join(", ")}. No les armamos una página
              con datos a medias: las fichas salen cuando tenemos información
              verificada y opiniones de vecinos. Si vivís en alguno, tu respuesta es
              lo que hace que exista.
            </p>
            <Link
              href="/experiencia-barrio"
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              Contar cómo es mi barrio
            </Link>
          </section>
        )}

        <p className="text-sm text-gray-600 mt-10">
          ¿Querés el panorama completo en una sola lectura? Leé la{" "}
          <Link href="/blog/donde-vivir-san-martin-de-los-andes" className="text-rose-600 font-semibold hover:underline">
            guía comparativa de barrios
          </Link>{" "}
          o mirá la{" "}
          <Link href="/precio-m2" className="text-rose-600 font-semibold hover:underline">
            evolución del precio del m²
          </Link>.
        </p>
      </div>
    </div>
  );
}
