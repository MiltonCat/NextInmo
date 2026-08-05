"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAccount } from "../actions";

export default function LoginForm({ authFailed = false }) {
  const [state, action, pending] = useActionState(signInAccount, undefined);

  if (state?.success) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <div role="status" className="mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Enlace enviado</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Revisá tu correo</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Si el correo corresponde a una cuenta, recibirás un enlace seguro para ingresar. El enlace vence y solo puede usarse una vez.
          </p>
          <Link href="/" className="mt-6 block text-center text-sm font-medium text-rose-600 hover:text-rose-500">
            Volver al sitio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
      <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">Cuenta privada</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="mt-2 text-sm text-gray-500">Ingresá con un enlace seguro enviado a tu correo.</p>

        {/* El callback redirige acá con ?auth_error=1 cuando el enlace no sirve.
            Sin este aviso el usuario vuelve al formulario sin saber qué pasó y
            vuelve a pedir otro enlace, gastando la cuota de correos. */}
        {authFailed && (
          <div role="alert" className="mt-5 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
            <p className="text-sm font-semibold text-amber-900">Ese enlace ya no sirve</p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Los enlaces vencen y solo pueden usarse una vez. Pedí uno nuevo acá abajo.
            </p>
          </div>
        )}

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-rose-500" />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={pending} className="w-full rounded-xl bg-rose-600 py-2.5 font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60">
            {pending ? "Enviando…" : "Enviarme un enlace de acceso"}
          </button>
        </form>

        <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-center">
          <p className="text-xs text-gray-600">¿Buscás propiedades?</p>
          <Link href="/cuenta/registro" className="mt-1 inline-block text-sm font-semibold text-rose-600 hover:text-rose-500">
            Crear una cuenta de comprador
          </Link>
        </div>
        <Link href="/" className="mt-4 block text-center text-sm text-gray-500 hover:text-gray-800">← Volver al sitio</Link>
      </div>
    </main>
  );
}
