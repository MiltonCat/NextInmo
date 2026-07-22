"use client";
import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/hooks/useFavorites";
import { getPropertySlug } from "@/data/properties";

function PropertyCard({ property }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(property.id);

  const isAlquiler = property.modalidad === "alquiler_permanente";
  const isUnavailable = property.vendida || property.noDisponible || property.status === "no_disponible";
  const isFeatured = [5, 6, 107, 108, 109].includes(Number(property.id));

  const operationLabel = {
    venta: "Venta",
    alquiler: "Alquiler permanente",
    ambas: "Venta y Alquiler",
  };

  const operationColor = {
    venta: "bg-green-100 text-green-800",
    alquiler: "bg-purple-100 text-purple-800",
    ambas: "bg-rose-600 text-white",
  };

  const TYPE_EMOJI = {
    "Casa": "🏡",
    "Departamento": "🏢",
    "Monoambiente": "🏢",
    "Lote": "🏔️",
    "Cabaña": "🏕️",
    "Cabañas": "🏕️",
    "PH": "🏘️",
  };
  const typeEmoji = TYPE_EMOJI[property.type] || "🏠";

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(property.id);
  };

  const cardClass = "group bg-white rounded-lg shadow-md overflow-hidden transition-shadow block";
  const cardContent = (
    <>
      <div className="relative h-48">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-500 ${isUnavailable ? "brightness-50 grayscale" : "group-hover:scale-[1.02]"} ${property.alquilada ? "brightness-50" : property.reservada ? "brightness-75" : ""}`}
        />
        {property.vendida ? (
          <span className="absolute inset-0 flex items-center justify-center text-xl font-black tracking-[0.2em] text-white bg-black/25">
            VENDIDA
          </span>
        ) : isUnavailable ? (
          <span className="absolute inset-0 flex items-center justify-center text-xl font-black tracking-[0.2em] text-white bg-black/30">
            NO DISPONIBLE
          </span>
        ) : (
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {isFeatured && (
              <span className="inline-flex items-center rounded-full bg-rose-600 px-2 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm">
                DESTACADA
              </span>
            )}
            {property.alquilada ? (
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-800 text-white tracking-wide">
                ALQUILADA
              </span>
            ) : property.reservada ? (
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-600 text-white tracking-wide">
                RESERVADA
              </span>
            ) : (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${operationColor[property.operation]}`}>
                {operationLabel[property.operation]}
              </span>
            )}
          </div>
        )}
        {property.roi && !isUnavailable && (
          <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full shadow text-green-700">
            ROI ~{property.roi}%
          </span>
        )}
        {!isUnavailable && (
          <button
            onClick={(e) => { e.preventDefault(); handleToggle(e); }}
            aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              padding: 6,
              borderRadius: "9999px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{
                width: 20,
                height: 20,
                display: "block",
              }}
              fill={fav ? "#E8325A" : "none"}
              stroke={fav ? "#E8325A" : "#9ca3af"}
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className={`text-lg font-semibold leading-snug flex-1 min-w-0 ${isUnavailable ? "text-gray-500" : "text-gray-800"}`}>{property.title}</h3>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold flex-shrink-0 whitespace-nowrap">
            <span>{typeEmoji}</span>
            <span>{property.type}</span>
          </span>
        </div>
        <p className={`text-sm mb-2 ${isUnavailable ? "text-gray-400" : "text-gray-500"}`}>{property.location}</p>

        {isAlquiler ? (
          <div className="mb-3">
            <p className={`text-xl font-bold ${isUnavailable ? "text-gray-500" : "text-rose-600"}`}>
              $ {property.precioAlquilerARS?.toLocaleString("es-AR")}
              <span className="text-sm font-normal text-gray-500"> /mes</span>
            </p>
            <p className="text-xs text-green-600 font-medium mt-0.5">Disponible: {property.disponibleDesde}</p>
          </div>
        ) : (
          <div className="mb-3">
            {(property.operation === "venta" || property.operation === "ambas") && (
              <p className={`text-xl font-bold ${isUnavailable ? "text-gray-500" : "text-rose-600"}`}>
                USD {property.price.toLocaleString('es-AR')}
              </p>
            )}
            {(property.operation === "alquiler" || property.operation === "ambas") && (
              <p className={`text-xl font-bold ${isUnavailable ? "text-gray-500" : "text-rose-600"}`}>
                ${property.rentPrice?.toLocaleString('es-AR')}
                <span className="text-sm font-normal text-gray-500"> /mes</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-3">
          {property.bedrooms > 0 && <span className="bg-gray-100 px-2 py-1 rounded">{property.bedrooms} dorm.</span>}
          {property.bathrooms > 0 && <span className="bg-gray-100 px-2 py-1 rounded">{property.bathrooms} baños</span>}
          {property.area > 0 && <span className="bg-gray-100 px-2 py-1 rounded">{property.area} m²</span>}
        </div>
        {property.features?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feature, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{feature}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (isUnavailable) {
    return (
      <article className={`${cardClass} cursor-default opacity-90`} aria-label={`${property.title} — No disponible`}>
        {cardContent}
      </article>
    );
  }

  return (
    <Link href={`/propiedades/${getPropertySlug(property)}`} className={`${cardClass} hover:shadow-xl`}>
      {cardContent}
    </Link>
  );
}

export default memo(PropertyCard);
