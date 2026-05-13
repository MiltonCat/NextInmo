"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { properties } from "@/data/properties";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), { ssr: false });

function PropertiesContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [filter, setFilter] = useState(searchParams.get("type") || "Todos");
  const [priceRange, setPriceRange] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [modalidadTab, setModalidadTab] = useState(
    pathname === "/alquileres" ? "alquiler_permanente" : (searchParams.get("modalidad") || "venta")
  );

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) setFilter(typeParam);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const filteredProperties = properties.filter((property) => {
    if (modalidadTab === "alquiler_permanente" && property.modalidad !== "alquiler_permanente") return false;
    if (modalidadTab === "venta" && property.modalidad === "alquiler_permanente") return false;

    const searchParam = searchParams.get("search");
    const operation = searchParams.get("operation");

    const searchMatch = !searchParam ||
      property.title.toLowerCase().includes(searchParam.toLowerCase()) ||
      property.location.toLowerCase().includes(searchParam.toLowerCase()) ||
      property.type.toLowerCase().includes(searchParam.toLowerCase());

    const typeMatch = filter === "Todos" || property.type.toLowerCase() === filter.toLowerCase();

    const priceMinParam = searchParams.get("priceMin");
    const priceMaxParam = searchParams.get("priceMax");
    const bedroomsParam = searchParams.get("bedrooms");
    const metersParam = searchParams.get("meters");

    const priceMatch =
      priceRange === "Todos" ||
      (priceRange === "Menos de 300000" && property.price < 300000) ||
      (priceRange === "300000-500000" && property.price >= 300000 && property.price <= 500000) ||
      (priceRange === "Más de 500000" && property.price > 500000);

    const minPriceMatch = !priceMinParam || property.price >= parseInt(priceMinParam);
    const maxPriceMatch = !priceMaxParam || property.price <= parseInt(priceMaxParam);
    const bedroomsMatch = !bedroomsParam || property.bedrooms >= parseInt(bedroomsParam);
    const metersMatch = !metersParam || property.area >= parseInt(metersParam);

    const poolParam = searchParams.get("pool");
    const garageParam = searchParams.get("garage");
    const metersMinParam = searchParams.get("metersMin");

    const poolMatch = !poolParam || (poolParam === "si" ? property.features?.includes("Piscina") : !property.features?.includes("Piscina"));
    const garageMatch = !garageParam || (garageParam === "si" ? property.features?.includes("Garaje") : !property.features?.includes("Garaje"));
    const metersMinMatch = !metersMinParam || property.area >= parseInt(metersMinParam);

    const operationMatch = !operation || property.operation === "ambas" || property.operation === operation;

    return searchMatch && typeMatch && priceMatch && minPriceMatch && maxPriceMatch && bedroomsMatch && metersMatch && operationMatch && poolMatch && garageMatch && metersMinMatch;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  const clearFilters = () => {
    setFilter("Todos");
    setPriceRange("Todos");
    setSearchQuery("");
    router.push(pathname);
  };

  const updateSearch = (value) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFiltersCount = [
    searchParams.get("search"),
    searchParams.get("type"),
    searchParams.get("priceMin"),
    searchParams.get("priceMax"),
    searchParams.get("bedrooms"),
    searchParams.get("meters"),
    searchParams.get("operation"),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-white relative overflow-hidden pt-24 pb-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Propiedades</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 font-jakarta">Encontrá tu propiedad ideal</h1>
          <p className="text-gray-500 text-sm mt-2">San Martín de los Andes · Patagonia Argentina</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: "venta", label: "Comprar" },
            { key: "alquiler_permanente", label: "Alquiler permanente" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setModalidadTab(tab.key); setFilter("Todos"); clearFilters(); }}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                modalidadTab === tab.key
                  ? "border-rose-500 text-rose-500"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Nuestras Propiedades
            {(searchQuery || activeFiltersCount > 0) && (
              <span className="text-lg font-normal text-gray-500 ml-2">
                ({filteredProperties.length} resultados)
              </span>
            )}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-500 bg-white"
            >
              <option value="default">Ordenar</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === "list" ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === "map" ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Mapa
            </button>
          </div>
        </div>

        {(searchQuery || activeFiltersCount > 0) && (
          <button onClick={clearFilters} className="text-sm text-rose-500 hover:text-rose-600 font-medium mb-4">
            ← Limpiar búsqueda
          </button>
        )}

        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Buscar por nombre, ubicación o tipo..."
            className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {viewMode === "map" ? (
          <div className="h-[500px] rounded-lg overflow-hidden border">
            <PropertyMap properties={filteredProperties} />
          </div>
        ) : loading ? (
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
            <p className="text-gray-500 text-lg mb-4">No se encontraron propiedades con los filtros seleccionados.</p>
            <button onClick={clearFilters} className="text-rose-500 hover:text-rose-600 font-medium">
              Limpiar filtros y ver todas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-24 flex items-center justify-center"><div className="text-gray-400">Cargando...</div></div>}>
      <PropertiesContent />
    </Suspense>
  );
}
