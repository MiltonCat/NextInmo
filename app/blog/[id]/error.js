"use client";
import Link from "next/link";

export default function Error({ reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-rose-600 text-sm font-semibold uppercase tracking-widest mb-3">Error</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No pudimos cargar este artículo</h1>
        <p className="text-gray-500 mb-8">Puede ser un problema temporal. Intentá de nuevo o volvé al blog.</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-500 transition-colors"
          >
            Reintentar
          </button>
          <Link
            href="/blog"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Ver blog
          </Link>
        </div>
      </div>
    </div>
  );
}
