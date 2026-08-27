"use client";
import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/hooks/useFavorites";
import { getPropertySlug } from "@/data/properties";

// Criterio visual de la tarjeta (estilo Airbnb):
//
// 1. Sin sombra ni borde. La separación entre tarjetas la hace el aire, no una
//    caja. La foto con esquinas redondeadas es el único elemento con forma.
// 2. La operación va siempre sobre la foto para que en una selección mixta se
//    distinga de inmediato una venta de un alquiler permanente. Los estados
//    (destacada, vendida, alquilada, reservada) aparecen como una segunda señal.
// 3. Nada de recuadros grises alrededor de cada dato: una línea de texto con
//    separadores "·". Misma información, mucho menos ruido.
// 4. Un solo color fuerte en toda la tarjeta —el corazón cuando está activo—.
//    El precio va en negro: es el dato más importante y no necesita color para
//    destacarse, le alcanza con el peso tipográfico.
function PropertyCard({ property }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(property.id);

  const isAlquiler = property.modalidad === "alquiler_permanente";
  const isUnavailable = property.vendida || property.noDisponible || property.status === "no_disponible";
  const isFeatured = [5, 6, 107, 108, 109].includes(Number(property.id));

  const operationLabel = {
    venta: "Venta",
    alquiler: "Alquiler permanente",
    ambas: "Venta y alquiler",
  };

  const categoryLabel = isAlquiler
    ? "Alquiler permanente"
    : `${property.type || "Propiedad"} en venta`;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wasFavorite = fav;
    toggle(property.id);
    if (!wasFavorite) {
      window.dispatchEvent(new CustomEvent("favorite-added"));
    }
  };

  // Operación, tipo y medidas en una sola línea. El filter saca los que no
  // aplican (un lote no tiene dormitorios) sin dejar separadores huérfanos.
  const specs = [
    operationLabel[property.operation],
    property.type,
    property.bedrooms > 0 ? `${property.bedrooms} dorm` : null,
    property.bathrooms > 0 ? `${property.bathrooms} baños` : null,
    property.area > 0 ? `${property.area} m²` : null,
  ].filter(Boolean).join(" · ");

  const cardClass = "group block";

  const cardContent = (
    <>
      {/* 16:10 y no 4:3: en el listado entra bastante más catálogo por
          pantallazo, sobre todo en celular donde va una sola columna. */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-500 ${isUnavailable ? "brightness-50 grayscale" : "group-hover:scale-[1.03]"} ${property.alquilada ? "brightness-50" : property.reservada ? "brightness-75" : ""}`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
          {categoryLabel}
        </span>
        {property.vendida ? (
          <span className="absolute inset-0 flex items-center justify-center text-xl font-black tracking-[0.2em] text-white bg-black/25">
            VENDIDA
          </span>
        ) : isUnavailable ? (
          <span className="absolute inset-0 flex items-center justify-center text-xl font-black tracking-[0.2em] text-white bg-black/30">
            NO DISPONIBLE
          </span>
        ) : (
          (isFeatured || property.alquilada || property.reservada) && (
            <div className="absolute left-3 top-11 flex flex-col items-start gap-1.5">
              {property.alquilada ? (
                <span className="rounded-full bg-gray-900/85 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Alquilada
                </span>
              ) : property.reservada ? (
                <span className="rounded-full bg-gray-900/85 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Reservada
                </span>
              ) : (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-900 shadow-sm">
                  Destacada
                </span>
              )}
            </div>
          )
        )}
      </div>

      <div className="pt-3">
        {/* El ROI va a la derecha del título, en el lugar donde Airbnb pone la
            calificación: es el dato de comparación rápida entre propiedades. */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={`text-[15px] font-semibold leading-snug line-clamp-2 ${isUnavailable ? "text-gray-500" : "text-gray-900"}`}>
            {property.title}
          </h3>
          {property.roi && !isUnavailable && (
            <span className="shrink-0 text-sm text-gray-500 whitespace-nowrap">ROI {property.roi}%</span>
          )}
        </div>

        <p className={`mt-1 text-sm ${isUnavailable ? "text-gray-400" : "text-gray-500"}`}>{property.location}</p>
        <p className={`text-sm ${isUnavailable ? "text-gray-400" : "text-gray-500"}`}>{specs}</p>

        {property.features?.length > 0 && (
          <p className="text-sm text-gray-500 truncate">{property.features.slice(0, 3).join(", ")}</p>
        )}

        {isAlquiler ? (
          <p className={`mt-2 text-[15px] ${isUnavailable ? "text-gray-500" : "text-gray-900"}`}>
            <span className="font-semibold">$ {property.precioAlquilerARS?.toLocaleString("es-AR")}</span>
            <span className="text-gray-500"> /mes</span>
            {property.disponibleDesde && (
              <span className="text-gray-500"> · desde {property.disponibleDesde}</span>
            )}
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
            {(property.operation === "venta" || property.operation === "ambas") && (
              <p className={`text-[15px] font-semibold ${isUnavailable ? "text-gray-500" : "text-gray-900"}`}>
                USD {property.price?.toLocaleString("es-AR")}
              </p>
            )}
            {(property.operation === "alquiler" || property.operation === "ambas") && property.rentPrice && (
              <p className={`text-[15px] ${isUnavailable ? "text-gray-500" : "text-gray-900"}`}>
                <span className="font-semibold">$ {property.rentPrice.toLocaleString("es-AR")}</span>
                <span className="text-gray-500"> /mes</span>
              </p>
            )}
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

  // El corazón va FUERA del <Link>, no adentro. Anidado, Next 16 navega a la
  // ficha antes de que el preventDefault del botón llegue a tiempo: el click
  // abría la propiedad en vez de guardarla, y los favoritos no se guardaban.
  // Como hermano del enlace, el botón recibe su propio click sin competencia.
  return (
    <div className="relative h-full">
      <Link href={`/propiedades/${getPropertySlug(property)}`} className={`${cardClass} h-full`}>
        {cardContent}
      </Link>
      {/* Sin círculo blanco detrás: el corazón va calado sobre la foto, con un
          contorno oscuro que lo mantiene legible sobre fotos claras. */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
        className="absolute top-2.5 right-2.5 z-10 cursor-pointer p-1.5 transition-transform hover:scale-110"
      >
        <svg
          viewBox="0 0 24 24"
          className="block h-6 w-6"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }}
          fill={fav ? "#E8325A" : "rgba(0,0,0,0.35)"}
          stroke="#ffffff"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>
    </div>
  );
}

export default memo(PropertyCard);
