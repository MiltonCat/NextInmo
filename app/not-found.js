"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const gridStyle = {
    backgroundImage: `linear-gradient(rgba(244,114,182,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(244,114,182,0.06) 1px, transparent 1px)`,
    backgroundSize: "48px 48px",
  };

  return (
    <div
      className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
      style={gridStyle}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-transparent to-[#0A0F1C]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-rose-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <p className="text-[10rem] font-black text-rose-500 leading-none mb-2 font-jakarta">404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Página no encontrada</h1>
        <p className="text-gray-400 mb-10 max-w-md">
          La página que buscás no existe o fue eliminada. Podés volver al inicio o explorar nuestras propiedades.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="border border-white/20 text-gray-400 hover:border-rose-500 hover:text-rose-400 px-6 py-3 rounded-lg font-semibold transition"
          >
            ← Volver atrás
          </button>
          <Link href="/" className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold transition">
            Ir al inicio
          </Link>
          <Link
            href="/propiedades"
            className="border border-rose-500 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            Ver propiedades
          </Link>
        </div>
      </div>
    </div>
  );
}
