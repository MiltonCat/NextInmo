import Link from "next/link";

export const metadata = {
  title: "Blog | Catalán Propiedades",
  description: "Artículos sobre inversión inmobiliaria, mercado en la Patagonia y guías para comprar o alquilar en San Martín de los Andes.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-24 pb-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">Blog</p>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Inversión y mercado inmobiliario</h1>
          <p className="text-gray-500 text-base max-w-xl">Análisis, guías y tendencias del mercado inmobiliario en San Martín de los Andes y la Patagonia.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>

        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold tracking-widest uppercase mb-5">
          Próximamente
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 max-w-lg leading-tight">
          Estamos preparando contenido exclusivo sobre el mercado de SMA
        </h2>

        <p className="text-gray-500 text-base max-w-md mb-3 leading-relaxed">
          Próximamente publicaremos análisis del mercado, guías de compra, evolución del valor del m² y tendencias de inversión en San Martín de los Andes.
        </p>

        <p className="text-gray-400 text-sm mb-10">
          Mientras tanto, podés consultar directamente con nosotros.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/contacto"
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm"
          >
            Contactanos
          </Link>
          <Link
            href="/inversiones"
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-gray-200"
          >
            Ver análisis de mercado
          </Link>
        </div>
      </div>
    </div>
  );
}
