import Link from "next/link";

export const metadata = {
  title: "Prensa | Catalan Propiedades",
  description: "Catalan Propiedades en los medios. Coberturas, entrevistas y apariciones.",
};

const gridStyle = {
  backgroundImage: `linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)`,
  backgroundSize: "48px 48px",
};

const pressReleases = [
  { id: 1, title: "Catalan Propiedades expande su presencia en la Patagonia", excerpt: "La firma inmobiliaria anuncia nueva sede en San Martín de los Andes.", date: "15 Mar 2026", source: "El Cronista" },
  { id: 2, title: "El mercado inmobiliario en el sur de Argentina", excerpt: "Milton Catalan explica por qué la Patagonia se convirtió en destino favorito.", date: "10 Mar 2026", source: "La Nación" },
  { id: 3, title: "Nueva plataforma digital para invertir en propiedades", excerpt: "Herramienta tecnológica permite gestionar inversiones desde cualquier lugar.", date: "5 Mar 2026", source: "Ámbito" },
  { id: 4, title: "Crecimiento del 200% en la Patagonia", excerpt: "El mercado inmobiliario patagónico lidera el crecimiento en Argentina.", date: "28 Feb 2026", source: "Forbes" },
  { id: 5, title: "Alianza estratégica con bancos locales", excerpt: "Nueva línea de financiamiento hipotecario exclusiva para inversores.", date: "20 Feb 2026", source: "Bloomberg" },
  { id: 6, title: "Premio a la excelencia en servicio al cliente", excerpt: "Reconocimiento provincial al mejor servicio del sector inmobiliario.", date: "15 Feb 2026", source: "Revista Gestión" },
  { id: 7, title: "Entrevista: El futuro de la inversión inmobiliaria", excerpt: "Análisis profundo sobre las tendencias del mercado patagónico.", date: "12 Feb 2026", source: "Clarín" },
  { id: 8, title: "Cómo afectan las nuevas políticas al mercado", excerpt: "Impacto de regulaciones en el sector inmobiliario sureño.", date: "8 Feb 2026", source: "La Nación" },
];

export default function PrensaPage() {
  return (
    <div className="min-h-screen bg-white font-dm">
      <section className="relative overflow-hidden pt-24 pb-14 bg-[#0A0F1C]" style={gridStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-transparent to-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-rose-400 text-xs font-semibold tracking-widest uppercase">Prensa</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 font-jakarta">
            Catalan Propiedades en los medios
          </h1>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            Coberturas, entrevistas y apariciones en medios de comunicación.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-900">Destacado</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Link href="/prensa/1" className="group block">
              <div className="relative h-80 lg:h-96 overflow-hidden rounded-2xl mb-5">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"
                  alt="Prensa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800 mb-3 inline-block">
                    Negocios
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 font-jakarta">
                    Catalan Propiedades expande su presencia en la Patagonia
                  </h2>
                  <p className="mt-2 text-gray-600">El Cronista</p>
                </div>
              </div>
            </Link>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-900">Últimas</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-6">
              {pressReleases.slice(1, 5).map((release) => (
                <Link key={release.id} href={`/prensa/${release.id}`} className="group block">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-rose-500">{release.source}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{release.date}</span>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-rose-500 transition-colors font-jakarta">
                    {release.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-medium text-gray-900">Coberturas</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pressReleases.slice(0, 8).map((release) => (
              <div key={release.id} className="group block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-900">{release.source}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-rose-500 transition-colors font-jakarta leading-snug">
                  {release.title}
                </h3>
                <p className="mt-2 text-xs text-gray-400">{release.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 font-jakarta">
              ¿Sos periodista?
            </h2>
            <p className="mt-2 text-gray-500 mb-6">
              Contactanos para consultas de prensa y materiales.
            </p>
            <Link
              href="/contacto"
              className="inline-flex px-6 py-3 bg-rose-600 text-white font-medium rounded-full hover:bg-rose-500 transition-colors"
            >
              Contacto de Prensa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
