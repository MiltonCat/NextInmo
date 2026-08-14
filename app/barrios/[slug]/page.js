// Ficha pública de barrio — el punto 3 del plan en docs/guia-de-barrios.md.
//
// Sirve al COMPRADOR que busca "cómo es vivir en <barrio>". El vecino que quiere
// aportar tiene /experiencia-barrio y el bloque del final de esta misma página.
//
// Tres fuentes distintas, mostradas por separado a propósito:
//   1. Perfil editorial  (lib/barriosPerfil.js)  — lo que investigamos nosotros
//   2. Precio del m²     (lib/precioZonas.js)    — mediana real del modelo
//   3. Opiniones         (Supabase)              — lo que dicen los vecinos
//
// Solo se publican los barrios con `perfilCompleto`. Un barrio sin perfil no
// tiene nada que mostrar salvo un formulario vacío, y trece páginas casi vacías
// hacen daño en vez de traer tráfico.

import Link from "next/link";
import { notFound } from "next/navigation";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { barriosConPerfil, getBarrio, barrioDePropiedad } from "@/lib/barrios";
import { getPerfilBarrio } from "@/lib/barriosPerfil";
import { medianaDeBarrio } from "@/lib/precioZonas";
import { getOpinionesPublicas } from "@/lib/barrioOpiniones";
import { DIMENSIONES, nivelDePublicacion, formatearProporcion } from "@/lib/barrioEncuesta";
import { getProperties } from "@/lib/properties";
import { getPropertySlug } from "@/data/properties";
import BarrioEncuestaCTA from "@/components/BarrioEncuestaCTA";

// Las opiniones se van sumando: la ficha se revalida sin necesidad de deploy.
export const revalidate = 3600;

export function generateStaticParams() {
  return barriosConPerfil().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const perfil = getPerfilBarrio(slug);
  const barrio = getBarrio(slug);
  if (!perfil || !barrio) return {};

  const titulo = `${barrio.nombre}, San Martín de los Andes: cómo es vivir en el barrio`;
  const desc = `${barrio.nombre} en San Martín de los Andes: precio del m², internet, transporte, acceso en invierno, hospital, cloacas y seguridad. Ventajas y desventajas reales antes de comprar.`;

  return {
    title: titulo,
    description: desc,
    keywords: `${barrio.nombre} san martin de los andes, vivir en ${barrio.nombre}, barrio ${barrio.nombre}, comprar en ${barrio.nombre}`,
    openGraph: {
      title: `${titulo} — Catalán Propiedades`,
      description: desc,
      url: canonicalUrl(`/barrios/${slug}`),
      type: "article",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `Barrio ${barrio.nombre}, San Martín de los Andes` }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: desc,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: { canonical: canonicalUrl(`/barrios/${slug}`) },
  };
}

// ── Piezas de UI ───────────────────────────────────────────────────────────

function Barras({ nivel, max = 5 }) {
  return (
    <span className="inline-flex gap-1 align-middle" aria-label={`${nivel} de ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-4 rounded-full ${i < nivel ? "bg-rose-500" : "bg-gray-200"}`}
        />
      ))}
    </span>
  );
}

