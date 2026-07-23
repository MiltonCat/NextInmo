"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Lightbox from "@/components/Lightbox";
import PhotoTour from "@/components/PhotoTour";
import VisitScheduler from "@/components/VisitScheduler";
import PropertyInquiry from "@/components/PropertyInquiry";
import PropertySheet from "@/components/PropertySheet";
import SimuladorCuota from "@/components/SimuladorCuota";
import { useFavorites } from "@/hooks/useFavorites";
import { useAnalytics } from "@/hooks/useAnalytics";
import { propertyWhatsappMessage, whatsappUrl } from "@/lib/whatsapp";
import { getPropertyDescriptionEmoji, splitPropertyDescription } from "@/lib/propertyDescription";

function waLink(property, message = "") {
  return whatsappUrl(message || propertyWhatsappMessage(property));
}

// Ícono de grilla 2x2, igual al que usa Airbnb en su botón "Mostrar todas las fotos".
function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <rect x="0" y="0" width="6.5" height="6.5" rx="1" />
      <rect x="9.5" y="0" width="6.5" height="6.5" rx="1" />
      <rect x="0" y="9.5" width="6.5" height="6.5" rx="1" />
      <rect x="9.5" y="9.5" width="6.5" height="6.5" rx="1" />
    </svg>
  );
}

