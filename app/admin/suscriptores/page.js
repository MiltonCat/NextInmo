import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getSubscribers } from "@/lib/suscriptores";
import { signOut } from "../actions";
import SubscriberList from "./SubscriberList";

// El panel siempre muestra datos frescos (no cacheado).
export const dynamic = "force-dynamic";

export default async function SuscriptoresPage() {
  const user = await requireUser();
  const subscribers = await getSubscribers();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Suscriptores</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              Propiedades
            </Link>
            <Link href="/admin/consultas" className="text-sm text-gray-600 hover:text-gray-900">
              Consultas
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
        <SubscriberList subscribers={subscribers} />
      </div>
    </main>
  );
}
