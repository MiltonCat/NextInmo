"use client";

import Link from "next/link";

export default function PageError({ unstable_retry }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center" aria-labelledby="page-error-title">
      <h1 id="page-error-title" className="text-2xl font-bold text-gray-900">
        No pudimos cargar esta página
      </h1>
      <p className="mt-4 text-gray-600">
        Intentá nuevamente en unos instantes. También podés contactarnos para
        consultar precios y disponibilidad.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button type="button" onClick={() => unstable_retry()} className="rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white hover:bg-rose-700">
          Reintentar
        </button>
        <Link href="/contacto/" className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-900">
          Contactarnos
        </Link>
      </div>
    </section>
  );
}