export default function PropertyDetailClient({ property }) {
  const [tourOpen, setTourOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [inquiry, setInquiry] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const { isFavorite, toggle } = useFavorites();
  const { trackPropertyView, trackPropertyInquiry, trackFavoriteToggle, trackWhatsAppClick, trackPropertyShare } = useAnalytics();

  // Track property view on mount
  useEffect(() => {
    if (property) {
      trackPropertyView(property);
    }
  }, [property, trackPropertyView]);

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h2>
          <Link href="/propiedades" className="text-rose-600 hover:text-rose-500 underline transition-colors">
            Volver a propiedades
          </Link>
        </div>
      </div>
    );
  }

  // property.images ya viene armado por lib/properties.js (galería completa,
  // sin límite, cada foto como { url, category }); se usan solo las primeras
  // 5 como preview en la ficha.
  const allImages = property.images?.length
    ? property.images
    : [property.image, property.image1, property.image2, property.image3, property.image4]
        .filter(Boolean)
        .map((url) => ({ url, category: null }));
  const previewImages = allImages.slice(0, 5);
  // Mismo texto y estilo (ícono de grilla + pill blanca) que el botón de
  // Airbnb, sin el conteo entre paréntesis.
  const galleryButtonLabel = "Ver todas las fotos";
  const fav = isFavorite(property.id);
  const isAlquiler = property.modalidad === "alquiler_permanente";
  const isLot = /lote|terreno/i.test(property.type || "");

  const operationLabel = {
    venta: "Venta",
    alquiler: "Alquiler permanente",
    ambas: "Venta y Alquiler",
  };

  const handleShare = async () => {
    const url = window.location.href;
    const method = navigator.share ? 'native' : 'copy_link';
    trackPropertyShare(property, method);
    
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInquiry = () => {
    const msg = propertyWhatsappMessage(property, {
      note: inquiry,
      url: window.location.href,
    });
    
    trackPropertyInquiry(property, 'whatsapp');
    trackWhatsAppClick(property, 'property_detail');
    window.open(whatsappUrl(msg), "_blank");
  };

  // Etapa 2: grilla de preview → recorrido fotográfico agrupado por ambiente
  // (estilo Airbnb). Etapa 3: dentro del recorrido, click en una foto → foto
  // a pantalla completa una por una (el Lightbox de toda la vida).
  const openTour = () => setTourOpen(true);

  const openPhotoFromTour = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const mobilePriceLabel = isAlquiler
    ? `$ ${property.precioAlquilerARS?.toLocaleString("es-AR") || "-"}`
    : `USD ${property.price?.toLocaleString("es-AR") || "-"}`;
  const mobileActionLabel = property.alquilada
    ? "Opciones similares"
    : property.reservada
      ? "Consultar"
      : isAlquiler
        ? "Consultar"
        : "Me interesa";
  const descriptionText = property.description || "";
  const descriptionParagraphs = splitPropertyDescription(descriptionText);

  const handleMobilePrimaryAction = () => {
    if (isAlquiler || property.alquilada || property.reservada) {
      const message = propertyWhatsappMessage(property, {
        action: property.alquilada || property.reservada ? "similar" : "consultar",
        note: property.reservada ? "¿Sigue disponible o tenés algo similar?" : "",
        url: window.location.href,
      });
      trackPropertyInquiry(property, "whatsapp");
      trackWhatsAppClick(property, "property_detail_mobile");
      window.open(waLink(property, message), "_blank");
      return;
    }
    handleInquiry();
  };

  return (
    <div className="pb-6 lg:pb-0">
      {property.alquilada && (
        <div className="bg-gray-800 text-white text-center py-3 px-4">
          <span className="font-bold tracking-wide text-sm">PROPIEDAD ALQUILADA</span>
          <span className="text-gray-300 text-sm ml-2">— Esta propiedad ya no está disponible. Consultanos por opciones similares.</span>
        </div>
      )}
      {property.reservada && (
        <div className="bg-gray-600 text-white text-center py-3 px-4">
          <span className="font-bold tracking-wide text-sm">PROPIEDAD RESERVADA</span>
          <span className="text-gray-200 text-sm ml-2">— Esta propiedad está reservada. Consultanos por disponibilidad u opciones similares.</span>
        </div>
      )}
      {/* Header */}
      <section className="bg-white pt-5 pb-7 sm:pt-8 md:pt-24 md:pb-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/propiedades" className="hover:text-gray-900 transition-colors">Propiedades</Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">{property.title}</span>
          </nav>

          <Link href="/propiedades" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-500 mb-5 text-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a propiedades
          </Link>

          <div className="hidden sm:flex gap-2 mb-3">
            <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-200">{property.type}</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-200">{operationLabel[property.operation]}</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[1.7rem] sm:text-3xl font-bold text-gray-900 leading-tight break-words">{property.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{property.location}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:mt-1">
              <button
                onClick={() => {
                  const newFav = !fav;
                  toggle(property.id);
                  trackFavoriteToggle(property, newFav ? 'add' : 'remove');
                }}
                className="flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm transition"
                style={{ borderColor: fav ? "#6366f1" : "#d1d5db", color: fav ? "#818cf8" : "#6b7280" }}
                aria-label={fav ? "Quitar de favoritos" : "Guardar"}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill={fav ? "#818cf8" : "none"} stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span className="hidden sm:inline">{fav ? "Guardada" : "Guardar"}</span>
              </button>
              <button
                onClick={() => setShowSheet(true)}
                className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
                aria-label="Exportar ficha"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                </svg>
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 sm:px-6 sm:py-8 lg:px-8">

          {/* Gallery - desktop */}
          <div className="relative mb-8 hidden lg:grid grid-cols-4 grid-rows-2 gap-1 h-64 lg:h-80 overflow-hidden rounded-xl">
            <div className="col-span-2 row-span-2">
              <img src={previewImages[0]?.url} alt={property.title} fetchPriority="high" decoding="async" className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" onClick={openTour} />
            </div>
            {previewImages.slice(1, 5).map((image, index) => (
              <div key={index} className="col-span-1 row-span-1">
                <img
                  src={image?.url}
                  alt={`${property.title} - ${index + 2}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                  onClick={openTour}
                />
              </div>
            ))}
            <button
              onClick={openTour}
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg transition hover:bg-white"
            >
              <GridIcon />
              {galleryButtonLabel}
            </button>
          </div>

          {/* Gallery - mobile */}
          <div className="lg:hidden mb-6">
            <div className="overflow-x-auto flex gap-1 pb-2 snap-x snap-mandatory">
              {previewImages.map((img, idx) => (
                <div key={idx} className="flex-shrink-0 w-full snap-center">
                  <img src={img?.url} alt={`${property.title} - ${idx + 1}`} loading={idx > 0 ? "lazy" : "eager"} fetchPriority={idx === 0 ? "high" : "low"} decoding="async" className="w-full h-64 object-cover rounded-xl cursor-pointer" onClick={openTour} />
                </div>
              ))}
            </div>
            <button onClick={openTour} className="w-full mt-2 border border-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl text-sm inline-flex items-center justify-center gap-2">
              <GridIcon />
              {galleryButtonLabel}
            </button>
          </div>

          {/* Main layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-10 lg:items-start">

            {/* Sticky sidebar */}
            <div className="lg:col-span-1 lg:order-last mb-8 lg:mb-0 lg:mt-6 lg:sticky lg:top-[96px] lg:self-start lg:h-fit">
              <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                  {isAlquiler ? (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-rose-500">Alquiler mensual</p>
                        <p className="mt-1 text-3xl font-black text-gray-900 leading-none">$ {property.precioAlquilerARS?.toLocaleString("es-AR")}</p>
                        <p className="text-xs font-medium text-rose-700/80 mt-1">Acompaña la lectura de la ficha</p>
                      </div>
                      <div className="flex flex-col divide-y divide-gray-100 text-sm">
                        <div className="flex justify-between py-2.5">
                          <span className="text-gray-500">Disponible desde</span>
                          <span className="font-semibold text-green-600">{property.disponibleDesde}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                          <span className="text-gray-500">Mínimo</span>
                          <span className="text-gray-700">{property.mesesMinimos} meses</span>
                        </div>
                        {property.condiciones && (
                          <div className="flex justify-between py-2.5 gap-4">
                            <span className="text-gray-500 shrink-0">Condiciones</span>
                            <span className="text-gray-700 text-xs text-right">{property.condiciones}</span>
                          </div>
                        )}
                      </div>
                      {(property.bedrooms > 0 || property.bathrooms > 0 || property.area > 0) && (
                        <div className="grid grid-cols-3 gap-2">
                          {property.bedrooms > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.bedrooms}</p>
                              <p className="text-xs text-gray-500">Dorm.</p>
                            </div>
                          )}
                          {property.bathrooms > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.bathrooms}</p>
                              <p className="text-xs text-gray-500">Baños</p>
                            </div>
                          )}
                          {property.area > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.area}</p>
                              <p className="text-xs text-gray-500">m²</p>
                            </div>
                          )}
                        </div>
                      )}
                      {property.alquilada ? (
                        <a
                          href={waLink(property, propertyWhatsappMessage(property, { action: "similar" }))}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            trackPropertyInquiry(property, "whatsapp");
                            trackWhatsAppClick(property, "property_detail_similar");
                          }}
                          className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl text-center transition"
                        >
                          Consultar por opciones similares
                        </a>
                      ) : property.reservada ? (
                        <a
                          href={waLink(property, propertyWhatsappMessage(property, {
                            action: "similar",
                            note: "¿Sigue disponible o tenés algo similar?",
                          }))}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            trackPropertyInquiry(property, "whatsapp");
                            trackWhatsAppClick(property, "property_detail_reserved");
                          }}
                          className="block w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 rounded-xl text-center transition"
                        >
                          Consultar disponibilidad
                        </a>
                      ) : (
                        <a
                          href={waLink(property)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            trackPropertyInquiry(property, "whatsapp");
                            trackWhatsAppClick(property, "property_detail_rental");
                          }}
                          className="block w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl text-center transition"
                        >
                          Consultar disponibilidad
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-rose-500">Precio</p>
                        <p className="mt-1 text-3xl font-black text-gray-900 leading-none">USD {property.price?.toLocaleString("es-AR")}</p>
                        <p className="text-xs font-medium text-rose-700/80 mt-1">Acompaña la lectura de la ficha</p>
                      </div>
                      {property.roi && (
                        <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                          <span className="text-green-700 text-sm font-medium">ROI estimado</span>
                          <span className="text-green-700 font-bold text-lg">~{property.roi}%</span>
                        </div>
                      )}
                      {(property.bedrooms > 0 || property.bathrooms > 0 || property.area > 0) && (
                        <div className="grid grid-cols-3 gap-2">
                          {property.bedrooms > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.bedrooms}</p>
                              <p className="text-xs text-gray-500">Dorm.</p>
                            </div>
                          )}
                          {property.bathrooms > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.bathrooms}</p>
                              <p className="text-xs text-gray-500">Baños</p>
                            </div>
                          )}
                          {property.area > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.area}</p>
                              <p className="text-xs text-gray-500">m²</p>
                            </div>
                          )}
                        </div>
                      )}
                      <hr className="border-gray-100" />
                      <button
                        onClick={() => setShowInquiry(true)}
                        className="block w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl text-center transition"
                      >
                        Me interesa esta propiedad
                      </button>
                      <button
                        onClick={() => setShowScheduler(true)}
                        className="block w-full border border-gray-200 hover:border-rose-400 hover:text-rose-600 text-gray-700 font-semibold py-3 rounded-xl text-center transition"
                      >
                        Agendar visita
                      </button>
                    </div>
                  )}
                </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2">
              <section className="mb-8 pb-8 border-b border-gray-100">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-800">Descripción</h2>
                  <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-rose-700">
                    ✦ Lectura rápida
                  </span>
                </div>
                <div className="space-y-3 font-[family-name:var(--font-plus-jakarta)]">
                  {(descriptionParagraphs.length > 0 ? descriptionParagraphs : [descriptionText]).map((paragraph, index) => (
                    <div
                      key={`${index}-${paragraph.slice(0, 24)}`}
                      className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-white p-4 sm:p-5 shadow-sm"
                    >
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-rose-500">
                        {getPropertyDescriptionEmoji(paragraph, property.type)}
                      </p>
                      <p className="text-[15px] leading-8 text-gray-700 sm:text-justify text-left text-pretty">
                        {paragraph}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-8 pb-8 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Características</h2>
                <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {property.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>

              {!isAlquiler && !isLot && !property.alquilada && property.price > 0 && (
                <section className="mb-8 pb-8 border-b border-gray-100">
                  <SimuladorCuota propertyPrice={property.price} propertyTitle={property.title} compact />
                </section>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 flex items-center gap-4">
                  <img src="/Milton.webp" alt="Asesor" loading="lazy" decoding="async" className="w-20 h-20 rounded-full object-cover shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Milton</h3>
                    <p className="text-gray-500 text-sm">Asesor inmobiliario</p>
                    <p className="text-gray-600 text-sm mt-1">Te acompaña en la visita, documentación y cierre de la operación.</p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">Consulta rápida</h3>
                  <p className="text-gray-500 text-sm mb-3">Enviá tu consulta por WhatsApp directamente sobre esta propiedad.</p>
                  <textarea
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    placeholder={`Me interesa "${property.title.slice(0, 40)}...". ¿Está disponible?`}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-500 resize-none mb-3"
                  />
                  <button
                    onClick={handleInquiry}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    Enviar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>

          <PhotoTour
            images={allImages}
            title={property.title}
            isOpen={tourOpen}
            onClose={() => setTourOpen(false)}
            onOpenPhoto={openPhotoFromTour}
          />
          <Lightbox
            images={allImages.map((img) => img.url)}
            title={property.title}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            startIndex={lightboxIndex}
          />
        </div>
      </div>

      {showScheduler && (
        <VisitScheduler property={property} onClose={() => setShowScheduler(false)} />
      )}
      {showInquiry && (
        <PropertyInquiry property={property} onClose={() => setShowInquiry(false)} />
      )}
      {showSheet && (
        <PropertySheet property={property} onClose={() => setShowSheet(false)} />
      )}
      <div className="lg:hidden fixed inset-x-0 bottom-[4.55rem] z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold uppercase tracking-wide text-gray-400">
              {isAlquiler ? "Alquiler mensual" : "Precio"}
            </p>
            <p className="truncate text-lg font-black text-gray-900">{mobilePriceLabel}</p>
          </div>
          <button
            onClick={handleMobilePrimaryAction}
            className="min-h-12 flex-shrink-0 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-200"
          >
            {mobileActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
