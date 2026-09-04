import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProperties } from "@/lib/properties";
import { countNuevas } from "@/lib/crm";
import { signOut } from "./actions";
import DeleteButton from "./DeleteButton";

// El panel siempre muestra datos frescos (no cacheado).
export const dynamic = "force-dynamic";

function formatPrice(p) {
  if (p == null) return "—";
  return "USD " + Number(p).toLocaleString("es-AR");
}

export default async function AdminPage() {
  const user = await requireUser();
  const properties = await getProperties();
  const nuevas = await countNuevas();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Panel de propiedades</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/analytics"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Analítica
            </Link>
            <Link
              href="/admin/consultas"
              className="relative text-sm text-gray-600 hover:text-gray-900"
            >
              Consultas
              {nuevas > 0 && (
                <span className="absolute -top-2 -right-4 bg-rose-600 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none">
                  {nuevas}
                </span>
              )}
            </Link>
            <Link
              href="/admin/suscriptores"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Suscriptores
            </Link>
            <Link
              href="/admin/lucia"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Lucía
            </Link>
            <Link
              href="/admin/barrios"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Barrios
            </Link>
            <Link
              href="/admin/propiedades/nueva"
              className="rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
            >
              + Cargar propiedad
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-3">{properties.length} propiedades</p>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Foto</th>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Operación</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image || "/imgs/placeholder.webp"}
                      alt=""
                      className="w-16 h-12 object-cover rounded-md bg-gray-200"
                    />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="text-gray-900 line-clamp-2">{p.title}</span>
                    <span className="block text-xs text-gray-400">{p.location}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {p.operation || p.modalidad || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    {p.alquilada && <span className="text-xs text-orange-600">Alquilada</span>}
                    {p.reservada && <span className="text-xs text-blue-600">Reservada</span>}
                    {!p.alquilada && !p.reservada && (
                      <span className="text-xs text-green-600">Disponible</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/propiedades/${p.id}`}
                        className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={p.id} title={p.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
