"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { properties } from "@/data/properties";

function AlquileresContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProperties = properties
    .filter((p) => {
      if (p.modalidad !== "alquiler_permanente") return false;
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return (a.precioAlquilerARS || 0) - (b.precioAlquilerARS || 0);
      if (sortBy === "price-desc") return (b.precioAlquilerARS || 0) - (a.precioAlquilerARS || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-white relative overflow-hidden pt-24 pb-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Alquileres</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 font-jakarta">Alquileres permanentes</h1>
          <p className="text-gray-500 text-sm mt-2">San Martín de los Andes · Patagonia Argentina</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Propiedades en alquiler
            <span className="text-lg font-normal text-gray-500 ml-2">({filteredProperties.length})</span>
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-500 bg-white"
          >
            <option value="default">Ordenar</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, ubicación o tipo..."
            className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No se encontraron propiedades en alquiler.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlquileresPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-24 flex items-center justify-center"><div className="text-gray-400">Cargando...</div></div>}>
      <AlquileresContent />
    </Suspense>
  );
}
