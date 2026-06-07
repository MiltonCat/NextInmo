import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getInquiries } from "@/lib/crm";
import { signOut } from "../actions";
import InquiryCard from "./InquiryCard";

// El panel siempre muestra datos frescos (no cacheado).
export const dynamic = "force-dynamic";

const FILTROS = [
  { value: "", label: "Todas" },
  { value: "nuevo", label: "Nuevas" },
  { value: "contactado", label: "Contactadas" },
  { value: "en_proceso", label: "En proceso" },
  { value: "cerrado", label: "Cerradas" },
  { value: "descartado", label: "Descartadas" },
];

export default async function ConsultasPage({ searchParams }) {
  const user = await requireUser();
  const { estado = "" } = (await searchParams) ?? {};
  const inquiries = await getInquiries({ estado: estado || undefined });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Consultas</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              Propiedades
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filtros por estado */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FILTROS.map((f) => {
            const activo = (estado || "") === f.value;
            return (
              <Link
                key={f.value}
                href={f.value ? `/admin/consultas?estado=${f.value}` : "/admin/consultas"}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  activo ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <p className="text-sm text-gray-500 mb-3">
          {inquiries.length} {inquiries.length === 1 ? "consulta" : "consultas"}
        </p>

        {inquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
            No hay consultas{estado ? " en este estado" : " todavía"}.
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <InquiryCard key={inq.id} inquiry={inq} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
