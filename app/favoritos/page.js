"use client";
import { useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { properties } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
import { WA_URL } from "@/config";

export default function FavoritosPage() {
  const { favorites, toggle } = useFavorites();
  const [sortBy, setSortBy] = useState("default");
  const [compareIds, setCompareIds] = useState([]);

  const favoriteProperties = properties
    .filter((p) => favorites.includes(p.id))
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "roi-desc") return (b.roi || 0) - (a.roi || 0);
      return 0;
    });

  const avgPrice = (() => {
    const withPrice = favoriteProperties.filter((p) => p.price);
    if (!withPrice.length) return null;
    return Math.round(withPrice.reduce((sum, p) => sum + p.price, 0) / withPrice.length);
  })();

  const avgROI = (() => {
    const withRoi = favoriteProperties.filter((p) => p.roi);
    if (!withRoi.length) return null;
    return (withRoi.reduce((sum, p) => sum + p.roi, 0) / withRoi.length).toFixed(1);
  })();

  const toggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareProperties = properties.filter((p) => compareIds.includes(p.id));

  const waMessage = encodeURIComponent(
    `Hola Milton, guardé ${favoriteProperties.length} propiedad${favoriteProperties.length !== 1 ? "es" : ""} en favoritos y me gustaría consultarte. ¿Podemos hablar?`
  );

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-white relative overflow-hidden pt-24 pb-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Favoritos</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 font-jakarta">Mis favoritos</h1>
          <p className="text-gray-500 text-sm mt-2">
            {favoriteProperties.length === 0
              ? "Todavía no guardaste ninguna propiedad."
              : `${favoriteProperties.length} propiedad${favoriteProperties.length !== 1 ? "es" : ""} guardada${favoriteProperties.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        {favoriteProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-200 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-400 text-lg mb-6">Dale corazón a las propiedades que te interesen para verlas acá.</p>
            <Link href="/propiedades" className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-700 transition">
              Ver propiedades
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Propiedades guardadas</p>
                <p className="text-2xl font-bold text-gray-900">{favoriteProperties.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Precio promedio</p>
                <p className="text-2xl font-bold text-gray-900">{avgPrice ? `USD ${avgPrice.toLocaleString()}` : "—"}</p>
              </div>
              {avgROI && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">ROI promedio</p>
                  <p className="text-2xl font-bold text-green-600">{avgROI}%</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 rounded-2xl bg-primary-500/5 border border-primary-500/20">
              <div>
                <p className="font-semibold text-gray-800">
                  Tenés {favoriteProperties.length} propiedad{favoriteProperties.length !== 1 ? "es" : ""} guardada{favoriteProperties.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">Consultá con Milton y encontrá la ideal para vos.</p>
              </div>
              <a
                href={`${WA_URL}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-full transition whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar por WhatsApp
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <p className="text-sm text-gray-400">
                {compareIds.length === 0 ? "Seleccioná hasta 3 propiedades para comparar" : compareIds.length === 1 ? "Seleccioná 1 más para ver la comparación" : `Comparando ${compareIds.length} propiedades`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-500 bg-white"
              >
                <option value="default">Ordenar</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="roi-desc">Mayor ROI</option>
              </select>
            </div>

            {compareIds.length >= 2 && (
              <div className="mb-10 overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-semibold text-gray-500 w-28">Comparar</th>
                      {compareProperties.map((p) => (
                        <th key={p.id} className="text-left px-4 py-3 font-semibold text-gray-800 min-w-[180px]">
                          <div className="flex items-start justify-between gap-2">
                            <span className="line-clamp-2 leading-tight">{p.title}</span>
                            <button onClick={() => toggleCompare(p.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5" aria-label="Quitar de comparación">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Precio", render: (p) => p.modalidad === "alquiler_permanente" ? `$${p.precioAlquilerARS?.toLocaleString("es-AR")}/mes` : `USD ${p.price?.toLocaleString()}` },
                      { label: "Tipo", render: (p) => p.type },
                      { label: "Ubicación", render: (p) => p.location },
                      { label: "Área", render: (p) => `${p.area} m²` },
                      { label: "Habitaciones", render: (p) => p.bedrooms },
                      { label: "Baños", render: (p) => p.bathrooms },
                      { label: "ROI estimado", render: (p) => (p.roi ? `~${p.roi}%` : "—"), highlight: true },
                    ].map(({ label, render, highlight }) => (
                      <tr key={label} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 text-gray-400 font-medium bg-gray-50/50">{label}</td>
                        {compareProperties.map((p) => {
                          const val = render(p);
                          const best = highlight && compareProperties.reduce((max, cp) => ((cp.roi || 0) > (max.roi || 0) ? cp : max), compareProperties[0]).id === p.id;
                          return (
                            <td key={p.id} className={`px-4 py-3 font-medium ${best ? "text-green-600" : "text-gray-700"}`}>
                              {val}
                              {best && <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">mejor</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((property) => (
                <div key={property.id} className="flex flex-col gap-2">
                  <div className="relative">
                    <PropertyCard property={property} />
                    <label
                      className={`absolute bottom-[104px] left-3 flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none px-2.5 py-1 rounded-full border transition ${
                        compareIds.includes(property.id)
                          ? "bg-primary-500 text-white border-primary-500"
                          : compareIds.length >= 3 && !compareIds.includes(property.id)
                          ? "bg-white/90 text-gray-300 border-gray-200 cursor-not-allowed"
                          : "bg-white/90 text-gray-600 border-gray-200 hover:border-primary-500 hover:text-primary-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={compareIds.includes(property.id)}
                        onChange={() => toggleCompare(property.id)}
                        disabled={compareIds.length >= 3 && !compareIds.includes(property.id)}
                      />
                      {compareIds.includes(property.id) ? "✓ Comparando" : "Comparar"}
                    </label>
                  </div>
                  <button onClick={() => toggle(property.id)} className="text-xs text-gray-400 hover:text-primary-500 font-medium transition text-center py-1">
                    ✕ Quitar de favoritos
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