function Dato({ label, nivel, detalle }) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <div className="flex items-center justify-between gap-4 mb-1">
        <span className="text-sm font-bold text-gray-900">{label}</span>
        {typeof nivel === "number" && <Barras nivel={nivel} />}
      </div>
      {detalle && <p className="text-sm text-gray-600">{detalle}</p>}
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default async function BarrioPage({ params }) {
  const { slug } = await params;
  const barrio = getBarrio(slug);
  const perfil = getPerfilBarrio(slug);

  // Solo existen las fichas con perfil. Un slug válido pero sin perfil (por
  // ejemplo "costanera") todavía no es una página: 404 antes que página vacía.
  if (!barrio || !perfil || barrio.slug !== slug) notFound();

  const mediana = medianaDeBarrio(slug);
  const { agregado, citas } = await getOpinionesPublicas(slug);

  const todas = await getProperties();
  const propiedades = todas
    .filter((p) => !p.vendida && !p.noDisponible && p.status !== "no_disponible")
    // Usa el campo `barrio` cargado en el panel y, si está vacío, cae al texto
    // de `location` como antes. Ver barrioDePropiedad en lib/barrios.js: con la
    // deducción sola, esta lista quedaba vacía en casi todos los barrios.
    .filter((p) => barrioDePropiedad(p)?.slug === slug);

  const n = agregado?.n ?? 0;
  const nivel = nivelDePublicacion(n);
  const otros = barriosConPerfil().filter((b) => b.slug !== slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Barrios", item: canonicalUrl("/barrios") },
      { "@type": "ListItem", position: 3, name: barrio.nombre, item: canonicalUrl(`/barrios/${slug}`) },
    ],
  };

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${barrio.nombre}, San Martín de los Andes`,
    description: perfil.descripcion,
    image: DEFAULT_OG_IMAGE,
    url: canonicalUrl(`/barrios/${slug}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: "San Martín de los Andes",
      addressRegion: "Neuquén",
      addressCountry: "AR",
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }} />

      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 pt-8 pb-10 md:pt-20 md:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-gray-500 mb-4" aria-label="Migas de pan">
            <Link href="/" className="hover:text-rose-600">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/barrios" className="hover:text-rose-600">Barrios</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{barrio.nombre}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-jakarta leading-tight mb-4">
            <span aria-hidden="true">{perfil.emoji}</span> {barrio.nombre}: cómo es vivir en el barrio
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mb-6">{perfil.descripcion}</p>

          <div className="flex flex-wrap gap-2">
            {perfil.tags.map((t) => (
              <span key={t} className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">

        {/* ── Precio del m² ────────────────────────────────────────────
            Cuando el modelo tiene datos suficientes del barrio, ese es EL
            número y el rango editorial del perfil no se muestra: los dos
            juntos se contradicen a la vista (en Vega Maipú el perfil decía
            1.400–1.900 y la mediana real es 2.508) y obligan al visitante a
            decidir a cuál creerle.

            Y desde el 2026-08-10 el rango editorial ya no existe: los perfiles
            de lib/barriosPerfil.js dejaron de traer precios escritos a mano.
            Cuando el modelo no cubre el barrio no se muestra ningún número —
            antes se mostraba el rango del perfil, que era justo el que estaba
            desactualizado. Le pasa a Peñón de Lolog, con 3 propiedades. */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 font-jakarta mb-1">Cuánto cuesta el m²</h2>
          <p className="text-sm text-gray-500 mb-5">
            {mediana
              ? `Mediana de ${mediana.n} propiedades relevadas en el barrio`
              : "Todavía sin datos suficientes en este barrio"}
          </p>

          <div className="rounded-2xl border border-gray-200 p-6">
            {mediana ? (
              <>
                <p className="text-3xl font-black text-rose-600 mb-1">
                  USD {mediana.medianaM2.toLocaleString("es-AR")}
                  <span className="text-lg font-bold text-gray-400"> /m²</span>
                </p>
                <p className="text-sm text-gray-600">
                  Mediana del m² publicado en {barrio.nombre}, sobre {mediana.n} propiedades
                  relevadas. La mediana es el valor del medio: la mitad se publica por encima y
                  la mitad por debajo.
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-black text-gray-400 mb-1">Sin dato publicable</p>
                <p className="text-sm text-gray-600">
                  Todavía no tenemos propiedades relevadas suficientes en esta zona como para
                  publicar una mediana. Preferimos no dar un número antes que dar uno que no
                  podemos respaldar — si querés una referencia para una propiedad concreta,
                  tasala con el modelo.
                </p>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-4">
            El rango sirve para orientarse, no para tasar.{" "}
            <Link href="/tasacion" className="text-rose-600 font-semibold hover:underline">
              Tasá tu propiedad con el modelo
            </Link>{" "}
            o mirá la{" "}
            <Link href="/precio-m2" className="text-rose-600 font-semibold hover:underline">
              evolución del m² en toda la ciudad
            </Link>.
          </p>
        </section>

        {/* ── Datos duros ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 font-jakarta mb-5">
            Servicios e infraestructura
          </h2>
          <div className="rounded-2xl border border-gray-200 px-6">
            <Dato label="Internet" nivel={perfil.internet.nivel} detalle={perfil.internet.detalle} />
            <Dato label="Transporte público" nivel={perfil.transporte.nivel} detalle={perfil.transporte.detalle} />
            <Dato label="Cloacas" nivel={perfil.cloacas.nivel} detalle={perfil.cloacas.estado} />
            <Dato label="Estado de las calles" nivel={perfil.calles.nivel} detalle={perfil.calles.estado} />
            <Dato label="Seguridad" nivel={perfil.seguridad.nivel} detalle={perfil.seguridad.detalle} />
            <Dato
              label="¿Se puede vivir sin auto?"
              detalle={perfil.autoObligatorio
                ? "No. El auto es indispensable para todo."
                : "Sí, se puede resolver el día a día sin auto."}
            />
            <Dato label="Pet friendly" detalle={perfil.petFriendly ? "Sí" : "Con limitaciones"} />
          </div>
        </section>

        {/* ── Salud ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 font-jakarta mb-1">
            A qué distancia está la atención médica
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            El dato que más pesa y que casi nadie mira antes de comprar.
          </p>
          <ul className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {perfil.hospital.items.map((h) => (
              <li key={h.nombre} className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4">
                <div>
                  <span className="text-xs uppercase tracking-wide text-gray-500">{h.tipo}</span>
                  <p className="text-sm font-semibold text-gray-900">{h.nombre}</p>
                </div>
                <span className="text-sm font-bold text-gray-700">{h.distancia}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Ventajas y desventajas ───────────────────────────────── */}
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <h2 className="text-lg font-black text-green-900 font-jakarta mb-3">A favor</h2>
            <ul className="space-y-2">
              {perfil.ventajas.map((v) => (
                <li key={v} className="text-sm text-green-900 flex gap-2">
                  <span aria-hidden="true">+</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-black text-amber-900 font-jakarta mb-3">En contra</h2>
            <ul className="space-y-2">
              {perfil.desventajas.map((d) => (
                <li key={d} className="text-sm text-amber-900 flex gap-2">
                  <span aria-hidden="true">−</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Para quién ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 font-jakarta mb-4">Para quién funciona</h2>
          <div className="flex flex-wrap gap-2">
            {perfil.perfil.map((p) => (
              <span key={p} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* ── Qué dicen los vecinos ────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 font-jakarta mb-1">
            Qué dicen los vecinos
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Encuesta abierta y moderada. Todo lo de arriba lo investigamos nosotros;
            esto lo responden los que viven acá.
          </p>

          {nivel === "insuficiente" ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
              <p className="text-sm text-gray-700">
                {n === 0
                  ? `Todavía no tenemos opiniones de ${barrio.nombre}.`
                  : `Tenemos ${n} ${n === 1 ? "respuesta" : "respuestas"} de ${barrio.nombre}.`}{" "}
                No publicamos promedios hasta tener al menos 5: con muestra chica un
                número parece un dato y es ruido.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-5">
                Sobre <strong className="text-gray-900">{n}</strong>{" "}
                {n === 1 ? "respuesta" : "respuestas"}
                {agregado.n_residentes > 0 && <> · {agregado.n_residentes} de residentes actuales</>}
                {agregado.n_veteranos > 0 && <> · {agregado.n_veteranos} con más de 5 años en el barrio</>}.
              </p>

              <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 mb-6">
                {DIMENSIONES.filter((d) => agregado[d.key] != null).map((d) => (
                  <div key={d.key} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700">{d.label}</span>
                    <span className="flex items-center gap-2">
                      <Barras nivel={Math.round(agregado[d.key])} />
                      <span className="text-sm font-bold text-gray-900 w-7 text-right">
                        {agregado[d.key]}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 border-t border-gray-100 pt-5">
                {[
                  { label: "Lo recomiendan para vivir", txt: formatearProporcion(agregado.rec_vivir_si, n) },
                  { label: "Lo recomiendan para invertir", txt: formatearProporcion(agregado.rec_invertir_si, n) },
                  { label: "Volvería a elegirlo", txt: formatearProporcion(agregado.volveria_si, agregado.volveria_total) },
                ]
                  .filter((m) => m.txt)
                  .map((m) => (
                    <div key={m.label}>
                      <p className="text-xl font-black text-rose-600">{m.txt}</p>
                      <p className="text-xs text-gray-600">{m.label}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {citas.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Lo que les hubiera gustado saber antes de mudarse
              </h3>
              {citas.map((c) => (
                <blockquote key={c.id} className="rounded-2xl border-l-4 border-rose-500 bg-gray-50 px-5 py-4">
                  <p className="text-sm text-gray-800 italic">“{c.cita}”</p>
                </blockquote>
              ))}
            </div>
          )}
        </section>

        {/* ── Propiedades del barrio ───────────────────────────────── */}
        {propiedades.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-gray-900 font-jakarta mb-5">
              {propiedades.length === 1
                ? `1 propiedad disponible en ${barrio.nombre}`
                : `${propiedades.length} propiedades disponibles en ${barrio.nombre}`}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {propiedades.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/propiedades/${getPropertySlug(p)}`}
                    className="block rounded-2xl border border-gray-200 p-5 transition hover:border-rose-300 hover:shadow-md"
                  >
                    <p className="font-bold text-gray-900 mb-1">{p.title}</p>
                    <p className="text-sm text-gray-600">{p.location}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Sumá tu opinión ──────────────────────────────────────── */}
        <BarrioEncuestaCTA slug={slug} nombre={barrio.nombre} />

        {/* ── Otros barrios ────────────────────────────────────────── */}
        <section className="border-t border-gray-100 pt-8">
          <h2 className="text-lg font-black text-gray-900 font-jakarta mb-4">Otros barrios</h2>
          <div className="flex flex-wrap gap-2">
            {otros.map((b) => (
              <Link
                key={b.slug}
                href={`/barrios/${b.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-rose-300 hover:text-rose-600"
              >
                {b.nombre}
              </Link>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-5">
            ¿Todavía no sabés cuál elegir? Leé la{" "}
            <Link href="/blog/donde-vivir-san-martin-de-los-andes" className="text-rose-600 font-semibold hover:underline">
              guía completa de barrios
            </Link>{" "}
            o mirá las{" "}
            <Link href="/propiedades" className="text-rose-600 font-semibold hover:underline">
              propiedades en venta
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
