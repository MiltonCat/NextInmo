import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getOpiniones, contarPorEstado } from "@/lib/barrioOpiniones";
import { nombreDeBarrio } from "@/lib/barrios";
import { nivelDePublicacion } from "@/lib/barrioEncuesta";
import { signOut } from "../actions";
import OpinionesList from "./OpinionesList";

// El panel siempre muestra datos frescos (no cacheado).
export const dynamic = "force-dynamic";

export default async function BarriosAdminPage() {
  const user = await requireUser();

  let opiniones = [];
  let conteos = { pendiente: 0, aprobada: 0, rechazada: 0 };
  let error = null;

  try {
    [opiniones, conteos] = await Promise.all([getOpiniones(), contarPorEstado()]);
  } catch (err) {
    // Lo más probable si falla acá: todavía no se corrió la migración SQL.
    error = err.message;
  }

  // Avance por barrio sobre las aprobadas: es lo que decide qué se puede
  // publicar en cada ficha.
  const porBarrio = new Map();
  for (const o of opiniones) {
    if (o.estado !== "aprobada") continue;
    porBarrio.set(o.barrio, (porBarrio.get(o.barrio) || 0) + 1);
  }
  const resumenPorBarrio = [...porBarrio.entries()]
    .map(([slug, n]) => ({ slug, nombre: nombreDeBarrio(slug), n, nivel: nivelDePublicacion(n) }))
    .sort((a, b) => b.n - a.n);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Guía de Barrios</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              Propiedades
            </Link>
            <Link href="/admin/consultas" className="text-sm text-gray-600 hover:text-gray-900">
              Consultas
            </Link>
            <Link href="/admin/suscriptores" className="text-sm text-gray-600 hover:text-gray-900">
              Suscriptores
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {error ? (
          <div className="bg-white rounded-xl border border-amber-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Falta crear la tabla de opiniones
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Corré una sola vez el script <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">docs/sql/barrio_opiniones.sql</code>{" "}
              en el SQL Editor de Supabase. Hasta entonces las respuestas del formulario no se
              pueden guardar.
            </p>
            <p className="text-xs text-gray-400 font-mono break-all">{error}</p>
          </div>
        ) : (
          <OpinionesList
            opiniones={opiniones}
            conteos={conteos}
            resumenPorBarrio={resumenPorBarrio}
          />
        )}
      </div>
    </main>
  );
}
