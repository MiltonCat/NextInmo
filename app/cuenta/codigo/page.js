import Link from "next/link";
import { getPendingAuthEmail } from "../actions";
import CodigoForm from "./CodigoForm";

export const metadata = {
  title: "Escribí el código | Catalán Propiedades",
  robots: { index: false, follow: false },
};

// El correo se lee de la cookie en el servidor y solo se muestra para que la
// persona confirme que es el suyo. Nunca viaja por la URL.
export default async function CodigoPage() {
  const correo = await getPendingAuthEmail();

  // Sin cookie no hay a quién validarle el código: pasó el cuarto de hora, o
  // se llegó a esta URL de rebote. Se manda a pedir uno nuevo en vez de dejar
  // un formulario que no puede funcionar.
  if (!correo) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Pedí un código nuevo</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Pasó demasiado tiempo desde que pediste el anterior. Poné tu correo otra vez y te
            mandamos uno.
          </p>
          <Link
            href="/cuenta/login/"
            className="mt-6 block rounded-xl bg-rose-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-rose-500"
          >
            Pedir un código
          </Link>
        </div>
      </main>
    );
  }

  return <CodigoForm correo={correo} />;
}
