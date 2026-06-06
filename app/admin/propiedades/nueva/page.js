import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createProperty } from "../../property-actions";
import PropertyForm from "../../PropertyForm";

export const dynamic = "force-dynamic";

export default async function NuevaPropiedadPage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
            ← Volver
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Cargar propiedad</h1>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <PropertyForm action={createProperty} />
      </div>
    </main>
  );
}
