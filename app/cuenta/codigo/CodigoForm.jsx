"use client";

import Link from "next/link";
import { useActionState } from "react";
import { verifyAccountCode } from "../actions";

export default function CodigoForm({ correo }) {
  const [state, action, pending] = useActionState(verifyAccountCode, undefined);

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
      <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">Revisá tu correo</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Escribí el código</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Te mandamos un código a{" "}
          <span className="font-semibold text-gray-900">{correo}</span>. Escribilo acá y entrás.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-gray-700">
              Código
            </label>
            {/*
              inputMode numeric abre el teclado de números en el celular, que es
              de donde llegan tres de cada cuatro visitas. autoComplete
              one-time-code deja que iOS y Android lo ofrezcan solos al leer el
              correo, sin tener que copiarlo a mano.
            */}
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              required
              autoFocus
              placeholder="Código del correo"
              className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-center text-2xl font-semibold tracking-[0.3em] text-gray-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          {state?.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-60"
          >
            {pending ? "Verificando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-xs leading-5 text-gray-500">
          El código vence en 15 minutos. Si no llegó, revisá la carpeta de correo no deseado.
        </p>

        <Link
          href="/cuenta/login/"
          className="mt-4 block text-center text-sm font-medium text-rose-600 hover:text-rose-500"
        >
          Usar otro correo o pedir un código nuevo
        </Link>
        <Link href="/" className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-800">
          ← Volver al sitio
        </Link>
      </div>
    </main>
  );
}
