import Link from "next/link";

// Confirmación de "te mandamos el enlace", compartida por el alta y el ingreso.
//
// Es una página propia y no un estado dentro del formulario a propósito. El
// estado en memoria se pierde en cuanto la página se vuelve a montar, y ahí la
// persona no ve ninguna señal de que el correo salió: vuelve a apretar el botón
// y se lleva tres correos idénticos. Una URL de confirmación sobrevive a la
// recarga, y recargarla no reenvía nada porque es un GET.
//
// El texto no dice si el correo tiene cuenta o no: el ingreso y el alta caen en
// la misma pantalla, así que nadie puede usarla para averiguar quién está
// registrado.

export const metadata = {
  title: "Revisá tu correo | Catalán Propiedades",
  robots: { index: false, follow: false },
};

export default function EnlaceEnviadoPage() {
  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
      <div role="status" className="mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-6 w-6 fill-current">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 011.415-1.414l2.793 2.793 6.793-6.794a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-emerald-600">Enlace enviado</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Revisá tu correo</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Te enviamos un enlace seguro para entrar a tu cuenta. No necesitás crear ni recordar una contraseña.
        </p>

        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          El enlace vence en una hora y sirve una sola vez. Si no aparece en unos minutos, revisá la carpeta de correo no deseado.
        </div>

        <p className="mt-5 text-xs leading-5 text-gray-500">
          ¿No llegó? Esperá un minuto antes de pedir otro: los pedidos seguidos no generan un enlace nuevo.
        </p>

        <Link
          href="/cuenta/login/"
          className="mt-6 block text-center text-sm font-medium text-rose-600 hover:text-rose-500"
        >
          Pedir otro enlace
        </Link>
        <Link href="/" className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-800">
          ← Volver al sitio
        </Link>
      </div>
    </main>
  );
}
