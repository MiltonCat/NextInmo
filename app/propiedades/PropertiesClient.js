"use client";
import { useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), { ssr: false });

const ALIASES = {
  depto: "departamento", deptos: "departamento",
  dpto: "departamento",  dptos: "departamento",
  cabana: "cabaña",      cabanas: "cabaña",
  ph: "ph",
  casa: "casa",          casas: "casa",
  lote: "lote",          lotes: "lote",
  mono: "monoambiente",  monoambiente: "monoambiente",
};

const normalize = (v) =>
  v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const resolveAlias = (raw) => ALIASES[normalize(raw)] || normalize(raw);

function PropertiesContent({ properties = [], tipoFiltro, tipoLabel }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const paramsKey = searchParams.toString();
  const paramFilter = searchParams.get("type") || "Todos";
  const paramSearchQuery = searchParams.get("search") || "";

  const [filterState, setFilterState] = useState({ paramsKey, value: paramFilter });
  const [priceRange, setPriceRange] = useState("Todos");
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("default");
  const [searchState, setSearchState] = useState({ paramsKey, value: paramSearchQuery });
  const [modalidadTab, setModalidadTab] = useState(
    pathname === "/alquileres" ? "alquiler_permanente" : "venta"
  );

  const filter = filterState.paramsKey === paramsKey ? filterState.value : paramFilter;
  const searchQuery = searchState.paramsKey === paramsKey ? searchState.value : paramSearchQuery;
  const setFilter = (value) => setFilterState({ paramsKey, value });
  const setSearchQuery = (value) => setSearchState({ paramsKey, value });

  const filteredProperties = properties.filter((property) => {
    if (tipoFiltro && !tipoFiltro.includes(property.type)) return false;
    if (modalidadTab === "alquiler_permanente" && property.modalidad !== "alquiler_permanente") return false;
    if (modalidadTab === "venta" && property.modalidad === "alquiler_permanente") return false;

    const operation = searchParams.get("operation");

    const raw = searchQuery.trim();
    const q   = normalize(raw);
    const exp = resolveAlias(raw);

    const searchMatch = !q ||
      normalize(property.title).includes(q) ||
      normalize(property.location).includes(q) ||
      normalize(property.type).includes(q) ||
      normalize(property.type).includes(exp) ||
      normalize(property.description || "").includes(q) ||
      (property.features || []).some(f => normalize(f).includes(q));

    const normFilter = normalize(filter);
    const normType   = normalize(property.type);
    const typeMatch = filter === "Todos" ||
      normType === normFilter ||
      (normFilter === "departamento" && normType === "monoambiente") ||
      (normFilter === "cabaña" && (normType === "cabanas" || normType === "ph"));

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

  const updateSearch = (value) => setSearchQuery(value);

  const hasActiveFilters = searchQuery.trim() !== "" || filter !== "Todos";

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-white relative overflow-hidden pt-8 pb-10 md:pt-24 md:pb-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center lg:pt-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Propiedades</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 font-jakarta leading-tight md:leading-[1.1]">
                {tipoLabel ? `${tipoLabel} en San Martín de los Andes` : <>Encontrá tu lugar<br />en el sur</>}
              </h1>
              <p className="text-gray-500 text-base mt-3 max-w-md leading-relaxed">
                {tipoLabel ? `Asesoría personalizada y datos reales del mercado local` : "Del centro a la montaña · De la primera casa a la inversión soñada"}
              </p>
            </div>

            {/* Antes esta tarjeta era un degradado rosa con un halo borroso y
                un emoji, justo al lado de la grilla de propiedades. Ahora es
                una caja blanca con borde: el color queda para el texto del
                enlace, que es lo único en lo que hay que hacer clic. */}
            <Link
              href="/tasacion"
              className="group rounded-2xl border border-gray-200 p-5 lg:w-[320px] transition-colors hover:border-gray-400"
            >
              <p className="text-xs font-semibold text-gray-500 mb-1">¿Tenés una propiedad?</p>
              <p className="text-sm font-semibold text-gray-900 leading-snug">Tasación gratis con datos reales del mercado</p>
              <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-rose-600">
                Pedir tasación
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="sticky top-[104px] z-30 -mx-4 mb-6 border-y border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden">
          <div className="mb-3 grid grid-cols-2 gap-2">
            {[
              { key: "venta", label: "Comprar" },
              { key: "alquiler_permanente", label: "Alquilar" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setModalidadTab(tab.key); setFilter("Todos"); clearFilters(); }}
                className={`min-h-11 rounded-xl border px-3 text-sm font-bold transition-colors ${
                  modalidadTab === tab.key
                    ? "border-rose-500 bg-rose-50 text-rose-600"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Buscar por barrio, tipo o nombre..."
            className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
          />
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-rose-500"
            >
              <option value="default">Ordenar</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
            <button
              onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
              className="min-h-11 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white"
            >
              {viewMode === "map" ? "Lista" : "Mapa"}
            </button>
          </div>
        </div>

        <div className="hidden md:flex gap-2 mb-6 border-b border-gray-200">
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Nuestras Propiedades
            {hasActiveFilters && (
              <span className="block text-sm font-normal text-gray-500 md:ml-2 md:inline md:text-lg">
                ({filteredProperties.length} resultados)
              </span>
            )}
          </h2>
          <div className="hidden md:flex gap-2 flex-wrap">
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

        {hasActiveFilters && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl">
            <span className="text-sm text-rose-700 font-medium flex-1">
              {filteredProperties.length === 0
                ? "Sin resultados"
                : `${filteredProperties.length} propiedad${filteredProperties.length !== 1 ? "es" : ""}`}
              {searchQuery && <span> para <strong>“{searchQuery}”</strong></span>}
              {filter !== "Todos" && <span> · Tipo: <strong>{filter}</strong></span>}
            </span>
            <button onClick={clearFilters} className="text-xs text-rose-500 hover:text-rose-700 font-semibold whitespace-nowrap">
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="hidden md:block mb-6">
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

        {/* Banner Guía de Barrios */}
        <div className="mt-14 flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-gray-50 border border-gray-200 px-8 py-7">
          <div className="flex-1">
            <p className="text-xs font-bold tracking-widest uppercase text-rose-600 mb-1">Guía de Barrios</p>
            <h3 className="text-base font-black text-gray-900">¿Querés saber cómo es vivir en cada zona antes de decidir?</h3>
            <p className="text-gray-500 text-sm mt-1">Leé las experiencias de vecinos reales o compartí la tuya. Datos que ningún portal tiene.</p>
          </div>
          <Link
            href="/experiencia-barrio"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Ver guía de barrios
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesClient({ properties = [], tipoFiltro, tipoLabel } = {}) {
  return (
    <PropertiesContent properties={properties} tipoFiltro={tipoFiltro} tipoLabel={tipoLabel} />
  );
}
