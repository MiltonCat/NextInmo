import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/adminAccess";
import { getClientPortalData } from "@/lib/clientPortal";
import { getPropertySlug } from "@/data/properties";
import { signOutAccount } from "./actions";
import FavoriteSync from "./FavoriteSync";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("es-AR");
function dateLabel(value) {
  const text = String(value || "");
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  return new Date(value).toLocaleDateString("es-AR");
}

function EmptyState({ children }) {
  return <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">{children}</p>;
}

export default async function AccountPage() {
  const user = await requireAuthenticatedUser();
  let data;
  let setupError = null;

  try {
    data = await getClientPortalData(user.id);
  } catch (error) {
    setupError = String(error?.message || error);
  }

  // Las secciones de propietario solo existen para quien realmente tiene
  // publicaciones vinculadas (y para el admin). Un comprador no debe ver
  // encabezados vacíos de un rol que no le corresponde: la página de registro
  // le promete explícitamente que su cuenta no accede a esos datos.
  const showOwnerSections =
    !setupError && (isAdminUser(user) || (data?.ownedProperties?.length ?? 0) > 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">Área privada</p>
            <h1 className="text-xl font-bold text-gray-900">Mi cuenta</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <form action={signOutAccount}>
            <button type="submit" className="text-sm font-medium text-gray-600 hover:text-gray-900">Cerrar sesión</button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <FavoriteSync />
        {setupError ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-900">La cuenta todavía no está habilitada</h2>
            <p className="mt-2 text-sm text-amber-800">
              La sesión es válida, pero falta completar la configuración privada en Supabase. Ningún dato fue expuesto.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <pre className="mt-3 overflow-x-auto text-xs text-amber-700">{setupError}</pre>
            )}
          </section>
        ) : (
          <>
            <section>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Favoritos</h2>
                  <p className="text-sm text-gray-500">Propiedades guardadas en tu cuenta.</p>
                </div>
                <Link href="/propiedades" className="text-sm font-semibold text-rose-600 hover:text-rose-500">Ver propiedades</Link>
              </div>
              {data.favorites.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {data.favorites.map((property) => (
                    <Link key={property.id} href={`/propiedades/${getPropertySlug(property)}/`} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-rose-200">
                      <p className="font-semibold text-gray-900">{property.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{property.location}</p>
                    </Link>
                  ))}
                </div>
              ) : <EmptyState>No tenés favoritos sincronizados todavía. Tus favoritos anónimos actuales siguen guardados en este dispositivo.</EmptyState>}
            </section>

            {/* Nada escribe en `saved_valuations` todavía: el tasador es otra
                app (repo tasador-sma) y no está conectado a la cuenta. Mostrar
                el encabezado con "no guardaste ninguna tasación" hacía parecer
                que la función existe y que el usuario no la usó. Se dibuja solo
                cuando hay algo real que mostrar; el día que el tasador guarde,
                aparece sola sin tocar nada. */}
            {data.valuations.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900">Tasaciones guardadas</h2>
                <p className="mb-3 text-sm text-gray-500">Resultados que decidas conservar en tu cuenta.</p>
                <div className="space-y-2">
                  {data.valuations.map((valuation) => (
                    <div key={valuation.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <p className="font-semibold text-gray-900">{valuation.label || "Tasación guardada"}</p>
                      <p className="text-xs text-gray-400">Guardada el {dateLabel(valuation.created_at)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {showOwnerSections && (
            <>
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-bold text-gray-900">Mis publicaciones</h2>
              <p className="mb-3 text-sm text-gray-500">Solo aparecen propiedades vinculadas explícitamente a tu usuario.</p>
              {data.ownedProperties.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {data.ownedProperties.map((property) => (
                    <Link key={property.id} href={`/propiedades/${getPropertySlug(property)}/`} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-rose-200">
                      <p className="font-semibold text-gray-900">{property.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{property.location}</p>
                    </Link>
                  ))}
                </div>
              ) : <EmptyState>No hay publicaciones vinculadas a tu cuenta. La asignación requiere validación manual de identidad y titularidad.</EmptyState>}
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">Consultas recibidas</h2>
              <p className="mb-3 text-sm text-gray-500">Solo consultas asociadas a tus publicaciones vinculadas.</p>
              {data.ownerInquiries.length ? (
                <div className="space-y-3">
                  {data.ownerInquiries.map((inquiry) => (
                    <article key={inquiry.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900">{inquiry.property_title || `Propiedad ${inquiry.property_id}`}</p>
                        <span className="text-xs text-gray-400">{dateLabel(inquiry.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{inquiry.mensaje || "Consulta sin mensaje."}</p>
                      <p className="mt-2 text-xs text-gray-500">{[inquiry.nombre, inquiry.email, inquiry.telefono].filter(Boolean).join(" · ")}</p>
                    </article>
                  ))}
                </div>
              ) : <EmptyState>Todavía no hay consultas relacionadas con tus publicaciones.</EmptyState>}
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">Rendimiento de publicaciones</h2>
              <p className="mb-3 text-sm text-gray-500">Métricas reales disponibles únicamente para tus publicaciones.</p>
              {data.performance.length ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-500">
                      <tr><th className="px-4 py-3">Publicación</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Vistas</th><th className="px-4 py-3">Favoritos</th><th className="px-4 py-3">Consultas</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.performance.map((row) => (
                        <tr key={`${row.property_id}-${row.metric_date}`}><td className="max-w-xs truncate px-4 py-3" title={row.property?.title}>{row.property?.title || `Propiedad ${row.property_id}`}</td><td className="px-4 py-3">{dateLabel(row.metric_date)}</td><td className="px-4 py-3">{nf.format(row.detail_views)}</td><td className="px-4 py-3">{nf.format(row.favorite_adds)}</td><td className="px-4 py-3">{nf.format(row.inquiries_received)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <EmptyState>Aún no hay métricas verificadas para mostrar. No se generan estimaciones ni números de ejemplo.</EmptyState>}
            </section>
            </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
